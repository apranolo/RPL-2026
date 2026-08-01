<?php

use App\Models\ResearchOutput;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

test('halaman detail luaran publik dapat diakses', function () {
    $this->withoutVite();

    Schema::disableForeignKeyConstraints();

    $user = User::factory()->create();

    // Sesuai Review: Menggunakan nama kolom database yang sah
    $output = ResearchOutput::create([
        'proposal_id' => 1,
        'user_id' => $user->id,
        'jenis_luaran' => 'jurnal',                          // Kolom resmi
        'judul_luaran' => 'Penelitian Pengujian Sistem UAD 2026', // Kolom resmi
        'status_verifikasi' => 'approved',                        // Kolom resmi
    ]);

    Schema::enableForeignKeyConstraints();

    $response = $this->get(route('public.outputs.show', $output->id));

    $response->assertStatus(200);
});
