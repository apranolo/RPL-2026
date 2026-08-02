<?php

namespace App\Services;

use App\Models\EvaluationCategory;
use App\Models\JournalAssessment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * ReviewCalculationService
 *
 * Layanan khusus untuk menghitung rata-rata nilai, statistik global,
 * distribusi grade, serta metrik evaluasi dari penilaian jurnal.
 *
 * @author FAHMI HIDAYAT
 */
class ReviewCalculationService
{
    /**
     * Grade thresholds based on percentage score.
     */
    private const GRADE_THRESHOLDS = [
        'A' => 90,
        'B' => 80,
        'C' => 70,
        'D' => 60,
    ];

    /**
     * Melakukan kalkulasi statistik dan rata-rata nilai berdasarkan query atau koleksi assessment.
     *
     * Method ini serbaguna dan dapat digunakan untuk menghitung:
     * - Statistik global (rata-rata skor, persentase rata-rata, nilai tertinggi/terendah)
     * - Distribusi grade (A, B, C, D, E)
     * - Rata-rata per universitas
     * - Rata-rata per kategori evaluasi
     *
     * @param  Builder|Collection|null  $source  Sumber data assessment (Eloquent Builder, Collection, atau null untuk semua data)
     * @return array{
     *   total: int,
     *   draft: int,
     *   submitted: int,
     *   reviewed: int,
     *   avg_score: float|null,
     *   avg_percentage: float|null,
     *   highest_score: float|null,
     *   lowest_score: float|null,
     *   completion_rate: float,
     *   grade_distribution: array
     * }
     */
    public function calculate($source = null): array
    {
        // 1. Standarisasi source menjadi query builder
        $query = $this->resolveQuery($source);

        // 2. Hitung statistik dasar (Total & Status Counts)
        $totals = (clone $query)->selectRaw(
            'COUNT(*) as total,
             SUM(CASE WHEN status = "draft" THEN 1 ELSE 0 END) as draft,
             SUM(CASE WHEN status = "submitted" THEN 1 ELSE 0 END) as submitted,
             SUM(CASE WHEN status = "reviewed" THEN 1 ELSE 0 END) as reviewed'
        )->first();

        $total = (int) ($totals->total ?? 0);
        $draft = (int) ($totals->draft ?? 0);
        $submitted = (int) ($totals->submitted ?? 0);
        $reviewed = (int) ($totals->reviewed ?? 0);

        $completionRate = $total > 0
            ? round((($submitted + $reviewed) / $total) * 100, 1)
            : 0.0;

        // 3. Hitung statistik nilai (Hanya dari assessment yang sudah disubmit atau di-review)
        $scoreStats = (clone $query)
            ->whereIn('status', ['submitted', 'reviewed'])
            ->whereNotNull('percentage')
            ->selectRaw(
                'AVG(total_score) as avg_score,
                 AVG(percentage) as avg_percentage,
                 MAX(percentage) as highest_score,
                 MIN(percentage) as lowest_score'
            )
            ->first();

        $avgScore = $scoreStats->avg_score !== null ? round((float) $scoreStats->avg_score, 2) : null;
        $avgPercentage = $scoreStats->avg_percentage !== null ? round((float) $scoreStats->avg_percentage, 1) : null;
        $highestScore = $scoreStats->highest_score !== null ? round((float) $scoreStats->highest_score, 1) : null;
        $lowestScore = $scoreStats->lowest_score !== null ? round((float) $scoreStats->lowest_score, 1) : null;

        // 4. Hitung distribusi grade
        $gradeDistribution = $this->calculateGradeDistribution(clone $query);

        return [
            'total' => $total,
            'draft' => $draft,
            'submitted' => $submitted,
            'reviewed' => $reviewed,
            'avg_score' => $avgScore,
            'avg_percentage' => $avgPercentage,
            'highest_score' => $highestScore,
            'lowest_score' => $lowestScore,
            'completion_rate' => $completionRate,
            'grade_distribution' => $gradeDistribution,
        ];
    }

    /**
     * Menghitung total skor, skor maksimal, dan persentase untuk satu assessment spesifik.
     * Dapat digunakan saat pengisian/submit assessment untuk sinkronisasi nilai.
     *
     * @return array{total_score: float, max_score: float, percentage: float}
     */
    public function calculateSingle(JournalAssessment $assessment): array
    {
        $totalScore = (float) $assessment->responses()->sum('score');

        $maxScore = (float) $assessment->responses()
            ->join('evaluation_indicators', 'assessment_responses.evaluation_indicator_id', '=', 'evaluation_indicators.id')
            ->sum('evaluation_indicators.weight');

        $percentage = $maxScore > 0 ? ($totalScore / $maxScore) * 100 : 0.0;

        return [
            'total_score' => round($totalScore, 2),
            'max_score' => round($maxScore, 2),
            'percentage' => round($percentage, 2),
        ];
    }

