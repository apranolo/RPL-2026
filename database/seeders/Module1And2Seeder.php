<?php

namespace Database\Seeders;

use App\Models\AssessmentCriteria;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Review;
use App\Models\ReviewSchedule;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class Module1And2Seeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🧪 Seeding data untuk Testing Manual Modul 1 & 2...');

        // 1. Ensure Roles
        $reviewerRole = Role::firstOrCreate(['name' => Role::REVIEWER], ['label' => 'Reviewer']);
        $adminKampusRole = Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['label' => 'Admin Kampus']);
        $userRole = Role::firstOrCreate(['name' => Role::USER], ['label' => 'Dosen / Peneliti']);

        // 2. Ensure Users & Reviewers
        $adminUad = User::firstOrCreate(
            ['email' => 'admin.uad@ajm.ac.id'],
            [
                'name' => 'Admin LPPM UAD',
                'password' => Hash::make('password123'),
                'role_id' => $adminKampusRole->id,
            ]
        );
        $adminUad->roles()->syncWithoutDetaching([$adminKampusRole->id]);

        $dosen1 = User::firstOrCreate(
            ['email' => 'andi.prasetyo@uad.ac.id'],
            [
                'name' => 'Dr. Andi Prasetyo, M.T.',
                'password' => Hash::make('password123'),
                'role_id' => $userRole->id,
            ]
        );
        $dosen1->roles()->syncWithoutDetaching([$userRole->id]);

        $dosen2 = User::firstOrCreate(
            ['email' => 'budi.santoso@uad.ac.id'],
            [
                'name' => 'Prof. Dr. Budi Santoso',
                'password' => Hash::make('password123'),
                'role_id' => $userRole->id,
            ]
        );
        $dosen2->roles()->syncWithoutDetaching([$userRole->id]);

        $reviewer1 = User::firstOrCreate(
            ['email' => 'reviewer1@uad.ac.id'],
            [
                'name' => 'Prof. Dr. Eko Wahyudi, M.Kom.',
                'password' => Hash::make('password123'),
                'role_id' => $reviewerRole->id,
                'is_reviewer' => true,
            ]
        );
        $reviewer1->roles()->syncWithoutDetaching([$reviewerRole->id]);

        $reviewer2 = User::firstOrCreate(
            ['email' => 'reviewer2@umy.ac.id'],
            [
                'name' => 'Dr. Rina Astuti, M.Eng.',
                'password' => Hash::make('password123'),
                'role_id' => $reviewerRole->id,
                'is_reviewer' => true,
            ]
        );
        $reviewer2->roles()->syncWithoutDetaching([$reviewerRole->id]);

        $reviewer3 = User::firstOrCreate(
            ['email' => 'reviewer3@ums.ac.id'],
            [
                'name' => 'Dr. Hendra Gunawan, M.Si.',
                'password' => Hash::make('password123'),
                'role_id' => $reviewerRole->id,
                'is_reviewer' => true,
            ]
        );
        $reviewer3->roles()->syncWithoutDetaching([$reviewerRole->id]);

        // 3. Research Schemas
        $schema1 = ResearchSchema::firstOrCreate(['name' => 'Penelitian Dasar Perguruan Tinggi (PDPT)'], ['description' => 'Skema riset berfokus pada pengembangan ilmu pengetahuan dasar dan invensi baru.']);
        $schema2 = ResearchSchema::firstOrCreate(['name' => 'Penelitian Terapan Kemitraan (PTK)'], ['description' => 'Riset terapan berbasis kebutuhan dunia usaha, dunia industri, atau masyarakat.']);
        $schema3 = ResearchSchema::firstOrCreate(['name' => 'Penelitian Kerjasama Antar Perguruan Tinggi (PKPT)'], ['description' => 'Hibah kolaborasi riset antar institusi pendidikan tinggi.']);

        // 4. Proposals (Various states for Modul 1 & 2)

        // Proposal 1: Draft (Modul 1)
        $p1 = Proposal::create([
            'title' => 'Pengembangan Sistem Deteksi Dini Bencana Longsor Berbasis IoT dan Machine Learning',
            'description' => 'Riset ini bertujuan mengembangkan sensor jaringan nirkabel murah dan berakurasi tinggi untuk deteksi pergerakan tanah.',
            'user_id' => $dosen1->id,
            'research_schema_id' => $schema1->id,
            'status_proposal' => 'Draft',
            'file_dokumen_proposal' => 'proposals/draft_proposal_iot.pdf',
        ]);

        // Proposal 2: Submitted (Modul 1 - Menunggu Verifikasi LPPM)
        $p2 = Proposal::create([
            'title' => 'Implementasi Algoritma Deep Learning untuk Klasifikasi Kualitas Produk Agroindustri',
            'description' => 'Metode visi komputer untuk inspeksi visual otomatis kualitas hasil panen secara real-time pada skala pabrik.',
            'user_id' => $dosen2->id,
            'research_schema_id' => $schema2->id,
            'status_proposal' => 'Submitted',
            'file_dokumen_proposal' => 'proposals/proposal_agroindustri.pdf',
        ]);

        // Proposal 3: Administrasi_Valid (Modul 1 & 2 - Siap Penunjukan Reviewer)
        $p3 = Proposal::create([
            'title' => 'Optimasi Smart Grid Energi Terbarukan Berbasis Microgrid Terdistribusi',
            'description' => 'Studi efisiensi transmisi daya listrik tenaga surya dan angin untuk daerah terpencil di DIY.',
            'user_id' => $dosen1->id,
            'research_schema_id' => $schema2->id,
            'status_proposal' => 'Administrasi_Valid',
            'file_dokumen_proposal' => 'proposals/proposal_smartgrid.pdf',
        ]);

        // Proposal 4: Administrasi_Valid (Modul 2 - Sudah Di-assign, In Progress Review)
        $p4 = Proposal::create([
            'title' => 'Analisis Keamanan Siber pada Protokol Komunikasi Kendaraan Otonom (V2X)',
            'description' => 'Evaluasi kerentanan serangan cyber-physical terhadap arsitektur kendaraan otonom.',
            'user_id' => $dosen2->id,
            'research_schema_id' => $schema3->id,
            'status_proposal' => 'Administrasi_Valid',
            'file_dokumen_proposal' => 'proposals/proposal_v2x_cybersecurity.pdf',
        ]);

        // Schedule & Assignment for Proposal 4
        ReviewSchedule::create([
            'proposal_id' => $p4->id,
            'reviewer_id' => $reviewer1->id,
            'assigned_by' => $adminUad->id,
            'assigned_at' => now()->subDays(3),
            'start_date' => now()->subDays(3),
            'end_date' => now()->addDays(7),
            'status' => 'in_progress',
        ]);

        // Proposal 5: Administrasi_Valid (Modul 2 - Selesai Direview oleh Reviewer 1 & 2)
        $p5 = Proposal::create([
            'title' => 'Sintesis Nanomaterial Graphene untuk Baterai Generasi Masa Depan',
            'description' => 'Pengembangan komposit nanostruktur untuk meningkatkan densitas energi dan daya tahan baterai lithium.',
            'user_id' => $dosen1->id,
            'research_schema_id' => $schema1->id,
            'status_proposal' => 'Administrasi_Valid',
            'file_dokumen_proposal' => 'proposals/proposal_graphene_battery.pdf',
        ]);

        // Review 1 for Proposal 5 (Diterima)
        $r1 = Review::create([
            'proposal_id' => $p5->id,
            'reviewer_id' => $reviewer1->id,
            'score' => 88.50,
            'feedback' => 'Metodologi penelitian sangat solid dan kebaruan riset sangat jelas. Anggaran yang diajukan rasional dan sesuai luaran yang dijanjikan.',
            'recommendation' => 'Diterima',
            'reviewed_at' => now()->subDays(1),
            'status' => 'completed',
        ]);

        AssessmentCriteria::create([
            'review_id' => $r1->id,
            'criterion' => 'Relevansi & Urgensi Penelitian',
            'score' => 90,
            'notes' => 'Sangat relevan dengan roadmap riset nasional.',
        ]);
        AssessmentCriteria::create([
            'review_id' => $r1->id,
            'criterion' => 'Kebaruan & State of the Art',
            'score' => 88,
            'notes' => 'Kajian pustaka komprehensif.',
        ]);
        AssessmentCriteria::create([
            'review_id' => $r1->id,
            'criterion' => 'Metodologi & Kelayakan Anggaran',
            'score' => 87,
            'notes' => 'Rencana tahapan eksperimen terstruktur.',
        ]);

        // Review 2 for Proposal 5 (Revisi)
        $r2 = Review::create([
            'proposal_id' => $p5->id,
            'reviewer_id' => $reviewer2->id,
            'score' => 82.00,
            'feedback' => 'Topik penelitian menarik namun perlu perbaikan pada rincian spesifikasi peralatan laboratorium dan luaran publikasi jurnal bereputasi.',
            'recommendation' => 'Revisi',
            'reviewed_at' => now()->subDays(2),
            'status' => 'completed',
        ]);

        AssessmentCriteria::create([
            'review_id' => $r2->id,
            'criterion' => 'Relevansi & Urgensi Penelitian',
            'score' => 85,
            'notes' => 'Topik hangat di bidang energi terbarukan.',
        ]);
        AssessmentCriteria::create([
            'review_id' => $r2->id,
            'criterion' => 'Kebaruan & State of the Art',
            'score' => 80,
            'notes' => 'Perlu penambahan beberapa acuan jurnal internasional 3 tahun terakhir.',
        ]);

        ReviewSchedule::create([
            'proposal_id' => $p5->id,
            'reviewer_id' => $reviewer1->id,
            'assigned_by' => $adminUad->id,
            'assigned_at' => now()->subDays(5),
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(1),
            'status' => 'completed',
        ]);

        ReviewSchedule::create([
            'proposal_id' => $p5->id,
            'reviewer_id' => $reviewer2->id,
            'assigned_by' => $adminUad->id,
            'assigned_at' => now()->subDays(5),
            'start_date' => now()->subDays(5),
            'end_date' => now()->subDays(2),
            'status' => 'completed',
        ]);

        // Proposal 6: Ditolak (Modul 1 - Ditolak Administrasi LPPM)
        Proposal::create([
            'title' => 'Aplikasi Pembelajaran Matematika Berbasis Virtual Reality',
            'description' => 'Media interaktif pembelajaran untuk siswa sekolah menengah.',
            'user_id' => $dosen2->id,
            'research_schema_id' => $schema3->id,
            'status_proposal' => 'Ditolak',
            'rejection_reason' => 'Format surat pernyataan ketua pengusul tidak sesuai dengan petunjuk teknis 2026 dan lampiran tanda tangan belum basah.',
            'file_dokumen_proposal' => 'proposals/proposal_vr_math.pdf',
        ]);

        $this->command->info('✅ Seeding data Modul 1 & Modul 2 berhasil!');
        $this->command->info('');
        $this->command->info('📌 Akun Pengujian yang Siap Digunakan:');
        $this->command->info('   - Admin LPPM (Penunjukan & Decision): admin.uad@ajm.ac.id / password123');
        $this->command->info('   - Dosen Peneliti 1 (Pengusul): andi.prasetyo@uad.ac.id / password123');
        $this->command->info('   - Dosen Peneliti 2 (Pengusul): budi.santoso@uad.ac.id / password123');
        $this->command->info('   - Reviewer 1: reviewer1@uad.ac.id / password123');
        $this->command->info('   - Reviewer 2: reviewer2@umy.ac.id / password123');
        $this->command->info('   - Reviewer 3: reviewer3@ums.ac.id / password123');
    }
}
