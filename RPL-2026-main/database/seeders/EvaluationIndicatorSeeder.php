<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EvaluationIndicatorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $indicators = [
            // ==================== KATEGORI 1: Kelengkapan Administrasi ====================
            [
                'code' => 'ADM-01',
                'category' => 'Kelengkapan Administrasi',
                'sub_category' => 'Identitas Jurnal',
                'question' => 'Apakah jurnal memiliki ISSN yang valid dan terdaftar di ISSN Indonesia?',
                'description' => 'ISSN (International Standard Serial Number) adalah kode identifikasi unik untuk publikasi berkala. Wajib dimiliki oleh jurnal ilmiah. Lampirkan sertifikat ISSN dari LIPI/ANRI.',
                'weight' => 2.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ADM-02',
                'category' => 'Kelengkapan Administrasi',
                'sub_category' => 'Platform Publikasi',
                'question' => 'Apakah jurnal memiliki website resmi yang aktif dan dapat diakses publik 24/7?',
                'description' => 'Website jurnal harus memiliki domain sendiri (bukan subdomain gratisan), berisi informasi lengkap (about, editorial board, submission guidelines, archive), dan dapat diakses tanpa hambatan. Sertakan URL website.',
                'weight' => 1.50,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ADM-03',
                'category' => 'Kelengkapan Administrasi',
                'sub_category' => 'Struktur Organisasi',
                'question' => 'Apakah jurnal memiliki struktur dewan redaksi yang lengkap dengan minimal 10 anggota dari berbagai institusi?',
                'description' => 'Dewan redaksi minimal terdiri dari: Editor-in-Chief (1), Managing Editor (1), Editorial Board Members (min 8 orang) dengan afiliasi institusi yang jelas dan beragam (tidak semua dari institusi penerbit). Sertakan screenshot halaman editorial board.',
                'weight' => 2.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'ADM-04',
                'category' => 'Kelengkapan Administrasi',
                'sub_category' => 'Pedoman Penulisan',
                'question' => 'Apakah jurnal memiliki pedoman penulisan (author guidelines) yang lengkap dan mudah diakses di website?',
                'description' => 'Pedoman penulisan harus mencakup: scope & focus, format artikel, template (download link), gaya sitasi (APA, IEEE, dll), prosedur submission, dan ethical guidelines. Pedoman harus tersedia dalam Bahasa Indonesia dan/atau Inggris.',
                'weight' => 1.00,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 4,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ==================== KATEGORI 2: Kualitas Konten ====================
            [
                'code' => 'KON-01',
                'category' => 'Kualitas Konten',
                'sub_category' => 'Proses Review',
                'question' => 'Apakah jurnal menggunakan sistem peer review dengan minimal double-blind review untuk setiap artikel?',
                'description' => 'Peer review adalah proses evaluasi artikel oleh ahli di bidangnya. Double-blind review memastikan objektivitas (reviewer tidak tahu identitas penulis, dan sebaliknya). Minimal 2 reviewer per artikel. Sertakan dokumen SOP review atau screenshot sistem review.',
                'weight' => 3.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'KON-02',
                'category' => 'Kualitas Konten',
                'sub_category' => 'Keberagaman Penulis',
                'question' => 'Berapa persentase artikel dari penulis eksternal (luar institusi penerbit) dalam volume 1 tahun terakhir?',
                'description' => 'Minimal 50% artikel harus dari penulis eksternal untuk menghindari kesan jurnal internal kampus. Penilaian: 1 = <25% (sangat kurang), 2 = 25-40% (kurang), 3 = 41-60% (cukup), 4 = 61-80% (baik), 5 = >80% (sangat baik). Hitung berdasarkan afiliasi corresponding author.',
                'weight' => 2.50,
                'answer_type' => 'scale',
                'requires_attachment' => false,
                'sort_order' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'KON-03',
                'category' => 'Kualitas Konten',
                'sub_category' => 'Dampak Publikasi',
                'question' => 'Apakah artikel yang dipublikasikan memiliki sitasi dari publikasi lain (terindeks Google Scholar)?',
                'description' => 'Sitasi menunjukkan artikel dibaca dan dirujuk oleh peneliti lain, merupakan indikator kualitas dan dampak publikasi. Minimal 30% artikel dalam 2 tahun terakhir memiliki sitasi. Sertakan screenshot Google Scholar profile jurnal atau data sitasi.',
                'weight' => 2.00,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 7,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'KON-04',
                'category' => 'Kualitas Konten',
                'sub_category' => 'Standarisasi Format',
                'question' => 'Apakah semua artikel menggunakan template yang konsisten dan memenuhi standar penulisan ilmiah internasional?',
                'description' => 'Template harus mencakup: struktur IMRAD (Introduction, Method, Result, and Discussion), abstract dalam 2 bahasa, keywords, format referensi konsisten (APA, IEEE, Harvard, dll), dan layout profesional. Artikel harus dapat diunduh dalam format PDF.',
                'weight' => 1.00,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 8,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // ==================== KATEGORI 3: Proses Editorial ====================
            [
                'code' => 'EDT-01',
                'category' => 'Proses Editorial',
                'sub_category' => 'Standard Operating Procedure',
                'question' => 'Apakah jurnal memiliki SOP review yang terdokumentasi dan dipublikasikan di website?',
                'description' => 'SOP harus mencakup: alur submission lengkap, tahapan review (initial screening, peer review, revision, final decision), kriteria penerimaan/penolakan artikel, timeline setiap tahap, dan prosedur handling complaint. Sertakan link atau dokumen SOP.',
                'weight' => 2.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 9,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EDT-02',
                'category' => 'Proses Editorial',
                'sub_category' => 'Kecepatan Review',
                'question' => 'Berapa lama rata-rata waktu review dari submission hingga keputusan editorial (dalam hari kerja)?',
                'description' => 'Standar ideal: maksimal 90 hari kerja. Penilaian: 1 = >120 hari (sangat lambat), 2 = 91-120 hari (lambat), 3 = 61-90 hari (cukup), 4 = 31-60 hari (baik), 5 = ≤30 hari (sangat baik). Hitung dari data 10 artikel terakhir yang diterbitkan.',
                'weight' => 1.50,
                'answer_type' => 'scale',
                'requires_attachment' => false,
                'sort_order' => 10,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EDT-03',
                'category' => 'Proses Editorial',
                'sub_category' => 'Sistem Manajemen',
                'question' => 'Apakah jurnal menggunakan sistem manajemen jurnal elektronik (OJS, Editorial Manager, ScholarOne, atau sejenisnya)?',
                'description' => 'Sistem manajemen jurnal memudahkan tracking submission, komunikasi dengan reviewer, transparansi proses, dan dokumentasi. Sistem harus berbasis online dan memiliki fitur: author registration, submission tracking, reviewer assignment, dan email notification. Sertakan screenshot dashboard sistem atau link akses demo.',
                'weight' => 2.50,
                'answer_type' => 'boolean',
                'requires_attachment' => false,
                'sort_order' => 11,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'EDT-04',
                'category' => 'Proses Editorial',
                'sub_category' => 'Pengecekan Plagiasi',
                'question' => 'Apakah jurnal melakukan pengecekan plagiasi menggunakan software anti-plagiarism untuk setiap artikel yang masuk?',
                'description' => 'Pengecekan plagiasi wajib dilakukan sebelum proses review untuk menjaga integritas publikasi. Software yang direkomendasikan: Turnitin, iThenticate, Grammarly Plagiarism Checker, atau setara. Standar similarity: maksimal 20% (dengan threshold 3% per sumber). Sertakan screenshot sample report plagiasi.',
                'weight' => 3.00,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 12,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('evaluation_indicators')->insert($indicators);

        // Calculate and display total weight
        $totalWeight = array_sum(array_column($indicators, 'weight'));

        $this->command->info('✅ '.count($indicators).' Evaluation Indicators created successfully!');
        $this->command->info('📊 Total Weight: '.$totalWeight.' points');
        $this->command->info('');
        $this->command->info('📋 Breakdown by category:');
        $this->command->info('  • Kelengkapan Administrasi: 6.50 points (4 indicators)');
        $this->command->info('  • Kualitas Konten: 8.50 points (4 indicators)');
        $this->command->info('  • Proses Editorial: 9.00 points (4 indicators)');
        $this->command->info('');
        $this->command->info('💡 These indicators will be migrated to v1.1 hierarchical structure by DataMigrationSeeder');
    }
}
