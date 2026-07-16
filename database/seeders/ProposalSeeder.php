<?php

namespace Database\Seeders;

use App\Models\Proposal;
use Illuminate\Database\Seeder;

/**
 * ProposalSeeder
 *
 * Mengisi tabel `proposals` dengan data dummy proposal penelitian.
 * Distribusi data dibuat realistis sesuai alur kerja sistem:
 *
 *  - 5  proposal  Draft       (belum disubmit oleh dosen)
 *  - 8  proposal  Submitted   (menunggu verifikasi admin kampus)
 *  - 5  proposal  Valid       (sudah divalidasi administrasi)
 *  - 2  proposal  Ditolak     (ditolak beserta alasan penolakan)
 *
 * Total: 20 proposal dummy
 *
 * @depends ResearchSchemaSeeder, UserSeeder (harus dijalankan lebih dulu)
 */
class ProposalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 5 proposal berstatus Draft
        Proposal::factory()
            ->count(5)
            ->draft()
            ->create();

        // 8 proposal berstatus Submitted (paling banyak — fokus verifikasi admin)
        Proposal::factory()
            ->count(8)
            ->submitted()
            ->create();

        // 5 proposal sudah divalidasi administrasi
        Proposal::factory()
            ->count(5)
            ->valid()
            ->create();

        // 2 proposal ditolak beserta alasan penolakan
        Proposal::factory()
            ->count(2)
            ->rejected()
            ->create();
    }
}
