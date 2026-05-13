<?php

namespace Database\Seeders;

use App\Models\Pembinaan;
use App\Models\PembinaanRegistration;
use App\Models\PembinaanRegistrationAttachment;
use App\Models\PembinaanReview;
use App\Models\ReviewerAssignment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PembinaanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Creates comprehensive test data for the Pembinaan (Coaching/Training) system:
     * - Training programs (akreditasi & indeksasi)
     * - Journal registrations (pending, approved, rejected)
     * - Reviewer assignments
     * - Reviews with scores and feedback
     * - Document attachments
     */
    public function run(): void
    {
        $this->command->info('🎓 Seeding Pembinaan System Data...');

        // Get required IDs
        $journalIds = DB::table('journals')->pluck('id', 'title')->toArray();
        $userIds = DB::table('users')->pluck('id', 'email')->toArray();
        $templateIds = DB::table('accreditation_templates')->pluck('id', 'name')->toArray();
        $superAdminId = DB::table('users')->where('role_id', DB::table('roles')->where('name', 'Super Admin')->value('id'))->value('id');

        if (empty($journalIds) || empty($userIds)) {
            $this->command->warn('⚠️  Required data (journals or users) not found. Skipping pembinaan seeding.');

            return;
        }

        // Create Pembinaan Programs
        $programs = $this->createPrograms($templateIds, $superAdminId);

        // Create Registrations
        $registrations = $this->createRegistrations($programs, $journalIds, $userIds);

        // Create Attachments for Registrations
        $this->createAttachments($registrations, $userIds);

        // Create Reviewer Assignments
        $assignments = $this->createReviewerAssignments($registrations, $userIds);

        // Create Reviews
        $this->createReviews($assignments, $userIds);

        $this->command->info('✅ Pembinaan System Data Seeded Successfully!');
    }

    /**
     * Create sample pembinaan programs
     */
    private function createPrograms(array $templateIds, int $createdBy): array
    {
        $this->command->info('  → Creating pembinaan programs...');

        $programs = [];

        // Program 1: Active - Akreditasi SINTA 1-3 (Currently accepting registrations)
        $programs[] = Pembinaan::create([
            'name' => 'Program Akreditasi Jurnal SINTA 1-3 Tahun 2026',
            'description' => 'Program pembinaan untuk jurnal yang menargetkan akreditasi SINTA tingkat 1, 2, atau 3. Program ini memberikan bimbingan teknis pengelolaan jurnal, peningkatan kualitas artikel, dan persiapan akreditasi sesuai standar BAN-PT 2024.',
            'category' => 'akreditasi',
            'accreditation_template_id' => $templateIds['BAN-PT 2024 - Akreditasi Jurnal Ilmiah'] ?? null,
            'registration_start' => now()->subDays(5), // Started 5 days ago
            'registration_end' => now()->addDays(25), // Closes in 25 days
            'assessment_start' => now()->addDays(30),
            'assessment_end' => now()->addDays(90),
            'quota' => 20,
            'status' => 'active',
            'created_by' => $createdBy,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Program 2: Active - Akreditasi SINTA 4-6 (In assessment phase)
        $programs[] = Pembinaan::create([
            'name' => 'Program Akreditasi Jurnal SINTA 4-6 Semester 1/2026',
            'description' => 'Program pembinaan bagi jurnal yang menargetkan akreditasi SINTA tingkat 4, 5, atau 6. Fokus pada standar minimal akreditasi, sistem peer review, dan peningkatan visibilitas jurnal.',
            'category' => 'akreditasi',
            'accreditation_template_id' => $templateIds['BAN-PT 2024 - Akreditasi Jurnal Ilmiah'] ?? null,
            'registration_start' => now()->subDays(60),
            'registration_end' => now()->subDays(30), // Closed 30 days ago
            'assessment_start' => now()->subDays(25),
            'assessment_end' => now()->addDays(35),
            'quota' => 30,
            'status' => 'active',
            'created_by' => $createdBy,
            'created_at' => now()->subDays(60),
            'updated_at' => now()->subDays(30),
        ]);

        // Program 3: Draft - Indeksasi Scopus/WoS (Upcoming)
        $programs[] = Pembinaan::create([
            'name' => 'Program Persiapan Indeksasi Scopus/Web of Science 2026',
            'description' => 'Program intensif untuk mempersiapkan jurnal mengajukan indeksasi ke Scopus atau Web of Science. Mencakup workshop editorial board internasional, peningkatan kualitas publikasi, dan strategi submission.',
            'category' => 'indeksasi',
            'accreditation_template_id' => $templateIds['Scopus 2024 - Indeksasi Jurnal Internasional'] ?? null,
            'registration_start' => now()->addDays(15),
            'registration_end' => now()->addDays(45),
            'assessment_start' => now()->addDays(50),
            'assessment_end' => now()->addDays(120),
            'quota' => 10,
            'status' => 'draft',
            'created_by' => $createdBy,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('     ✓ Created '.count($programs).' programs');

        return $programs;
    }

    /**
     * Create sample registrations with varied statuses
     */
    private function createRegistrations(array $programs, array $journalIds, array $userIds): array
    {
        $this->command->info('  → Creating pembinaan registrations...');

        $registrations = [];
        $adminKampusUAD = $userIds['admin.uad@ajm.ac.id'] ?? null;
        $adminKampusUMY = $userIds['admin.umy@ajm.ac.id'] ?? null;
        $adminKampusUMS = $userIds['admin.ums@ajm.ac.id'] ?? null;

        // Get all available journals and users
        $availableJournals = array_values($journalIds);
        $availableUsers = array_values(array_filter([
            $userIds['andi.prasetyo@uad.ac.id'] ?? null,
            $userIds['dewi.kartika@uad.ac.id'] ?? null,
            $userIds['eko.wijaya@umy.ac.id'] ?? null,
            $userIds['fitri.rahmawati@umy.ac.id'] ?? null,
            $userIds['hendra.gunawan@ums.ac.id'] ?? null,
        ]));

        if (count($availableJournals) < 3) {
            $this->command->warn('     ⚠️  Insufficient journals. Need at least 3 journals.');

            return $registrations;
        }

        // Program 1 Registrations (SINTA 1-3) - Currently accepting
        // Registration 1: Pending
        if (isset($availableJournals[0]) && isset($availableUsers[0])) {
            $registrations[] = PembinaanRegistration::create([
                'pembinaan_id' => $programs[0]->id,
                'journal_id' => $availableJournals[0],
                'user_id' => $availableUsers[0],
                'status' => 'pending',
                'registered_at' => now()->subDays(3),
                'reviewed_at' => null,
                'reviewed_by' => null,
                'rejection_reason' => null,
                'created_at' => now()->subDays(3),
                'updated_at' => now()->subDays(3),
            ]);
        }

        // Registration 2: Pending
        if (isset($availableJournals[1]) && isset($availableUsers[1])) {
            $registrations[] = PembinaanRegistration::create([
                'pembinaan_id' => $programs[0]->id,
                'journal_id' => $availableJournals[1],
                'user_id' => $availableUsers[1],
                'status' => 'pending',
                'registered_at' => now()->subDays(1),
                'reviewed_at' => null,
                'reviewed_by' => null,
                'rejection_reason' => null,
                'created_at' => now()->subDays(1),
                'updated_at' => now()->subDays(1),
            ]);
        }

        // Registration 3: Pending
        if (isset($availableJournals[2]) && isset($availableUsers[2])) {
            $registrations[] = PembinaanRegistration::create([
                'pembinaan_id' => $programs[0]->id,
                'journal_id' => $availableJournals[2],
                'user_id' => $availableUsers[2],
                'status' => 'pending',
                'registered_at' => now()->subHours(12),
                'reviewed_at' => null,
                'reviewed_by' => null,
                'rejection_reason' => null,
                'created_at' => now()->subHours(12),
                'updated_at' => now()->subHours(12),
            ]);
        }

        // Program 2 Registrations (SINTA 4-6) - In assessment phase
        // Registration 4: Approved
        if (isset($availableJournals[3]) && isset($availableUsers[3])) {
            $registrations[] = PembinaanRegistration::create([
                'pembinaan_id' => $programs[1]->id,
                'journal_id' => $availableJournals[3],
                'user_id' => $availableUsers[3],
                'status' => 'approved',
                'registered_at' => now()->subDays(55),
                'reviewed_at' => now()->subDays(40),
                'reviewed_by' => $adminKampusUMY,
                'rejection_reason' => null,
                'created_at' => now()->subDays(55),
                'updated_at' => now()->subDays(40),
            ]);
        }

        // Registration 5: Approved (reuse journal if needed)
        if (isset($availableJournals[4]) && isset($availableUsers[4])) {
            $registrations[] = PembinaanRegistration::create([
                'pembinaan_id' => $programs[1]->id,
                'journal_id' => $availableJournals[4],
                'user_id' => $availableUsers[4],
                'status' => 'approved',
                'registered_at' => now()->subDays(52),
                'reviewed_at' => now()->subDays(38),
                'reviewed_by' => $adminKampusUMS,
                'rejection_reason' => null,
                'created_at' => now()->subDays(52),
                'updated_at' => now()->subDays(38),
            ]);
        }

        // Registration 6: Approved (different program, can reuse journal from program 1)
        if (isset($availableJournals[0]) && isset($availableUsers[0])) {
            $registrations[] = PembinaanRegistration::create([
                'pembinaan_id' => $programs[1]->id,
                'journal_id' => $availableJournals[0],
                'user_id' => $availableUsers[0],
                'status' => 'approved',
                'registered_at' => now()->subDays(50),
                'reviewed_at' => now()->subDays(35),
                'reviewed_by' => $adminKampusUAD,
                'rejection_reason' => null,
                'created_at' => now()->subDays(50),
                'updated_at' => now()->subDays(35),
            ]);
        }

        // Registration 7: Rejected
        if (isset($availableJournals[1]) && isset($availableUsers[1])) {
            $registrations[] = PembinaanRegistration::create([
                'pembinaan_id' => $programs[1]->id,
                'journal_id' => $availableJournals[1],
                'user_id' => $availableUsers[1],
                'status' => 'rejected',
                'registered_at' => now()->subDays(48),
                'reviewed_at' => now()->subDays(32),
                'reviewed_by' => $adminKampusUAD,
                'rejection_reason' => 'Jurnal belum memenuhi persyaratan minimal untuk program ini. Jurnal masih memerlukan perbaikan pada sistem peer review dan belum memiliki ISSN elektronik yang valid. Silakan mendaftar kembali setelah persyaratan terpenuhi.',
                'created_at' => now()->subDays(48),
                'updated_at' => now()->subDays(32),
            ]);
        }

        // Registration 8: Rejected
        if (isset($availableJournals[2]) && isset($availableUsers[2])) {
            $registrations[] = PembinaanRegistration::create([
                'pembinaan_id' => $programs[1]->id,
                'journal_id' => $availableJournals[2],
                'user_id' => $availableUsers[2],
                'status' => 'rejected',
                'registered_at' => now()->subDays(47),
                'reviewed_at' => now()->subDays(30),
                'reviewed_by' => $adminKampusUMY,
                'rejection_reason' => 'Dokumen yang diunggah tidak lengkap. Sertifikat ISSN tidak valid dan cover jurnal tidak sesuai format yang diminta. Mohon lengkapi dokumen dan daftar ulang pada periode pembukaan berikutnya.',
                'created_at' => now()->subDays(47),
                'updated_at' => now()->subDays(30),
            ]);
        }

        $this->command->info('     ✓ Created '.count($registrations).' registrations');

        return $registrations;
    }

    /**
     * Create sample attachments for registrations
     */
    private function createAttachments(array $registrations, array $userIds): void
    {
        $this->command->info('  → Creating registration attachments...');

        $attachmentCount = 0;

        foreach ($registrations as $registration) {
            // All registrations have ISSN Certificate and Journal Cover
            PembinaanRegistrationAttachment::create([
                'registration_id' => $registration->id,
                'file_name' => 'ISSN_Certificate_'.$registration->journal_id.'.pdf',
                'file_path' => 'pembinaan_attachments/'.now()->timestamp.'_issn_certificate.pdf',
                'file_type' => 'application/pdf',
                'file_size' => rand(200000, 500000),
                'document_type' => 'ISSN Certificate',
                'description' => 'Sertifikat ISSN resmi dari LIPI/ISSN Indonesia',
                'uploaded_by' => $registration->user_id,
                'created_at' => $registration->registered_at,
                'updated_at' => $registration->registered_at,
            ]);
            $attachmentCount++;

            PembinaanRegistrationAttachment::create([
                'registration_id' => $registration->id,
                'file_name' => 'Journal_Cover_'.$registration->journal_id.'.jpg',
                'file_path' => 'pembinaan_attachments/'.now()->timestamp.'_journal_cover.jpg',
                'file_type' => 'image/jpeg',
                'file_size' => rand(100000, 300000),
                'document_type' => 'Journal Cover',
                'description' => 'Cover jurnal edisi terbaru',
                'uploaded_by' => $registration->user_id,
                'created_at' => $registration->registered_at,
                'updated_at' => $registration->registered_at,
            ]);
            $attachmentCount++;

            // Approved registrations have additional accreditation documents
            if ($registration->status === 'approved') {
                PembinaanRegistrationAttachment::create([
                    'registration_id' => $registration->id,
                    'file_name' => 'Accreditation_History_'.$registration->journal_id.'.pdf',
                    'file_path' => 'pembinaan_attachments/'.now()->timestamp.'_accreditation_history.pdf',
                    'file_type' => 'application/pdf',
                    'file_size' => rand(300000, 800000),
                    'document_type' => 'Previous Accreditation',
                    'description' => 'Surat keputusan akreditasi periode sebelumnya',
                    'uploaded_by' => $registration->user_id,
                    'created_at' => $registration->registered_at->addMinutes(5),
                    'updated_at' => $registration->registered_at->addMinutes(5),
                ]);
                $attachmentCount++;
            }
        }

        $this->command->info('     ✓ Created '.$attachmentCount.' attachments');
    }

    /**
     * Create reviewer assignments for approved registrations
     */
    private function createReviewerAssignments(array $registrations, array $userIds): array
    {
        $this->command->info('  → Creating reviewer assignments...');

        $assignments = [];

        // Get reviewers (users with is_reviewer=true)
        $reviewerIds = DB::table('users')->where('is_reviewer', true)->pluck('id')->toArray();

        if (empty($reviewerIds)) {
            $this->command->warn('     ⚠️  No reviewers found. Skipping reviewer assignments.');

            return $assignments;
        }

        // Get admin kampus for assigned_by
        $adminKampusIds = DB::table('users')
            ->whereIn('email', ['admin.uad@ajm.ac.id', 'admin.umy@ajm.ac.id', 'admin.ums@ajm.ac.id'])
            ->pluck('id', 'email')
            ->toArray();

        $reviewerIndex = 0;
        foreach ($registrations as $registration) {
            if ($registration->status !== 'approved') {
                continue;
            }

            // Get appropriate admin for this registration's university
            $journal = DB::table('journals')->find($registration->journal_id);
            $universityCode = DB::table('universities')->find($journal->university_id)->code ?? 'UAD';
            $adminEmail = 'admin.'.strtolower($universityCode).'@ajm.ac.id';
            $assignedBy = $adminKampusIds[$adminEmail] ?? array_values($adminKampusIds)[0];

            // Assign reviewer (rotate through available reviewers)
            $reviewerId = $reviewerIds[$reviewerIndex % count($reviewerIds)];

            // Determine status based on when registration was reviewed
            // Registrations were reviewed 35-40 days ago, so assignments should be completed
            $assignedAt = $registration->reviewed_at->copy()->addDays(2);

            // Calculate how long ago the assignment was created
            $daysAgo = $assignedAt->diffInDays(now());

            $status = 'assigned';
            $updatedAt = $assignedAt;

            // If assigned more than 15 days ago, mark as completed
            if ($daysAgo >= 15) {
                $status = 'completed';
                $updatedAt = $assignedAt->copy()->addDays(15);
            } elseif ($daysAgo >= 7) {
                $status = 'in_progress';
                $updatedAt = now();
            }

            $assignments[] = ReviewerAssignment::create([
                'reviewer_id' => $reviewerId,
                'registration_id' => $registration->id,
                'assigned_by' => $assignedBy,
                'assigned_at' => $assignedAt,
                'status' => $status,
                'created_at' => $assignedAt,
                'updated_at' => $updatedAt,
            ]);

            $reviewerIndex++;
        }

        $this->command->info('     ✓ Created '.count($assignments).' reviewer assignments');

        return $assignments;
    }

    /**
     * Create reviews for completed assignments
     */
    private function createReviews(array $assignments, array $userIds): void
    {
        $this->command->info('  → Creating reviews...');

        $reviewCount = 0;
        $feedbackTemplates = [
            [
                'score' => 92.5,
                'feedback' => 'Jurnal telah menunjukkan kualitas yang sangat baik dalam pengelolaan editorial dan publikasi artikel. Sistem peer review berjalan dengan baik dan konsisten. Editorial board memiliki keberagaman institusi yang memadai. Artikel yang dipublikasikan memiliki kualitas akademik yang tinggi dengan sitasi yang cukup baik.',
                'recommendation' => 'Sangat layak untuk mendapatkan akreditasi SINTA 3. Disarankan untuk terus meningkatkan visibilitas internasional dengan menambahkan lebih banyak reviewer dari luar negeri dan memperluas cakupan indeksasi jurnal.',
            ],
            [
                'score' => 85.0,
                'feedback' => 'Pengelolaan jurnal sudah baik dengan sistem OJS yang terkelola dengan baik. Proses peer review sudah berjalan sesuai standar. Namun masih ada beberapa area yang perlu ditingkatkan, terutama dalam hal keberagaman penulis dari berbagai institusi dan peningkatan impact factor jurnal.',
                'recommendation' => 'Layak mendapatkan akreditasi SINTA 4. Untuk meningkat ke level yang lebih tinggi, disarankan untuk: 1) Meningkatkan publikasi artikel dari penulis internasional, 2) Memperluas jangkauan distribusi jurnal, 3) Meningkatkan kualitas website dan metadata artikel.',
            ],
            [
                'score' => 78.5,
                'feedback' => 'Jurnal menunjukkan komitmen yang baik dalam publikasi berkala. Namun terdapat beberapa kelemahan dalam konsistensi penerbitan dan kualitas beberapa artikel. Sistem peer review perlu diperkuat dengan menambah jumlah reviewer dan meningkatkan proses blind review.',
                'recommendation' => 'Layak untuk akreditasi SINTA 5 dengan catatan. Diperlukan perbaikan dalam: 1) Konsistensi jadwal penerbitan, 2) Peningkatan kualitas artikel melalui seleksi yang lebih ketat, 3) Penambahan reviewer ahli dari berbagai institusi.',
            ],
            [
                'score' => 65.0,
                'feedback' => 'Jurnal masih dalam tahap pengembangan dan memerlukan banyak perbaikan. Sistem editorial masih perlu diperkuat, khususnya dalam hal proses review dan seleksi artikel. Website jurnal memerlukan perbaikan untuk meningkatkan user experience dan aksesibilitas.',
                'recommendation' => 'Memerlukan pembinaan intensif sebelum dapat direkomendasikan untuk akreditasi yang lebih tinggi. Fokus perbaikan: 1) Penguatan tim editorial, 2) Implementasi sistem peer review yang lebih baik, 3) Peningkatan kualitas dan konsistensi publikasi, 4) Perbaikan website dan sistem manajemen jurnal.',
            ],
        ];

        $feedbackIndex = 0;
        foreach ($assignments as $assignment) {
            if ($assignment->status !== 'completed') {
                continue;
            }

            $feedback = $feedbackTemplates[$feedbackIndex % count($feedbackTemplates)];

            PembinaanReview::create([
                'registration_id' => $assignment->registration_id,
                'reviewer_id' => $assignment->reviewer_id,
                'score' => $feedback['score'],
                'feedback' => $feedback['feedback'],
                'recommendation' => $feedback['recommendation'],
                'reviewed_at' => $assignment->updated_at,
                'created_at' => $assignment->updated_at,
                'updated_at' => $assignment->updated_at,
            ]);

            $reviewCount++;
            $feedbackIndex++;
        }

        $this->command->info('     ✓ Created '.$reviewCount.' reviews');
    }
}
