<?php

use App\Models\BookOutput;
use App\Models\HkiOutput;
use App\Models\JournalOutput;
use App\Models\ProductOutput;
use App\Models\ResearchOutput;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\delete;
use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\put;

test('user can view edit form for their own research output', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Test Journal Article',
        'status_verifikasi' => 'Draft',
    ]);
    JournalOutput::factory()->for($output, 'researchOutput')->create([
        'doi' => '10.1000/test',
        'journal_name' => 'Test Journal',
    ]);

    actingAs($user);

    get(route('user.outputs.edit', $output))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Output/Edit')
            ->has('output', fn ($output) => $output
                ->where('id', $output->id)
                ->where('judul_luaran', 'Test Journal Article')
            )
        );
});

test('user cannot view edit form for other users research output', function () {
    $this->seedRoles();
    $user1 = User::factory()->user()->create();
    $user2 = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user1)->create();

    actingAs($user2);

    get(route('user.outputs.edit', $output))->assertForbidden();
});

test('user can update their research output with journal details', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Old Title',
        'status_verifikasi' => 'Draft',
    ]);
    $journal = JournalOutput::factory()->for($output, 'researchOutput')->create([
        'doi' => '10.1000/old',
        'journal_name' => 'Old Journal',
    ]);

    actingAs($user);

    put(route('user.outputs.update', $output), [
        'kategori' => 'Jurnal',
        'judul' => 'Updated Journal Article',
        'link_url' => 'https://scholar.google.com/updated',
        'status' => 'Menunggu_Verifikasi',
        'keterangan' => 'Updated description',
        'metadata' => [
            'doi' => '10.1000/updated',
            'nama_jurnal' => 'Updated Journal',
            'volume' => '2',
            'halaman' => '10-20',
        ],
    ])->assertRedirect(route('user.outputs.index'))
        ->assertSessionHas('message', 'Output berhasil diperbarui');

    assertDatabaseHas('research_outputs', [
        'id' => $output->id,
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Updated Journal Article',
        'status_verifikasi' => 'Menunggu_Verifikasi',
        'keterangan' => 'Updated description',
    ]);

    $journal->refresh();
    expect($journal->doi)->toBe('10.1000/updated')
        ->and($journal->journal_name)->toBe('Updated Journal')
        ->and($journal->volume)->toBe('2')
        ->and($journal->number)->toBe('10-20')
        ->and($journal->url)->toBe('https://scholar.google.com/updated');
});

test('user can update their research output with book details', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Buku',
        'judul_luaran' => 'Old Book Title',
        'status_verifikasi' => 'Draft',
    ]);
    BookOutput::factory()->for($output, 'researchOutput')->create([
        'isbn' => '978-old',
        'publisher' => 'Old Publisher',
    ]);

    actingAs($user);

    put(route('user.outputs.update', $output), [
        'kategori' => 'Buku',
        'judul' => 'Updated Book Title',
        'status' => 'Terverifikasi_LPPM',
        'metadata' => [
            'isbn' => '978-updated',
            'penerbit' => 'Updated Publisher',
            'halaman' => '200',
        ],
    ])->assertRedirect(route('user.outputs.index'));

    assertDatabaseHas('research_outputs', [
        'id' => $output->id,
        'jenis_luaran' => 'Buku',
        'judul_luaran' => 'Updated Book Title',
        'status_verifikasi' => 'Terverifikasi_LPPM',
    ]);

    $book = BookOutput::where('research_output_id', $output->id)->first();
    expect($book->isbn)->toBe('978-updated')
        ->and($book->publisher)->toBe('Updated Publisher')
        ->and($book->pages)->toBe(200);
});

test('user can update their research output with hki details', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'HKI',
        'judul_luaran' => 'Old Patent',
        'status_verifikasi' => 'Draft',
    ]);
    HkiOutput::factory()->for($output, 'researchOutput')->create([
        'patent_number' => 'OLD123',
        'patent_type' => 'Paten',
    ]);

    actingAs($user);

    put(route('user.outputs.update', $output), [
        'kategori' => 'HKI',
        'judul' => 'Updated Patent',
        'status' => 'Menunggu_Verifikasi',
        'metadata' => [
            'nomor_paten' => 'NEW456',
            'jenis_paten' => 'Paten Sederhana',
        ],
    ])->assertRedirect(route('user.outputs.index'));

    assertDatabaseHas('research_outputs', [
        'id' => $output->id,
        'jenis_luaran' => 'HKI',
        'judul_luaran' => 'Updated Patent',
        'status_verifikasi' => 'Menunggu_Verifikasi',
    ]);

    $hki = HkiOutput::where('research_output_id', $output->id)->first();
    expect($hki->patent_number)->toBe('NEW456')
        ->and($hki->patent_type)->toBe('Paten Sederhana');
});

