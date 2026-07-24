<?php

use App\Models\Contract;
use App\Models\JournalOutput;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();

    Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);
    Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'Dosen']);

    $university = University::factory()->create();

    $this->dosen = User::factory()->create([
        'role_id' => Role::where('name', Role::USER)->first()->id,
        'university_id' => $university->id,
        'is_active' => true,
    ]);

    $proposal = \App\Models\Proposal::factory()->create(['user_id' => $this->dosen->id]);

    $this->contract = Contract::factory()->create([
        'proposal_id' => $proposal->id,
        'party_1' => 'Pihak Pertama',
        'party_2' => 'Pihak Kedua',
        'contract_value' => 50000000,
        'created_by' => $this->dosen->id,
    ]);
});

test('tamu tidak dapat mengakses halaman tambah luaran', function () {
    get(route('user.outputs.create'))
        ->assertRedirect(route('login'));
});

test('dosen dapat mengakses halaman tambah luaran', function () {
    $this->withoutExceptionHandling();
    actingAs($this->dosen)
        ->get(route('user.outputs.create'))
        ->assertOk();
});

test('dosen dapat menyimpan luaran jurnal baru dengan polymorphic relation', function () {
    Storage::fake('public');
    $file = UploadedFile::fake()->create('bukti_jurnal.pdf', 500, 'application/pdf');

    $response = actingAs($this->dosen)
        ->post(route('user.outputs.store-journal'), [
            'contract_id' => $this->contract->id,
            'title' => 'Analisis Algoritma Optimasi',
            'authors' => 'Akyas Zaidan, Budi Rahardjo',
            'journal_name' => 'Jurnal Teknologi Informasi',
            'year' => 2026,
            'volume' => '12',
            'issue' => '2',
            'pages' => '100-115',
            'doi' => '10.12345/jti.v12i2.100',
            'url' => 'https://jurnal.example.com/article/100',
            'issn' => '1234-5678',
            'e_issn' => '8765-4321',
            'publisher' => 'Penerbit Informatika',
        ]);

    $response->assertRedirect(route('user.outputs.index'))
        ->assertSessionHas('success', 'Data Luaran Jurnal berhasil disimpan.');

    assertDatabaseHas('journal_outputs', [
        'journal_name' => 'Jurnal Teknologi Informasi',
        'volume' => '12',
        'number' => '2',
        'doi' => '10.12345/jti.v12i2.100',
        'url' => 'https://jurnal.example.com/article/100',
    ]);

    $journalOutput = JournalOutput::where('journal_name', 'Jurnal Teknologi Informasi')->first();

    assertDatabaseHas('research_outputs', [
        'user_id' => $this->dosen->id,
        'contract_id' => $this->contract->id,
        'jenis_luaran' => 'Jurnal',
        'judul_luaran' => 'Analisis Algoritma Optimasi',
        'tahun_capaian' => 2026,
        'penulis_atau_pencipta' => 'Akyas Zaidan, Budi Rahardjo',
        'status_verifikasi' => 'Draft',
        'outputable_type' => JournalOutput::class,
        'outputable_id' => $journalOutput->id,
    ]);
});

test('validasi gagal jika field wajib luaran jurnal kosong', function () {
    actingAs($this->dosen)
        ->post(route('user.outputs.store-journal'), [])
        ->assertSessionHasErrors(['title', 'authors', 'journal_name', 'year']);
});
