<?php

use App\Models\Contract;
use App\Models\ResearchOutput;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

uses(RefreshDatabase::class);

beforeEach(function () {
    Role::firstOrCreate(['name' => Role::SUPER_ADMIN]);
    Role::firstOrCreate(['name' => Role::USER]);

    $university = University::factory()->create();

    $this->dosen = User::factory()->create([
        'role_id' => Role::where('name', Role::USER)->first()->id,
        'university_id' => $university->id,
        'is_active' => true,
    ]);

    $this->contract = Contract::factory()->create([
        'created_by' => $this->dosen->id,
    ]);
});

test('dosen dapat membuat luaran buku baru', function () {
    actingAs($this->dosen)
        ->post(route('user.outputs.storeBook'), [
            'contract_id' => $this->contract->id,
            'jenis_luaran' => 'Buku',
            'judul_luaran' => 'Pemrograman Web Lanjutan',
            'tahun_capaian' => 2025,
            'penulis_atau_pencipta' => 'Dr. Akbar Zaqi',
            'keterangan' => 'Buku ajar',
            'tautan_publikasi' => 'https://example.com/buku',
        ])
        ->assertRedirect(route('user.outputs.index'))
        ->assertSessionHas('message', 'Data buku berhasil disimpan');

    assertDatabaseHas('research_outputs', [
        'judul_luaran' => 'Pemrograman Web Lanjutan',
        'jenis_luaran' => 'Buku',
        'user_id' => $this->dosen->id,
        'status_verifikasi' => 'Draft',
    ]);
});

test('dosen dapat membuat luaran HKI baru', function () {
    $file = UploadedFile::fake()->create('sertifikat.pdf', 100);

    actingAs($this->dosen)
        ->post(route('user.outputs.storeHKI'), [
            'contract_id' => $this->contract->id,
            'judul_luaran' => 'Sistem Informasi Jurnal',
            'tahun_capaian' => 2025,
            'penulis_atau_pencipta' => 'Tim JurnalMu',
            'nomor_paten' => 'PAT-2025-001',
            'jenis_hki' => 'paten',
            'deskripsi' => 'Paten sistem informasi',
            'tautan_publikasi' => 'https://example.com/paten',
            'file_sertifikat_atau_cover' => $file,
        ])
        ->assertRedirect(route('user.outputs.index'))
        ->assertSessionHas('message', 'Data HKI berhasil disimpan');

    assertDatabaseHas('research_outputs', [
        'judul_luaran' => 'Sistem Informasi Jurnal',
        'jenis_luaran' => 'HKI',
        'user_id' => $this->dosen->id,
        'status_verifikasi' => 'Draft',
    ]);
});

test('dosen dapat mengupdate luaran penelitian yang sudah ada', function () {
    $output = ResearchOutput::factory()->create([
        'user_id' => $this->dosen->id,
        'contract_id' => $this->contract->id,
        'jenis_luaran' => 'Buku',
        'judul_luaran' => 'Judul Lama',
        'status_verifikasi' => 'Draft',
    ]);

    actingAs($this->dosen)
        ->put(route('user.outputs.update', $output->id), [
            'contract_id' => $this->contract->id,
            'jenis_luaran' => 'Buku',
            'judul_luaran' => 'Judul Baru',
            'tahun_capaian' => 2026,
            'penulis_atau_pencipta' => 'Dr. Akbar Zaqi',
            'status_verifikasi' => 'Draft',
        ])
        ->assertRedirect(route('user.outputs.index'))
        ->assertSessionHas('message', 'Luaran penelitian berhasil diperbarui');

    assertDatabaseHas('research_outputs', [
        'id' => $output->id,
        'judul_luaran' => 'Judul Baru',
        'tahun_capaian' => 2026,
    ]);
});

test('dosen dapat menghapus luaran penelitian', function () {
    $output = ResearchOutput::factory()->create([
        'user_id' => $this->dosen->id,
        'contract_id' => $this->contract->id,
    ]);

    actingAs($this->dosen)
        ->delete(route('user.outputs.destroy', $output->id))
        ->assertRedirect(route('user.outputs.index'))
        ->assertSessionHas('message', 'Luaran penelitian berhasil dihapus');

    expect(ResearchOutput::find($output->id))->toBeNull();
});

test('dosen hanya dapat mengupdate luaran miliknya sendiri', function () {
    $otherUser = User::factory()->create([
        'role_id' => Role::where('name', Role::USER)->first()->id,
        'university_id' => University::factory()->create()->id,
        'is_active' => true,
    ]);

    $output = ResearchOutput::factory()->create([
        'user_id' => $otherUser->id,
        'contract_id' => $this->contract->id,
    ]);

    actingAs($this->dosen)
        ->put(route('user.outputs.update', $output->id), [
            'contract_id' => $this->contract->id,
            'jenis_luaran' => 'Buku',
            'judul_luaran' => 'Judul Tidak Sah',
            'tahun_capaian' => 2025,
            'penulis_atau_pencipta' => 'Hacker',
            'status_verifikasi' => 'Draft',
        ])
        ->assertForbidden();
});

test('validasi storeHKI bekerja dengan benar', function () {
    actingAs($this->dosen)
        ->post(route('user.outputs.storeHKI'), [])
        ->assertSessionHasErrors(['contract_id', 'judul_luaran', 'tahun_capaian', 'penulis_atau_pencipta', 'nomor_paten', 'jenis_hki', 'file_sertifikat_atau_cover']);
});

test('validasi update bekerja dengan benar', function () {
    $output = ResearchOutput::factory()->create([
        'user_id' => $this->dosen->id,
        'contract_id' => $this->contract->id,
    ]);

    actingAs($this->dosen)
        ->put(route('user.outputs.update', $output->id), [])
        ->assertSessionHasErrors(['contract_id', 'jenis_luaran', 'judul_luaran', 'tahun_capaian', 'penulis_atau_pencipta', 'status_verifikasi']);
});

test('guest tidak dapat mengakses endpoint luaran', function () {
    $output = ResearchOutput::factory()->create([
        'contract_id' => $this->contract->id,
    ]);

    $this->post(route('user.outputs.storeBook'), [])->assertRedirect(route('login'));
    $this->post(route('user.outputs.storeHKI'), [])->assertRedirect(route('login'));
    $this->put(route('user.outputs.update', $output->id), [])->assertRedirect(route('login'));
    $this->delete(route('user.outputs.destroy', $output->id))->assertRedirect(route('login'));
});
