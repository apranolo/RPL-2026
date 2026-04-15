<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JournalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get required IDs
        $uadId = DB::table('universities')->where('code', 'UAD')->value('id');
        $umyId = DB::table('universities')->where('code', 'UMY')->value('id');
        $umsId = DB::table('universities')->where('code', 'UMS')->value('id');

        $andiId = DB::table('users')->where('email', 'andi.prasetyo@uad.ac.id')->value('id');
        $dewiId = DB::table('users')->where('email', 'dewi.kartika@uad.ac.id')->value('id');
        $ekoId = DB::table('users')->where('email', 'eko.wijaya@umy.ac.id')->value('id');
        $fitriId = DB::table('users')->where('email', 'fitri.rahmawati@umy.ac.id')->value('id');
        $hendraId = DB::table('users')->where('email', 'hendra.gunawan@ums.ac.id')->value('id');

        $compFieldId = DB::table('scientific_fields')->where('code', 'COMP')->value('id');
        $eduFieldId = DB::table('scientific_fields')->where('code', 'EDU')->value('id');
        $ecoFieldId = DB::table('scientific_fields')->where('code', 'ECO')->value('id');
        $medFieldId = DB::table('scientific_fields')->where('code', 'MED')->value('id');
        $engFieldId = DB::table('scientific_fields')->where('code', 'ENG')->value('id');

        $journals = [
            // UAD Journals
            [
                'university_id' => $uadId,
                'user_id' => $andiId,
                'title' => 'Jurnal Informatika dan Teknologi',
                'issn' => '2088-3714',
                'e_issn' => '2715-3428',
                'url' => 'https://journal.uad.ac.id/index.php/JIFO',
                'publisher' => 'Universitas Ahmad Dahlan',
                'frequency' => 'Triwulanan',
                'first_published_year' => 2015,
                'scientific_field_id' => $compFieldId,

                // SINTA
                'sinta_rank' => 'sinta_3',

                // Dikti Accreditation
                'accreditation_start_year' => 2023,
                'accreditation_end_year' => 2028,
                'accreditation_sk_number' => '105/E/KPT/2023',
                'accreditation_sk_date' => '2023-03-15', // Valid (5 years)

                // Indexations (SINTA 3 → DOAJ + Google Scholar + Garuda)
                'indexations' => json_encode([
                    'DOAJ' => ['indexed_at' => '2021-08-20'],
                    'Google Scholar' => ['indexed_at' => '2019-01-10'],
                    'Garuda' => ['indexed_at' => '2018-05-15'],
                ]),

                'editor_in_chief' => 'Andi Prasetyo, S.Kom, M.T',
                'email' => 'jifo@uad.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'university_id' => $uadId,
                'user_id' => $dewiId,
                'title' => 'Jurnal Pendidikan dan Pembelajaran',
                'issn' => '2337-9294',
                'e_issn' => '2656-7385',
                'url' => 'https://journal.uad.ac.id/index.php/JPP',
                'publisher' => 'Universitas Ahmad Dahlan',
                'frequency' => 'Semesteran',
                'first_published_year' => 2018,
                'scientific_field_id' => $eduFieldId,

                // SINTA
                'sinta_rank' => 'sinta_4',

                // Dikti Accreditation (Expiring Soon - 25 days left)
                'accreditation_start_year' => 2020,
                'accreditation_end_year' => 2026, // Expiring soon
                'accreditation_sk_number' => '087/E/KPT/2020',
                'accreditation_sk_date' => '2020-02-20',

                // Indexations (SINTA 4 → Google Scholar + Garuda)
                'indexations' => json_encode([
                    'Google Scholar' => ['indexed_at' => '2019-03-15'],
                    'Garuda' => ['indexed_at' => '2018-11-20'],
                ]),

                'editor_in_chief' => 'Dewi Kartika, S.Pd, M.Pd',
                'email' => 'jpp@uad.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // UMY Journals
            [
                'university_id' => $umyId,
                'user_id' => $ekoId,
                'title' => 'Jurnal Manajemen dan Bisnis',
                'issn' => '1412-3789',
                'e_issn' => '2541-1233',
                'url' => 'https://journal.umy.ac.id/index.php/jmb',
                'publisher' => 'Universitas Muhammadiyah Yogyakarta',
                'frequency' => 'Triwulanan',
                'first_published_year' => 2010,
                'scientific_field_id' => $ecoFieldId,

                // SINTA
                'sinta_rank' => 'sinta_2',

                // Dikti Accreditation
                'accreditation_start_year' => 2022,
                'accreditation_end_year' => 2027,
                'accreditation_sk_number' => '042/E/KPT/2022',
                'accreditation_sk_date' => '2022-07-10', // Valid

                // Indexations (SINTA 2 → Scopus + WoS + DOAJ + Google Scholar)
                'indexations' => json_encode([
                    'Scopus' => ['indexed_at' => '2020-05-15'],
                    'WoS' => ['indexed_at' => '2021-11-20'],
                    'DOAJ' => ['indexed_at' => '2019-08-10'],
                    'Google Scholar' => ['indexed_at' => '2018-02-05'],
                    'Garuda' => ['indexed_at' => '2017-06-01'],
                ]),

                'editor_in_chief' => 'Eko Wijaya, S.E, M.M',
                'email' => 'jmb@umy.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'university_id' => $umyId,
                'user_id' => $fitriId,
                'title' => 'Jurnal Keperawatan dan Kesehatan Masyarakat',
                'issn' => '2089-7154',
                'e_issn' => '2656-8969',
                'url' => 'https://journal.umy.ac.id/index.php/jkkm',
                'publisher' => 'Universitas Muhammadiyah Yogyakarta',
                'frequency' => 'Triwulanan',
                'first_published_year' => 2012,
                'scientific_field_id' => $medFieldId,

                // SINTA
                'sinta_rank' => 'sinta_3',

                // Dikti Accreditation (Expired 30 days ago)
                'accreditation_start_year' => 2019,
                'accreditation_end_year' => 2025, // Expired
                'accreditation_sk_number' => '061/E/KPT/2019',
                'accreditation_sk_date' => '2019-12-15',

                // Indexations (SINTA 3 → DOAJ + Google Scholar + Copernicus)
                'indexations' => json_encode([
                    'DOAJ' => ['indexed_at' => '2021-03-25'],
                    'Copernicus' => ['indexed_at' => '2020-09-15'],
                    'Google Scholar' => ['indexed_at' => '2019-04-10'],
                    'Garuda' => ['indexed_at' => '2018-07-20'],
                ]),

                'editor_in_chief' => 'Fitri Rahmawati, S.Kep, Ns, M.Kep',
                'email' => 'jkkm@umy.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // UMS Journal
            [
                'university_id' => $umsId,
                'user_id' => $hendraId,
                'title' => 'Jurnal Teknik Sipil dan Arsitektur',
                'issn' => '1410-2528',
                'e_issn' => '2549-5658',
                'url' => 'https://journals.ums.ac.id/index.php/JTSA',
                'publisher' => 'Universitas Muhammadiyah Surakarta',
                'frequency' => 'Semesteran',
                'first_published_year' => 2008,
                'scientific_field_id' => $engFieldId,

                // SINTA
                'sinta_rank' => 'sinta_4',

                // Dikti Accreditation
                'accreditation_start_year' => 2021,
                'accreditation_end_year' => 2026,
                'accreditation_sk_number' => '098/E/KPT/2021',
                'accreditation_sk_date' => '2021-10-05', // Valid

                // Indexations (SINTA 4 → DOAJ + Google Scholar)
                'indexations' => json_encode([
                    'DOAJ' => ['indexed_at' => '2022-02-10'],
                    'Google Scholar' => ['indexed_at' => '2019-06-15'],
                    'Garuda' => ['indexed_at' => '2018-03-05'],
                    'BASE' => ['indexed_at' => '2021-08-20'],
                ]),

                'editor_in_chief' => 'Hendra Gunawan, S.T, M.T',
                'email' => 'jtsa@ums.ac.id',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('journals')->insert($journals);

        $this->command->info(count($journals).' Sample Journals created successfully!');
    }
}
