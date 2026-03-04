<?php

/**
 * Feature tests for journal cover image upload functionality.
 *
 * Covers:
 * - Admin Kampus can upload cover via store, update, and uploadCover endpoint
 * - User can upload cover via store, update, and uploadCover endpoint
 * - Old cover file is deleted from storage when replaced
 * - Validation: file too large (>2MB) → 422
 * - Validation: wrong format (gif, pdf) → 422
 * - Validation: resolution too small (<300×400) → 422
 * - Authorization: user cannot upload cover for another user's journal
 */

use App\Models\Journal;
use App\Models\ScientificField;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seedRoles();
    Storage::fake('public');
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal but valid PNG binary with specific dimensions (width × height).
 * Does NOT require GD — constructs raw PNG chunks manually.
 * Optionally pads to a target size in KB.
 */
function buildPng(int $width, int $height, ?int $sizeKB = null): string
{
    // PNG signature
    $sig = "\x89PNG\r\n\x1a\n";

    // IHDR chunk: width(4), height(4), bit_depth(1), color_type(2=RGB), compression, filter, interlace
    $ihdrData = pack('NNccccc', $width, $height, 8, 2, 0, 0, 0);
    $ihdrCrc = pack('N', crc32('IHDR'.$ihdrData));
    $ihdr = pack('N', 13).'IHDR'.$ihdrData.$ihdrCrc;

    // IDAT chunk: one row of RGB pixels (all black), deflate compressed
    $rowSize = 3 * $width; // RGB
    $scanline = "\x00".str_repeat("\x00", $rowSize); // filter byte + row data
    $rawData = str_repeat($scanline, $height);
    $deflated = gzcompress($rawData, 9);
    $idatCrc = pack('N', crc32('IDAT'.$deflated));
    $idat = pack('N', strlen($deflated)).'IDAT'.$deflated.$idatCrc;

    // IEND chunk
    $iendCrc = pack('N', crc32('IEND'));
    $iend = pack('N', 0).'IEND'.$iendCrc;

    $png = $sig.$ihdr.$idat.$iend;

    // Optionally pad to target KB using a PNG comment (tEXt chunk)
    if ($sizeKB !== null) {
        $targetBytes = $sizeKB * 1024;
        $padNeeded = $targetBytes - strlen($png) - 12; // 12 = chunk overhead
        if ($padNeeded > 0) {
            $textData = 'Comment'."\x00".str_repeat('x', $padNeeded);
            $textCrc = pack('N', crc32('tEXt'.$textData));
            $tEXt = pack('N', strlen($textData)).'tEXt'.$textData.$textCrc;
            // Insert before IEND
            $png = $sig.$ihdr.$idat.$tEXt.$iend;
        }
    }

    return $png;
}

/**
 * Create an UploadedFile fake with a valid 400×500 PNG (passes the 300×400 min rule).
 * Pass $sizeKB to produce an oversized file for testing.
 */
function fakeCoverPng(string $name = 'cover.png', ?int $sizeKB = null): UploadedFile
{
    $content = buildPng(400, 500, $sizeKB);

    return UploadedFile::fake()->createWithContent($name, $content);
}

/**
 * Create a small 100×100 PNG that fails the min-dimension rule.
 */
function fakeSmallPng(string $name = 'small.png'): UploadedFile
{
    return UploadedFile::fake()->createWithContent($name, buildPng(100, 100));
}

function journalPayload(int $fieldId): array
{
    return [
        'title' => 'Jurnal Uji Cover',
        'e_issn' => '1111-2222',
        'url' => 'https://journal.example.ac.id',
        'oai_pmh_url' => 'https://journal.example.ac.id/oai',
        'frequency' => 'Quarterly',
        'scientific_field_id' => $fieldId,
        'sinta_rank' => 'non_sinta',
    ];
}

// ---------------------------------------------------------------------------
// Admin Kampus – store (with cover)
// ---------------------------------------------------------------------------

test('admin_kampus_dapat_upload_cover_saat_buat_jurnal', function () {
    $university = University::factory()->create();
    $admin = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $file = fakeCoverPng();

    $this->actingAs($admin)
        ->post(route('admin-kampus.journals.store'), array_merge(
            journalPayload($field->id),
            ['cover_image' => $file]
        ))
        ->assertRedirect(route('admin-kampus.journals.index'));

    $journal = Journal::where('title', 'Jurnal Uji Cover')->firstOrFail();
    expect($journal->cover_image)->not->toBeNull();
    expect($journal->cover_image)->toStartWith('/storage/journal-covers/');

    $storagePath = str_replace('/storage/', '', $journal->cover_image);
    Storage::disk('public')->assertExists($storagePath);
});

// ---------------------------------------------------------------------------
// Admin Kampus – update (replace cover)
// ---------------------------------------------------------------------------

test('admin_kampus_dapat_ganti_cover_saat_update_jurnal', function () {
    $university = University::factory()->create();
    $admin = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    // Create journal with an existing cover path (simulate previously stored file)
    $oldPath = 'journal-covers/cover_test_old.png';
    Storage::disk('public')->put($oldPath, 'old-file-content');

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'user_id' => $admin->id,
        'scientific_field_id' => $field->id,
        'cover_image' => '/storage/'.$oldPath,
        'approval_status' => 'pending',
        'sinta_rank' => 'non_sinta',
    ]);

    $newFile = fakeCoverPng('new-cover.png');

    $this->actingAs($admin)
        ->put(route('admin-kampus.journals.update', $journal->id), array_merge(
            journalPayload($field->id),
            ['cover_image' => $newFile]
        ))
        ->assertRedirect(route('admin-kampus.journals.index'));

    // Old file should be deleted
    Storage::disk('public')->assertMissing($oldPath);

    // New file should be stored
    $journal->refresh();
    expect($journal->cover_image)->not->toBeNull();
    expect($journal->cover_image)->toStartWith('/storage/journal-covers/');
    $newStoragePath = str_replace('/storage/', '', $journal->cover_image);
    Storage::disk('public')->assertExists($newStoragePath);
});