    /**
     * Menghitung rata-rata nilai kontribusi per-kategori evaluasi.
     *
     * @param  Builder|Collection|null  $source
     */
    public function calculateCategoryAverages($source = null): Collection
    {
        $query = $this->resolveQuery($source);

        $assessmentIds = $query
            ->whereIn('status', ['submitted', 'reviewed'])
            ->pluck('id');

        if ($assessmentIds->isEmpty()) {
            return EvaluationCategory::query()
                ->select(['id', 'code', 'name', 'weight'])
                ->ordered()
                ->get()
                ->map(fn ($cat) => [
                    'category_id' => $cat->id,
                    'category_code' => $cat->code,
                    'category_name' => $cat->name,
                    'category_weight' => (float) $cat->weight,
                    'avg_score' => null,
                    'avg_max_score' => null,
                    'avg_percentage' => null,
                    'response_count' => 0,
                ]);
        }

        $rows = DB::table('assessment_responses as ar')
            ->join('evaluation_indicators as ei', 'ar.evaluation_indicator_id', '=', 'ei.id')
            ->join('evaluation_sub_categories as esc', 'ei.sub_category_id', '=', 'esc.id')
            ->join('evaluation_categories as ec', 'esc.category_id', '=', 'ec.id')
            ->whereIn('ar.journal_assessment_id', $assessmentIds)
            ->selectRaw(
                'ec.id           as category_id,
                 ec.code         as category_code,
                 ec.name         as category_name,
                 ec.weight       as category_weight,
                 ec.display_order,
                 AVG(ar.score)   as avg_score,
                 AVG(ei.weight)  as avg_max_score,
                 COUNT(ar.id)    as response_count'
            )
            ->groupBy('ec.id', 'ec.code', 'ec.name', 'ec.weight', 'ec.display_order')
            ->orderBy('ec.display_order')
            ->get();

        return collect($rows)->map(fn ($row) => [
            'category_id' => $row->category_id,
            'category_code' => $row->category_code,
            'category_name' => $row->category_name,
            'category_weight' => (float) $row->category_weight,
            'avg_score' => $row->avg_score !== null ? round((float) $row->avg_score, 2) : null,
            'avg_max_score' => $row->avg_max_score !== null ? round((float) $row->avg_max_score, 2) : null,
            'avg_percentage' => ($row->avg_score !== null && $row->avg_max_score > 0)
                ? round(((float) $row->avg_score / (float) $row->avg_max_score) * 100, 1)
                : null,
            'response_count' => (int) $row->response_count,
        ]);
    }

    /**
     * Menyelesaikan sumber data menjadi Eloquent Builder.
     */
    private function resolveQuery($source): Builder
    {
        if ($source instanceof Builder) {
            return $source;
        }

        if ($source instanceof Collection) {
            $ids = $source->pluck('id')->all();

            return JournalAssessment::query()->whereIn('id', $ids);
        }

        return JournalAssessment::query();
    }

