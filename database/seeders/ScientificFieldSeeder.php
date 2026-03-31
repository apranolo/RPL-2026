<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ScientificFieldSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fields = [
            [
                'code' => 'COMP',
                'name' => 'Ilmu Komputer dan Teknologi Informasi',
                'description' => 'Meliputi informatika, sistem informasi, dan teknologi informasi',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'MED',
                'name' => 'Ilmu Kedokteran dan Kesehatan',
                'description' => 'Meliputi kedokteran umum, kedokteran gigi, keperawatan, farmasi',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EDU',
                'name' => 'Ilmu Pendidikan',
                'description' => 'Meliputi pendidikan guru, manajemen pendidikan, teknologi pendidikan',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ENG',
                'name' => 'Teknik dan Teknologi',
                'description' => 'Meliputi teknik sipil, elektro, mesin, industri',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'SOC',
                'name' => 'Ilmu Sosial dan Politik',
                'description' => 'Meliputi sosiologi, hubungan internasional, ilmu komunikasi',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ECO',
                'name' => 'Ekonomi dan Bisnis',
                'description' => 'Meliputi manajemen, akuntansi, ekonomi pembangunan',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'LAW',
                'name' => 'Ilmu Hukum',
                'description' => 'Meliputi hukum perdata, pidana, tata negara, ekonomi syariah',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'AGR',
                'name' => 'Pertanian dan Peternakan',
                'description' => 'Meliputi agronomi, peternakan, teknologi pangan',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'PSY',
                'name' => 'Psikologi',
                'description' => 'Meliputi psikologi klinis, pendidikan, industri',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'REL',
                'name' => 'Ilmu Agama Islam',
                'description' => 'Meliputi studi Islam, pendidikan agama Islam, ekonomi syariah',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'MULTI',
                'name' => 'Multidisiplin',
                'description' => 'Meliputi berbagai disiplin ilmu atau lintas disiplin',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('scientific_fields')->insert($fields);

        $this->command->info(count($fields).' Scientific fields seeded successfully.');
    }
}
