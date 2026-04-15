<?php

namespace Database\Seeders;

use App\Models\AssessmentJournalMetadata;
use App\Models\AssessmentResponse;
use App\Models\EvaluationIndicator;
use App\Models\JournalAssessment;
use Faker\Factory as FakerFactory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssessmentSeeder extends Seeder
{
    /**
     * Faker instance
     */
    private $faker;

    /**
     * Run the database seeds.
     *
     * Creates sample assessments with journal metadata for testing purposes.
     * Demonstrates various assessment states (draft, submitted, reviewed) and
     * metadata configurations (different numbers of editors, reviewers, authors).
     */
    public function run(): void
    {
        // Initialize Faker
        $this->faker = FakerFactory::create('id_ID');

        $this->command->info('📊 Seeding Sample Assessments with Journal Metadata...');

        // Get required IDs
        $journalIds = DB::table('journals')->pluck('id', 'title')->toArray();
        $userIds = DB::table('users')->pluck('id', 'email')->toArray();
        $indicators = EvaluationIndicator::active()->get();

        if (empty($journalIds) || empty($userIds) || $indicators->isEmpty()) {
            $this->command->warn('⚠️  Required data (journals, users, or indicators) not found. Skipping assessment seeding.');

            return;
        }

        // Sample Assessment 1: Jurnal Pendidikan dan Pembelajaran (UAD) - SUBMITTED with complete metadata
        $assessment1 = $this->createAssessment([
            'journal_id' => $journalIds['Jurnal Pendidikan dan Pembelajaran'] ?? null,
            'user_id' => $userIds['dewi.kartika@uad.ac.id'] ?? null,
            'assessment_date' => '2026-01-15',
            'period' => '2025-Semester 2',
            'status' => 'submitted',
            'submitted_at' => '2026-01-20 10:30:00',
            'notes' => 'Assessment lengkap untuk periode Semester 2 2025. Jurnal telah memenuhi standar SINTA 4.',

            // Journal metadata aggregate fields
            'kategori_diusulkan' => 'Sinta 3',
            'jumlah_editor' => 8,
            'jumlah_reviewer' => 12,
            'jumlah_author' => 45,
            'jumlah_institusi_editor' => 5,
            'jumlah_institusi_reviewer' => 8,
            'jumlah_institusi_author' => 15,
        ]);

        if ($assessment1) {
            // Add journal metadata entries (multiple issues)
            $this->createJournalMetadata($assessment1->id, [
                [
                    'volume' => '5',
                    'number' => '1',
                    'year' => 2025,
                    'month' => 6,
                    'url_issue' => 'https://journal.uad.ac.id/index.php/JPP/issue/view/51',
                    'jumlah_negara_editor' => 3,
                    'jumlah_institusi_editor' => 5,
                    'jumlah_negara_reviewer' => 4,
                    'jumlah_institusi_reviewer' => 7,
                    'jumlah_negara_author' => 8,
                    'jumlah_institusi_author' => 12,
                    'display_order' => 1,
                ],
                [
                    'volume' => '5',
                    'number' => '2',
                    'year' => 2025,
                    'month' => 12,
                    'url_issue' => 'https://journal.uad.ac.id/index.php/JPP/issue/view/52',
                    'jumlah_negara_editor' => 3,
                    'jumlah_institusi_editor' => 5,
                    'jumlah_negara_reviewer' => 5,
                    'jumlah_institusi_reviewer' => 8,
                    'jumlah_negara_author' => 10,
                    'jumlah_institusi_author' => 15,
                    'display_order' => 2,
                ],
            ]);

            // Add sample responses for this assessment
            $this->createSampleResponses($assessment1->id, $indicators, 85); // 85% completion rate
        }

        // Sample Assessment 2: Jurnal Informatika dan Teknologi (UAD) - REVIEWED with full metadata
        $assessment2 = $this->createAssessment([
            'journal_id' => $journalIds['Jurnal Informatika dan Teknologi'] ?? null,
            'user_id' => $userIds['andi.prasetyo@uad.ac.id'] ?? null,
            'assessment_date' => '2025-12-10',
            'period' => '2025-Q4',
            'status' => 'reviewed',
            'submitted_at' => '2025-12-15 14:20:00',
            'reviewed_at' => '2025-12-20 09:15:00',
            'reviewed_by' => $userIds['admin.uad@uad.ac.id'] ?? null,
            'admin_kampus_approved_by' => $userIds['admin.uad@uad.ac.id'] ?? null,
            'admin_kampus_approved_at' => '2025-12-20 09:15:00',
            'admin_kampus_approval_notes' => 'Assessment telah disetujui. Jurnal menunjukkan peningkatan kualitas yang signifikan.',
            'notes' => 'Assessment Q4 2025 dengan fokus pada peningkatan indeksasi internasional.',

            // Journal metadata aggregate fields
            'kategori_diusulkan' => 'Terindeks Scopus',
            'jumlah_editor' => 10,
            'jumlah_reviewer' => 18,
            'jumlah_author' => 65,
            'jumlah_institusi_editor' => 7,
            'jumlah_institusi_reviewer' => 12,
            'jumlah_institusi_author' => 22,
        ]);

        if ($assessment2) {
            // Add journal metadata entries (quarterly publication)
            $this->createJournalMetadata($assessment2->id, [
                [
                    'volume' => '12',
                    'number' => '1',
                    'year' => 2025,
                    'month' => 3,
                    'url_issue' => 'https://journal.uad.ac.id/index.php/JTI/issue/view/121',
                    'jumlah_negara_editor' => 4,
                    'jumlah_institusi_editor' => 6,
                    'jumlah_negara_reviewer' => 6,
                    'jumlah_institusi_reviewer' => 10,
                    'jumlah_negara_author' => 12,
                    'jumlah_institusi_author' => 18,
                    'display_order' => 1,
                ],
                [
                    'volume' => '12',
                    'number' => '2',
                    'year' => 2025,
                    'month' => 6,
                    'url_issue' => 'https://journal.uad.ac.id/index.php/JTI/issue/view/122',
                    'jumlah_negara_editor' => 4,
                    'jumlah_institusi_editor' => 7,
                    'jumlah_negara_reviewer' => 7,
                    'jumlah_institusi_reviewer' => 11,
                    'jumlah_negara_author' => 14,
                    'jumlah_institusi_author' => 20,
                    'display_order' => 2,
                ],
                [
                    'volume' => '12',
                    'number' => '3',
                    'year' => 2025,
                    'month' => 9,
                    'url_issue' => 'https://journal.uad.ac.id/index.php/JTI/issue/view/123',
                    'jumlah_negara_editor' => 5,
                    'jumlah_institusi_editor' => 7,
                    'jumlah_negara_reviewer' => 8,
                    'jumlah_institusi_reviewer' => 12,
                    'jumlah_negara_author' => 15,
                    'jumlah_institusi_author' => 22,
                    'display_order' => 3,
                ],
            ]);

            // Add sample responses for this assessment
            $this->createSampleResponses($assessment2->id, $indicators, 95); // 95% completion rate
        }

        // Sample Assessment 3: Jurnal Manajemen dan Bisnis (UMY) - DRAFT with minimal metadata
        $assessment3 = $this->createAssessment([
            'journal_id' => $journalIds['Jurnal Manajemen dan Bisnis'] ?? null,
            'user_id' => $userIds['eko.wijaya@umy.ac.id'] ?? null,
            'assessment_date' => '2026-02-01',
            'period' => '2026-Semester 1',
            'status' => 'draft',
            'notes' => 'Assessment dalam proses. Data masih dikumpulkan.',

            // Partial journal metadata (draft allows null values)
            'kategori_diusulkan' => 'Sinta 2',
            'jumlah_editor' => 6,
            'jumlah_reviewer' => 10,
            'jumlah_author' => null, // Not filled yet
            'jumlah_institusi_editor' => 4,
            'jumlah_institusi_reviewer' => 6,
            'jumlah_institusi_author' => null, // Not filled yet
        ]);

        if ($assessment3) {
            // Add single journal metadata entry (draft with partial data)
            $this->createJournalMetadata($assessment3->id, [
                [
                    'volume' => '9',
                    'number' => '1',
                    'year' => 2026,
                    'month' => 1,
                    'url_issue' => null, // Not published yet
                    'jumlah_negara_editor' => 3,
                    'jumlah_institusi_editor' => 4,
                    'jumlah_negara_reviewer' => 4,
                    'jumlah_institusi_reviewer' => 6,
                    'jumlah_negara_author' => null,
                    'jumlah_institusi_author' => null,
                    'display_order' => 1,
                ],
            ]);

            // Add partial responses for this draft assessment
            $this->createSampleResponses($assessment3->id, $indicators, 50); // 50% completion rate
        }

        // Sample Assessment 4: Jurnal Teknik Sipil (UMS) - SUBMITTED without metadata (backward compatibility test)
        $assessment4 = $this->createAssessment([
            'journal_id' => $journalIds['Jurnal Teknik Sipil dan Arsitektur'] ?? null,
            'user_id' => $userIds['fitria.sari@ums.ac.id'] ?? null,
            'assessment_date' => '2025-11-20',
            'period' => '2025-Q3',
            'status' => 'submitted',
            'submitted_at' => '2025-11-25 16:45:00',
            'notes' => 'Assessment Q3 2025 - tanpa metadata jurnal (untuk testing backward compatibility).',

            // NO journal metadata fields (testing null values)
            'kategori_diusulkan' => null,
            'jumlah_editor' => null,
            'jumlah_reviewer' => null,
            'jumlah_author' => null,
            'jumlah_institusi_editor' => null,
            'jumlah_institusi_reviewer' => null,
            'jumlah_institusi_author' => null,
        ]);

        if ($assessment4) {
            // NO journal metadata entries (testing backward compatibility)
            // Add sample responses
            $this->createSampleResponses($assessment4->id, $indicators, 80); // 80% completion rate
        }

        $this->command->info('✅ Sample Assessments with Journal Metadata seeded successfully!');
        $this->command->info('   - Assessment 1: SUBMITTED with complete metadata (2 issues)');
        $this->command->info('   - Assessment 2: REVIEWED with full metadata (3 issues)');
        $this->command->info('   - Assessment 3: DRAFT with partial metadata (1 issue)');
        $this->command->info('   - Assessment 4: SUBMITTED without metadata (backward compatibility)');
    }

    /**
     * Create a journal assessment
     */
    private function createAssessment(array $data): ?JournalAssessment
    {
        if (! $data['journal_id'] || ! $data['user_id']) {
            return null;
        }

        return JournalAssessment::create($data);
    }

    /**
     * Create journal metadata entries for an assessment
     */
    private function createJournalMetadata(int $assessmentId, array $metadataEntries): void
    {
        foreach ($metadataEntries as $metadata) {
            AssessmentJournalMetadata::create([
                'journal_assessment_id' => $assessmentId,
                ...$metadata,
            ]);
        }
    }

    /**
     * Create sample responses for an assessment
     *
     * @param  int  $assessmentId  The assessment ID
     * @param  \Illuminate\Database\Eloquent\Collection  $indicators  Collection of evaluation indicators
     * @param  int  $completionRate  Percentage of indicators to fill (0-100)
     */
    private function createSampleResponses(int $assessmentId, $indicators, int $completionRate): void
    {
        $totalIndicators = $indicators->count();
        $indicatorsToFill = (int) ceil($totalIndicators * ($completionRate / 100));

        $selectedIndicators = $indicators->random(min($indicatorsToFill, $totalIndicators));

        foreach ($selectedIndicators as $indicator) {
            $responseData = [
                'journal_assessment_id' => $assessmentId,
                'evaluation_indicator_id' => $indicator->id,
                'notes' => $this->faker->optional(0.3)->sentence(), // 30% chance of having notes
            ];

            // Set response based on answer type
            switch ($indicator->answer_type) {
                case 'boolean':
                    $responseData['answer_boolean'] = $this->faker->boolean(80); // 80% true
                    $responseData['score'] = $responseData['answer_boolean'] ? $indicator->weight : 0;
                    break;

                case 'scale':
                    $scale = $this->faker->numberBetween(1, 5);
                    $responseData['answer_scale'] = $scale;
                    // Score = (scale / 5) * weight
                    $responseData['score'] = ($scale / 5) * $indicator->weight;
                    break;

                case 'text':
                    $responseData['answer_text'] = $this->faker->paragraph();
                    // Text answers get full weight if answered
                    $responseData['score'] = $indicator->weight;
                    break;
            }

            AssessmentResponse::create($responseData);
        }

        // Update assessment total scores
        $this->updateAssessmentScores($assessmentId);
    }

    /**
     * Update assessment total scores
     */
    private function updateAssessmentScores(int $assessmentId): void
    {
        $assessment = JournalAssessment::with('responses.evaluationIndicator')->find($assessmentId);

        if (! $assessment) {
            return;
        }

        $totalScore = $assessment->responses->sum('score');
        $maxScore = $assessment->responses->sum(fn ($r) => $r->evaluationIndicator->weight);
        $percentage = $maxScore > 0 ? ($totalScore / $maxScore) * 100 : 0;

        $assessment->update([
            'total_score' => round($totalScore, 2),
            'max_score' => round($maxScore, 2),
            'percentage' => round($percentage, 2),
        ]);
    }
}