    /**
     * Menghitung kalkulasi statistik dan rata-rata skor review untuk proposal penelitian (Modul 2).
     *
     * @param Builder|Collection|null $source
     * @return array
     */
    public function calculateProposalSummary($source = null): array
    {
        $query = $source instanceof Builder ? $source : Proposal::query();

        $proposals = (clone $query)
            ->with(['user.university', 'researchSchema', 'reviews.reviewer'])
            ->get();

        $totalProposals = $proposals->count();
        $approvedCount = $proposals->filter(fn ($p) => strtolower($p->status_proposal ?? '') === 'diterima')->count();
        $rejectedCount = $proposals->filter(fn ($p) => strtolower($p->status_proposal ?? '') === 'ditolak')->count();
        $pendingCount = max(0, $totalProposals - $approvedCount - $rejectedCount);

        $allCompletedScores = [];
        $proposalRows = $proposals->map(function (Proposal $proposal) use (&$allCompletedScores) {
            $calc = $this->calculateProposalSingle($proposal);
            if ($calc['avg_score'] !== null) {
                $allCompletedScores[] = $calc['avg_score'];
            }

            return [
                'id' => $proposal->id,
                'judul' => $proposal->judul ?? $proposal->title ?? 'Proposal Tanpa Judul',
                'status_proposal' => $proposal->status_proposal ?? 'Submitted',
                'rejection_reason' => $proposal->rejection_reason ?? null,
                'author_name' => $proposal->user?->name ?? 'Dosen Pengusul',
                'university_name' => $proposal->user?->university?->name ?? 'Universitas',
                'schema_name' => $proposal->researchSchema?->name ?? 'Skema Penelitian',
                'total_reviews' => $calc['total_reviews'],
                'completed_reviews' => $calc['completed_reviews'],
                'avg_score' => $calc['avg_score'],
                'recommendations' => $calc['recommendations'],
                'reviewers' => $proposal->reviews->map(fn ($r) => [
                    'id' => $r->id,
                    'reviewer_name' => $r->reviewer?->name ?? 'Reviewer',
                    'status' => $r->status ?? 'pending',
                    'score' => $r->total_score ?? $r->score ?? null,
                    'recommendation' => $r->recommendation ?? null,
                    'notes' => $r->notes ?? $r->feedback ?? null,
                ]),
            ];
        });

        $avgGlobalScore = count($allCompletedScores) > 0
            ? round(array_sum($allCompletedScores) / count($allCompletedScores), 2)
            : null;

        return [
            'total' => $totalProposals,
            'approved' => $approvedCount,
            'rejected' => $rejectedCount,
            'pending' => $pendingCount,
            'avg_score' => $avgGlobalScore,
            'proposals' => $proposalRows,
        ];
    }

    /**
     * Menghitung rata-rata skor dari seluruh reviewer untuk satu proposal.
     *
     * @param Proposal $proposal
     * @return array{avg_score: float|null, total_reviews: int, completed_reviews: int, recommendations: array}
     */
    public function calculateProposalSingle(Proposal $proposal): array
    {
        $reviews = $proposal->reviews ?? collect();
        $totalReviews = $reviews->count();

        $completedReviews = $reviews->filter(function ($r) {
            $status = strtolower($r->status ?? '');
            return ($status === 'completed' || $status === 'selesai') && ($r->total_score !== null || $r->score !== null);
        });

        $scores = $completedReviews->map(fn ($r) => (float) ($r->total_score ?? $r->score));
        $avgScore = $scores->count() > 0 ? round($scores->average(), 2) : null;

        $recs = [
            'Diterima' => 0,
            'Revisi' => 0,
            'Ditolak' => 0,
        ];

        foreach ($reviews as $r) {
            $rec = $r->recommendation ?? '';
            if (isset($recs[$rec])) {
                $recs[$rec]++;
            }
        }

        return [
            'avg_score' => $avgScore,
            'total_reviews' => $totalReviews,
            'completed_reviews' => $completedReviews->count(),
            'recommendations' => $recs,
        ];
    }

    /**
     * Menghitung distribusi grade dari query yang diberikan.
     */
    private function calculateGradeDistribution(Builder $query): array
    {
        $submitted = $query
            ->whereIn('status', ['submitted', 'reviewed'])
            ->whereNotNull('percentage')
            ->get(['percentage']);

        $total = $submitted->count();

        $grades = [
            'A' => ['grade' => 'A', 'label' => 'Sangat Baik (≥90%)',    'count' => 0, 'percentage' => 0.0],
            'B' => ['grade' => 'B', 'label' => 'Baik (80–89%)',          'count' => 0, 'percentage' => 0.0],
            'C' => ['grade' => 'C', 'label' => 'Cukup Baik (70–79%)',    'count' => 0, 'percentage' => 0.0],
            'D' => ['grade' => 'D', 'label' => 'Cukup (60–69%)',         'count' => 0, 'percentage' => 0.0],
            'E' => ['grade' => 'E', 'label' => 'Perlu Perbaikan (<60%)', 'count' => 0, 'percentage' => 0.0],
        ];

        foreach ($submitted as $assessment) {
            $pct = (float) $assessment->percentage;
            $grade = match (true) {
                $pct >= self::GRADE_THRESHOLDS['A'] => 'A',
                $pct >= self::GRADE_THRESHOLDS['B'] => 'B',
                $pct >= self::GRADE_THRESHOLDS['C'] => 'C',
                $pct >= self::GRADE_THRESHOLDS['D'] => 'D',
                default => 'E',
            };
            $grades[$grade]['count']++;
        }

        foreach ($grades as $key => &$grade) {
            $grade['percentage'] = $total > 0
                ? round(($grade['count'] / $total) * 100, 1)
                : 0.0;
        }
        unset($grade);

        return array_values($grades);
    }
}
