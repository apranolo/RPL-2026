<?php

namespace App\Http\Controllers;

use App\Http\Requests\FinalSubmitRequest;
use App\Models\AssessmentResponse;
use App\Models\EvaluationIndicator;
use App\Models\Journal;
use App\Models\JournalAssessment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubmissionWizardController extends Controller
{
    /**
     * Display the Wizard Step 5 — Confirm & Review page.
     *
     * Loads all wizard data collected in steps 1-4 so the user
     * can review everything before final submission.
     *
     * @route GET /user/submission-wizard/{assessment}/confirm
     */
    public function confirm(Request $request, JournalAssessment $assessment)
    {
        $user = $request->user();

        // Ensure the assessment belongs to the current user
        $this->authorize('view', $assessment);

        // Only draft assessments can go through the wizard
        if (! $assessment->isEditable()) {
            return redirect()->route('user.assessments.show', $assessment->id)
                ->withErrors(['error' => 'Assessment yang sudah disubmit tidak dapat diubah.']);
        }

        // Eager-load all relationships needed for the summary view
        $assessment->load([
            'journal.university',
            'journal.scientificField',
            'user',
            'responses.evaluationIndicator',
            'responses.attachments',
            'issues',
            'journalMetadata',
        ]);

        // Group responses by category for the confirmation summary
        $responsesByCategory = $assessment->responses->groupBy(function ($response) {
            return $response->evaluationIndicator->category;
        });

        // Calculate completion statistics
        $totalIndicators = EvaluationIndicator::active()->count();
        $answeredIndicators = $assessment->responses->count();
        $completionPercentage = $totalIndicators > 0
            ? round(($answeredIndicators / $totalIndicators) * 100, 1)
            : 0;

        // Wizard step status — determines which steps are complete
        $wizardStatus = $this->getWizardStepStatus($assessment);

        return Inertia::render('Submission/Wizard/Step5Confirm', [
            'assessment' => $assessment,
            'responsesByCategory' => $responsesByCategory,
            'completionPercentage' => $completionPercentage,
            'totalIndicators' => $totalIndicators,
            'answeredIndicators' => $answeredIndicators,
            'wizardStatus' => $wizardStatus,
        ]);
    }

    /**
     * Handle the final submission from Wizard Step 5.
     *
     * Validates all data, calculates scores, and marks the assessment
     * as submitted (no longer editable).
     *
     * @route POST /user/submission-wizard/{assessment}/final-submit
     */
    public function finalSubmit(FinalSubmitRequest $request, JournalAssessment $assessment)
    {
        $user = $request->user();

        // Ensure the assessment belongs to the current user
        $this->authorize('update', $assessment);

        // Only draft assessments can be submitted
        if (! $assessment->isEditable()) {
            return redirect()->route('user.assessments.show', $assessment->id)
                ->withErrors(['error' => 'Assessment yang sudah disubmit tidak dapat diubah.']);
        }

        $validated = $request->validated();

        DB::beginTransaction();
        try {
            // Update assessment aggregate fields from Step 2
            $assessment->update([
                'kategori_diusulkan' => $validated['kategori_diusulkan'],
                'jumlah_editor' => $validated['jumlah_editor'],
                'jumlah_reviewer' => $validated['jumlah_reviewer'],
                'jumlah_author' => $validated['jumlah_author'],
                'jumlah_institusi_editor' => $validated['jumlah_institusi_editor'],
                'jumlah_institusi_reviewer' => $validated['jumlah_institusi_reviewer'],
                'jumlah_institusi_author' => $validated['jumlah_institusi_author'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Sync journal metadata from Step 3
            $assessment->journalMetadata()->delete();
            foreach ($validated['journal_metadata'] as $index => $metadataData) {
                $assessment->journalMetadata()->create([
                    'volume' => $metadataData['volume'],
                    'number' => $metadataData['number'],
                    'year' => $metadataData['year'],
                    'month' => $metadataData['month'],
                    'url_issue' => $metadataData['url_issue'] ?? null,
                    'jumlah_negara_editor' => $metadataData['jumlah_negara_editor'],
                    'jumlah_institusi_editor' => $metadataData['jumlah_institusi_editor'],
                    'jumlah_negara_reviewer' => $metadataData['jumlah_negara_reviewer'],
                    'jumlah_institusi_reviewer' => $metadataData['jumlah_institusi_reviewer'],
                    'jumlah_negara_author' => $metadataData['jumlah_negara_author'] ?? null,
                    'jumlah_institusi_author' => $metadataData['jumlah_institusi_author'] ?? null,
                    'display_order' => $index,
                ]);
            }

            // Sync evaluation responses from Step 4
            $assessment->responses()->delete();
            foreach ($validated['responses'] as $responseData) {
                $indicator = EvaluationIndicator::findOrFail($responseData['evaluation_indicator_id']);
                $score = $this->calculateScore($indicator, $responseData);

                AssessmentResponse::create([
                    'journal_assessment_id' => $assessment->id,
                    'evaluation_indicator_id' => $responseData['evaluation_indicator_id'],
                    'answer_boolean' => $responseData['answer_boolean'] ?? null,
                    'answer_scale' => $responseData['answer_scale'] ?? null,
                    'answer_text' => $responseData['answer_text'] ?? null,
                    'score' => $score,
                    'notes' => $responseData['notes'] ?? null,
                ]);
            }

            // Sync assessment issues from Step 4 (optional)
            if (! empty($validated['issues'])) {
                $assessment->issues()->delete();
                foreach ($validated['issues'] as $index => $issueData) {
                    $assessment->issues()->create([
                        'title' => $issueData['title'],
                        'description' => $issueData['description'],
                        'category' => $issueData['category'],
                        'priority' => $issueData['priority'],
                        'display_order' => $index,
                    ]);
                }
            }

            // Calculate final scores and submit
            $assessment->submit();

            DB::commit();

            return redirect()->route('user.assessments.show', $assessment->id)
                ->with('success', 'Assessment berhasil disubmit! Terima kasih atas pengajuan Anda.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to final submit assessment via wizard', [
                'assessment_id' => $assessment->id,
                'user_id' => $user->id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'Gagal mengirim assessment. Silakan coba lagi atau hubungi administrator.',
            ]);
        }
    }

    /**
     * Calculate score based on indicator and answer.
     */
    private function calculateScore(EvaluationIndicator $indicator, array $responseData): float
    {
        $weight = (float) $indicator->weight;

        return match ($indicator->answer_type) {
            'boolean' => ($responseData['answer_boolean'] ?? false) ? $weight : 0.00,
            'scale' => $weight * (($responseData['answer_scale'] ?? 0) / 5),
            'text' => $weight, // Full weight for text answers (manual review needed)
            default => 0.00,
        };
    }

    /**
     * Determine the completion status of each wizard step.
     *
     * @return array<string, array{label: string, complete: bool, description: string}>
     */
    private function getWizardStepStatus(JournalAssessment $assessment): array
    {
        $hasBasicInfo = $assessment->journal_id
            && $assessment->assessment_date;

        $hasContributors = $assessment->kategori_diusulkan
            && $assessment->jumlah_editor !== null
            && $assessment->jumlah_reviewer !== null
            && $assessment->jumlah_author !== null;

        $hasMetadata = $assessment->journalMetadata->count() > 0;

        $hasResponses = $assessment->responses->count() > 0;

        return [
            'step1' => [
                'label' => 'Informasi Dasar',
                'complete' => (bool) $hasBasicInfo,
                'description' => 'Jurnal, tanggal, dan periode assessment',
            ],
            'step2' => [
                'label' => 'Kategori & Kontributor',
                'complete' => (bool) $hasContributors,
                'description' => 'Kategori diusulkan dan jumlah kontributor',
            ],
            'step3' => [
                'label' => 'Data Terbitan',
                'complete' => (bool) $hasMetadata,
                'description' => 'Informasi per terbitan jurnal',
            ],
            'step4' => [
                'label' => 'Evaluasi',
                'complete' => (bool) $hasResponses,
                'description' => 'Jawaban indikator evaluasi',
            ],
            'step5' => [
                'label' => 'Konfirmasi',
                'complete' => false,
                'description' => 'Review dan kirim pengajuan',
            ],
        ];
    }
}
