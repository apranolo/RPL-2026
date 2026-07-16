<?php

namespace Database\Seeders;

use App\Models\ResearchSchema;
use Illuminate\Database\Seeder;

/**
 * ResearchSchemaSeeder
 *
 * Mengisi tabel `research_schemas` dengan data skema penelitian
 * yang umum digunakan di lingkungan perguruan tinggi Indonesia.
 *
 * Skema ini sesuai dengan kategori Kemendikbudristek / DRTPM:
 * - Penelitian Dasar
 * - Penelitian Terapan
 * - Penelitian Pengembangan
 * - Pengabdian kepada Masyarakat
 */
class ResearchSchemaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $schemas = [
            [
                'name'        => 'Penelitian Dasar',
                'description' => 'Penelitian yang bertujuan menghasilkan pengetahuan baru atau memahami fenomena tanpa orientasi aplikasi langsung. Berfokus pada eksplorasi teori, konsep, dan prinsip dasar ilmu pengetahuan.',
            ],
            [
                'name'        => 'Penelitian Terapan',
                'description' => 'Penelitian yang ditujukan untuk menghasilkan solusi praktis atas permasalahan nyata di masyarakat atau industri. Menerapkan teori yang ada untuk menghasilkan produk, proses, atau metode baru yang berguna.',
            ],
            [
                'name'        => 'Penelitian Pengembangan',
                'description' => 'Penelitian yang berfokus pada pengembangan dan penyempurnaan produk, teknologi, atau sistem yang sudah ada. Mencakup prototipe, pilot project, dan validasi skala besar.',
            ],
            [
                'name'        => 'Pengabdian kepada Masyarakat',
                'description' => 'Kegiatan yang ditujukan untuk memberdayakan dan meningkatkan kualitas hidup masyarakat melalui penerapan ilmu pengetahuan, teknologi, dan seni yang dimiliki oleh perguruan tinggi.',
            ],
        ];

        foreach ($schemas as $schema) {
            ResearchSchema::firstOrCreate(
                ['name' => $schema['name']],
                ['description' => $schema['description']]
            );
        }
    }
}