test('user can update their research output with product details', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Produk',
        'judul_luaran' => 'Old Product',
        'status_verifikasi' => 'Draft',
    ]);
    ProductOutput::factory()->for($output, 'researchOutput')->create([
        'partner_institution' => 'Old Partner',
        'benefits_description' => 'Old description',
    ]);

    actingAs($user);

    put(route('user.outputs.update', $output), [
        'kategori' => 'Produk',
        'judul' => 'Updated Product',
        'status' => 'Terverifikasi_LPPM',
        'metadata' => [
            'nama_prototipe' => 'New Partner',
            'deskripsi_produk' => 'New description',
        ],
    ])->assertRedirect(route('user.outputs.index'));

    assertDatabaseHas('research_outputs', [
        'id' => $output->id,
        'jenis_luaran' => 'Produk',
        'judul_luaran' => 'Updated Product',
        'status_verifikasi' => 'Terverifikasi_LPPM',
    ]);

    $product = ProductOutput::where('research_output_id', $output->id)->first();
    expect($product->partner_institution)->toBe('New Partner')
        ->and($product->benefits_description)->toBe('New description');
});

test('user can upload new file when updating research output', function () {
    $this->seedRoles();
    Storage::fake('public');
    
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Test Article',
        'status_verifikasi' => 'Draft',
        'file_sertifikat_atau_cover' => 'outputs/old-file.pdf',
    ]);
    JournalOutput::factory()->for($output, 'researchOutput')->create();

    // Create a fake file in storage
    Storage::disk('public')->put('outputs/old-file.pdf', 'old content');

    actingAs($user);

    $newFile = \Illuminate\Http\UploadedFile::fake()->create('new-document.pdf', 100, 'pdf');

    put(route('user.outputs.update', $output), [
        'kategori' => 'Jurnal',
        'judul' => 'Test Article',
        'status' => 'Menunggu_Verifikasi',
        'file' => $newFile,
    ])->assertRedirect(route('user.outputs.index'));

    assertDatabaseHas('research_outputs', [
        'id' => $output->id,
    ]);

    $output->refresh();
    expect($output->file_sertifikat_atau_cover)->not->toBe('outputs/old-file.pdf');
    Storage::disk('public')->assertMissing('outputs/old-file.pdf');
    Storage::disk('public')->assertExists($output->file_sertifikat_atau_cover);
});

test('user can delete their research output', function () {
    $this->seedRoles();
    Storage::fake('public');
    
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Test Article',
        'status_verifikasi' => 'Draft',
        'file_sertifikat_atau_cover' => 'outputs/test-file.pdf',
    ]);
    JournalOutput::factory()->for($output, 'researchOutput')->create();

    Storage::disk('public')->put('outputs/test-file.pdf', 'test content');

    actingAs($user);

    delete(route('user.outputs.destroy', $output))
        ->assertRedirect(route('user.outputs.index'))
        ->assertSessionHas('message', 'Output berhasil dihapus');

    assertDatabaseMissing('research_outputs', ['id' => $output->id]);
    assertDatabaseMissing('journal_outputs', ['research_output_id' => $output->id]);
    Storage::disk('public')->assertMissing('outputs/test-file.pdf');
});

test('user cannot delete other users research output', function () {
    $this->seedRoles();
    $user1 = User::factory()->user()->create();
    $user2 = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user1)->create([
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Test Article',
        'status_verifikasi' => 'Draft',
    ]);
    JournalOutput::factory()->for($output, 'researchOutput')->create();

    actingAs($user2);

    delete(route('user.outputs.destroy', $output))->assertForbidden();
    
    assertDatabaseHas('research_outputs', ['id' => $output->id]);
});

test('update validates required fields', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Test Article',
        'status_verifikasi' => 'Draft',
    ]);
    JournalOutput::factory()->for($output, 'researchOutput')->create();

    actingAs($user);

    put(route('user.outputs.update', $output), [
        'kategori' => '',
        'judul' => '',
        'status' => '',
    ])->assertSessionHasErrors(['kategori', 'judul', 'status']);
});

test('update validates kategori enum', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Test Article',
        'status_verifikasi' => 'Draft',
    ]);
    JournalOutput::factory()->for($output, 'researchOutput')->create();

    actingAs($user);

    put(route('user.outputs.update', $output), [
        'kategori' => 'InvalidCategory',
        'judul' => 'Test',
        'status' => 'Draft',
    ])->assertSessionHasErrors('kategori');
});

test('update validates file mime type and size', function () {
    $this->seedRoles();
    $user = User::factory()->user()->create();
    $output = ResearchOutput::factory()->for($user)->create([
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Test Article',
        'status_verifikasi' => 'Draft',
    ]);
    JournalOutput::factory()->for($output, 'researchOutput')->create();

    actingAs($user);

    $invalidFile = \Illuminate\Http\UploadedFile::fake()->create('test.exe', 100, 'exe');

    put(route('user.outputs.update', $output), [
        'kategori' => 'Jurnal',
        'judul' => 'Test',
        'status' => 'Draft',
        'file' => $invalidFile,
    ])->assertSessionHasErrors('file');

    $largeFile = \Illuminate\Http\UploadedFile::fake()->create('large.pdf', 20000, 'pdf'); // 20MB > 10MB

    put(route('user.outputs.update', $output), [
        'kategori' => 'Jurnal',
        'judul' => 'Test',
        'status' => 'Draft',
        'file' => $largeFile,
    ])->assertSessionHasErrors('file');
});