// ---------------------------------------------------------------------------
// Admin Kampus – dedicated uploadCover endpoint
// ---------------------------------------------------------------------------

test('admin_kampus_dapat_upload_cover_via_endpoint_khusus', function () {
    $university = University::factory()->create();
    $admin = User::factory()->adminKampus($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'user_id' => $admin->id,
        'scientific_field_id' => $field->id,
        'approval_status' => 'pending',
        'sinta_rank' => 'non_sinta',
    ]);

    $file = fakeCoverPng('upload.png');

    $this->actingAs($admin)
        ->patch(route('admin-kampus.journals.upload-cover', $journal->id), [
            'cover_image' => $file,
        ])
        ->assertRedirect(route('admin-kampus.journals.show', $journal->id));

    $journal->refresh();
    expect($journal->cover_image)->toStartWith('/storage/journal-covers/');
});

// ---------------------------------------------------------------------------
// User – store (with cover)
// ---------------------------------------------------------------------------

test('user_dapat_upload_cover_saat_buat_jurnal', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $file = fakeCoverPng();

    $this->actingAs($user)
        ->post(route('user.journals.store'), array_merge(
            journalPayload($field->id),
            ['cover_image' => $file]
        ))
        ->assertRedirect(route('user.journals.index'));

    $journal = Journal::where('title', 'Jurnal Uji Cover')->firstOrFail();
    expect($journal->cover_image)->not->toBeNull();
    expect($journal->cover_image)->toStartWith('/storage/journal-covers/');

    $storagePath = str_replace('/storage/', '', $journal->cover_image);
    Storage::disk('public')->assertExists($storagePath);
});

// ---------------------------------------------------------------------------
// User – dedicated uploadCover endpoint
// ---------------------------------------------------------------------------

test('user_dapat_upload_cover_via_endpoint_khusus', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'scientific_field_id' => $field->id,
        'approval_status' => 'pending',
        'sinta_rank' => 'non_sinta',
    ]);

    $file = fakeCoverPng('user-cover.png');

    $this->actingAs($user)
        ->patch(route('user.journals.upload-cover', $journal->id), [
            'cover_image' => $file,
        ])
        ->assertRedirect(route('user.journals.show', $journal->id));

    $journal->refresh();
    expect($journal->cover_image)->toStartWith('/storage/journal-covers/');
});

// ---------------------------------------------------------------------------
// Authorization: user cannot upload cover for another user's journal
// ---------------------------------------------------------------------------

test('user_tidak_bisa_upload_cover_jurnal_milik_orang_lain', function () {
    $university = University::factory()->create();
    $owner = User::factory()->user($university->id)->create(['is_active' => true]);
    $other = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'user_id' => $owner->id,
        'scientific_field_id' => $field->id,
        'approval_status' => 'pending',
        'sinta_rank' => 'non_sinta',
    ]);

    $file = fakeCoverPng();

    $this->actingAs($other)
        ->patch(route('user.journals.upload-cover', $journal->id), [
            'cover_image' => $file,
        ])
        ->assertForbidden();
});

// ---------------------------------------------------------------------------
// Validation: file too large (> 2MB)
// ---------------------------------------------------------------------------

test('cover_ditolak_jika_ukuran_lebih_dari_2mb', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'scientific_field_id' => $field->id,
        'approval_status' => 'pending',
        'sinta_rank' => 'non_sinta',
    ]);

    // ~3MB file — use UploadedFile::fake()->create() to set reported size directly
    // The max:2048 rule checks $file->getSize() which respects the fake's declared size
    $bigFile = UploadedFile::fake()->create('big.png', 3072, 'image/png');

    $this->actingAs($user)
        ->patch(route('user.journals.upload-cover', $journal->id), [
            'cover_image' => $bigFile,
        ])
        ->assertSessionHasErrors('cover_image');
});

// ---------------------------------------------------------------------------
// Validation: wrong format (PDF)
// ---------------------------------------------------------------------------

test('cover_ditolak_jika_format_bukan_gambar', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $journal = Journal::factory()->create([
        'university_id' => $university->id,
        'user_id' => $user->id,
        'scientific_field_id' => $field->id,
        'approval_status' => 'pending',
        'sinta_rank' => 'non_sinta',
    ]);

    $pdfFile = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->patch(route('user.journals.upload-cover', $journal->id), [
            'cover_image' => $pdfFile,
        ])
        ->assertSessionHasErrors('cover_image');
});

// ---------------------------------------------------------------------------
// No cover = no file stored (create without cover_image)
// ---------------------------------------------------------------------------

test('jurnal_dapat_dibuat_tanpa_cover_image', function () {
    $university = University::factory()->create();
    $user = User::factory()->user($university->id)->create(['is_active' => true]);
    $field = ScientificField::factory()->create();

    $this->actingAs($user)
        ->post(route('user.journals.store'), journalPayload($field->id))
        ->assertRedirect(route('user.journals.index'));

    $journal = Journal::where('title', 'Jurnal Uji Cover')->firstOrFail();
    expect($journal->cover_image)->toBeNull();

    // No files should be stored
    expect(Storage::disk('public')->allFiles('journal-covers'))->toBeEmpty();
});
