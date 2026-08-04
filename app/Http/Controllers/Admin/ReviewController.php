<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EvaluationCategory;
use App\Models\JournalAssessment;
use App\Models\Pembinaan;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * ReviewController - Super Admin
 *
 * Mengelola rekap dan monitoring hasil penilaian jurnal secara keseluruhan.
 * Hanya dapat diakses oleh Super Admin.
 *
 * @route /admin/reviews/*
 */
class ReviewController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Constants
    |--------------------------------------------------------------------------
    */

    /**
     * Grade thresholds based on percentage score.
     * Used consistently across all summary calculations.
     */
    private const GRADE_THRESHOLDS = [
        'A' => 90,
        'B' => 80,
        'C' => 70,
        'D' => 60,
    ];

    protected \App\Services\ReviewCalculationService $calculationService;

    public function __construct(\App\Services\ReviewCalculationService $calculationService)
    {
        $this->calculationService = $calculationService;
    }

    /**
     * Menampilkan rekapitulasi penilaian proposal riset & penetapan keputusan LPPM (Modul 2).
     *
     * @route GET /admin/reviews/summary
     */
    public function summary(Request $request): Response
    {
        $this->authorize('viewAny', JournalAssessment::class);

        $proposalQuery = \App\Models\Proposal::query();

        if ($request->user()->isAdminKampus()) {
            $proposalQuery->whereHas('user', function ($q) use ($request) {
                $q->where('university_id', $request->user()->university_id);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $proposalQuery->where('judul', 'like', "%{$search}%");
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $proposalQuery->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59',
            ]);
        }

        $proposalSummary = $this->calculationService->calculateProposalSummary($proposalQuery);
        $filterOptions = $this->buildFilterOptions();

        return Inertia::render('Admin/Reviewer/Summary', [
            'proposalSummary' => $proposalSummary,
            'filterOptions' => $filterOptions,
            'filters' => $request->only(['search', 'university_id', 'status', 'start_date', 'end_date', 'preset']),
        ]);
    }

    /**
     * Menampilkan rekapitulasi assessment jurnal secara keseluruhan (JurnalMu).
     *
     * @route GET /admin/assessments/summary
     */
    public function journalSummary(Request $request): Response
    {
        $this->authorize('viewAny', JournalAssessment::class);

        $query = JournalAssessment::query()
            ->with([
                'journal:id,title,issn,university_id',
                'journal.university:id,name,code',
                'user:id,name,email',
            ]);

        if ($request->filled('pembinaan_id')) {
            $query->where('pembinaan_registration_id', function ($sub) use ($request) {
                $sub->select('id')
                    ->from('pembinaan_registrations')
                    ->where('pembinaan_id', $request->pembinaan_id);
            });
        }

        if ($request->user()->isAdminKampus()) {
            $query->whereHas('journal', function ($q) use ($request) {
                $q->where('university_id', $request->user()->university_id);
            });
        }

        if ($request->filled('university_id')) {
            $query->whereHas('journal', function ($q) use ($request) {
                $q->where('university_id', $request->university_id);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('period')) {
            $query->where('period', $request->period);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('journal', function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('issn', 'like', "%{$search}%");
            });
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('submitted_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59',
            ]);
        }

        $globalStats = $this->buildGlobalStats(clone $query);
        $gradeDistribution = $this->buildGradeDistribution(clone $query);
        $pembinaanSummary = $this->buildPembinaanSummary($request);
        $universitySummary = $this->buildUniversitySummary(clone $query);
        $categorySummary = $this->buildCategorySummary(clone $query);

        $assessments = $query
            ->orderBy('submitted_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($assessment) => $this->formatAssessmentRow($assessment));

        $filterOptions = $this->buildFilterOptions();

        return Inertia::render('Admin/Reviewer/JournalSummary', [
            'globalStats' => $globalStats,
            'gradeDistribution' => $gradeDistribution,
            'pembinaanSummary' => $pembinaanSummary,
            'universitySummary' => $universitySummary,
            'categorySummary' => $categorySummary,
            'assessments' => $assessments,
            'filterOptions' => $filterOptions,
            'filters' => $request->only([
                'pembinaan_id',
                'university_id',
                'status',
                'period',
                'search',
                'start_date',
                'end_date',
                'preset',
            ]),
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Private Helpers – Statistics Builders
    |--------------------------------------------------------------------------
    */

    /**
     * Membangun statistik global dari query ter-filter.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return array{
     *   total: int,
     *   draft: int,
     *   submitted: int,
     *   reviewed: int,
     *   avg_score: float|null,
     *   avg_percentage: float|null,
     *   highest_score: float|null,
     *   lowest_score: float|null,
     *   completion_rate: float
     * }
     */
    private function buildGlobalStats($query): array
    {
        $totals = (clone $query)->selectRaw(
            'COUNT(*) as total,
             SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as draft,
             SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as submitted,
             SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as reviewed',
            ['draft', 'submitted', 'reviewed']
        )->first();

        // Score statistics: only for assessments that have been submitted (have a score)
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

        $total = (int) ($totals->total ?? 0);
        $submitted = (int) ($totals->submitted ?? 0);
        $reviewed = (int) ($totals->reviewed ?? 0);
        $completionRate = $total > 0
            ? round((($submitted + $reviewed) / $total) * 100, 1)
            : 0.0;

        return [
            'total' => $total,
            'draft' => (int) ($totals->draft ?? 0),
            'submitted' => $submitted,
            'reviewed' => $reviewed,
            'avg_score' => $scoreStats->avg_score !== null
                ? round((float) $scoreStats->avg_score, 2)
                : null,
            'avg_percentage' => $scoreStats->avg_percentage !== null
                ? round((float) $scoreStats->avg_percentage, 1)
                : null,
            'highest_score' => $scoreStats->highest_score !== null
                ? round((float) $scoreStats->highest_score, 1)
                : null,
            'lowest_score' => $scoreStats->lowest_score !== null
                ? round((float) $scoreStats->lowest_score, 1)
                : null,
            'completion_rate' => $completionRate,
        ];
    }

    /**
     * Membangun distribusi grade (A/B/C/D/E) dari assessment yang sudah disubmit.
     *
     * Grade ditentukan berdasarkan persentase skor:
     *  >= 90% → A (Sangat Baik)
     *  >= 80% → B (Baik)
     *  >= 70% → C (Cukup Baik)
     *  >= 60% → D (Cukup)
     *   < 60% → E (Perlu Perbaikan)
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return array<array{grade: string, label: string, count: int, percentage: float}>
     */
    private function buildGradeDistribution($query): array
    {
        $submitted = (clone $query)
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

        // Calculate percentage share of each grade
        foreach ($grades as $key => &$grade) {
            $grade['percentage'] = $total > 0
                ? round(($grade['count'] / $total) * 100, 1)
                : 0.0;
        }
        unset($grade);

        return array_values($grades);
    }

    /**
     * Membangun rekap per-program pembinaan.
     *
     * Menyertakan jumlah peserta, rata-rata skor, dan distribusi status
     * untuk setiap program pembinaan yang aktif (tidak tergantung filter).
     * Difilter hanya berdasarkan filter yang tidak berkaitan dengan pembinaan itu sendiri.
     */
    private function buildPembinaanSummary(Request $request): \Illuminate\Support\Collection
    {
        return Pembinaan::query()
            ->select([
                'pembinaan.id',
                'pembinaan.name',
                'pembinaan.category',
                'pembinaan.status',
                'pembinaan.assessment_start',
                'pembinaan.assessment_end',
            ])
            ->withCount([
                // Total registrations
                'registrations as total_registrations',
                // Approved registrations only
                'approvedRegistrations as approved_registrations',
            ])
            ->orderBy('pembinaan.assessment_start', 'desc')
            ->get()
            ->map(function (Pembinaan $pembinaan) use ($request) {
                // Get assessment stats for this pembinaan
                $assessmentQuery = JournalAssessment::query()
                    ->whereHas('pembinaanRegistration', function ($q) use ($pembinaan) {
                        $q->where('pembinaan_id', $pembinaan->id);
                    });

                // Apply extra filters from request (excluding pembinaan_id itself)
                if ($request->filled('university_id')) {
                    $assessmentQuery->whereHas('journal', function ($q) use ($request) {
                        $q->where('university_id', $request->university_id);
                    });
                }
                if ($request->filled('status')) {
                    $assessmentQuery->where('status', $request->status);
                }

                $stats = $assessmentQuery->selectRaw(
                    'COUNT(*) as total,
                     SUM(CASE WHEN status = "draft"      THEN 1 ELSE 0 END) as draft,
                     SUM(CASE WHEN status = "submitted"  THEN 1 ELSE 0 END) as submitted,
                     SUM(CASE WHEN status = "reviewed"   THEN 1 ELSE 0 END) as reviewed,
                     AVG(CASE WHEN status IN ("submitted","reviewed") AND percentage IS NOT NULL
                              THEN percentage END) as avg_percentage'
                )->first();

                return [
                    'id' => $pembinaan->id,
                    'name' => $pembinaan->name,
                    'category' => $pembinaan->category,
                    'category_label' => $pembinaan->category_label,
                    'status' => $pembinaan->status,
                    'status_label' => $pembinaan->status_label,
                    'assessment_period' => $pembinaan->assessment_start
                        ? $pembinaan->assessment_start->format('M Y').' – '.$pembinaan->assessment_end->format('M Y')
                        : null,
                    'total_registrations' => (int) $pembinaan->total_registrations,
                    'approved_registrations' => (int) $pembinaan->approved_registrations,
                    'assessments' => [
                        'total' => (int) ($stats->total ?? 0),
                        'draft' => (int) ($stats->draft ?? 0),
                        'submitted' => (int) ($stats->submitted ?? 0),
                        'reviewed' => (int) ($stats->reviewed ?? 0),
                        'avg_percentage' => $stats->avg_percentage !== null
                            ? round((float) $stats->avg_percentage, 1)
                            : null,
                    ],
                ];
            });
    }

    /**
     * Membangun rekap per-universitas.
     *
     * Menampilkan jumlah penilaian dan rata-rata persentase skor
     * per institusi (universitas) dari hasil query yang sudah ter-filter.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     */
    private function buildUniversitySummary($query): \Illuminate\Support\Collection
    {
        $rows = (clone $query)
            ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
            ->join('universities', 'journals.university_id', '=', 'universities.id')
            ->selectRaw(
                'universities.id          as university_id,
                 universities.name        as university_name,
                 universities.code        as university_code,
                 COUNT(*)                 as total,
                 SUM(CASE WHEN journal_assessments.status = "draft"     THEN 1 ELSE 0 END) as draft,
                 SUM(CASE WHEN journal_assessments.status = "submitted" THEN 1 ELSE 0 END) as submitted,
                 SUM(CASE WHEN journal_assessments.status = "reviewed"  THEN 1 ELSE 0 END) as reviewed,
                 AVG(CASE WHEN journal_assessments.status IN ("submitted","reviewed")
                               AND journal_assessments.percentage IS NOT NULL
                          THEN journal_assessments.percentage END) as avg_percentage'
            )
            ->groupBy('universities.id', 'universities.name', 'universities.code')
            ->orderByDesc('total')
            ->get();

        return $rows->map(fn ($row) => [
            'university_id' => $row->university_id,
            'university_name' => $row->university_name,
            'university_code' => $row->university_code,
            'total' => (int) $row->total,
            'draft' => (int) $row->draft,
            'submitted' => (int) $row->submitted,
            'reviewed' => (int) $row->reviewed,
            'avg_percentage' => $row->avg_percentage !== null
                ? round((float) $row->avg_percentage, 1)
                : null,
        ]);
    }

    /**
     * Membangun rekap kontribusi skor rata-rata per-kategori evaluasi.
     *
     * Dihitung dari respons yang ada pada assessment yang sudah disubmit,
     * dikelompokkan berdasarkan kategori evaluasi (level 1).
     * Berguna untuk mengidentifikasi kategori mana yang paling lemah secara rata-rata.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     */
    private function buildCategorySummary($query): \Illuminate\Support\Collection
    {
        // Collect IDs of submitted/reviewed assessments from the filtered query
        $assessmentIds = (clone $query)
            ->whereIn('status', ['submitted', 'reviewed'])
            ->pluck('journal_assessments.id');

        if ($assessmentIds->isEmpty()) {
            // Return category names with zero scores when no assessments match
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

        // Aggregate response scores grouped by evaluation category
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

        return $rows->map(fn ($row) => [
            'category_id' => $row->category_id,
            'category_code' => $row->category_code,
            'category_name' => $row->category_name,
            'category_weight' => (float) $row->category_weight,
            'avg_score' => $row->avg_score !== null
                ? round((float) $row->avg_score, 2)
                : null,
            'avg_max_score' => $row->avg_max_score !== null
                ? round((float) $row->avg_max_score, 2)
                : null,
            'avg_percentage' => ($row->avg_score !== null && $row->avg_max_score > 0)
                ? round(((float) $row->avg_score / (float) $row->avg_max_score) * 100, 1)
                : null,
            'response_count' => (int) $row->response_count,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Private Helpers – Formatters & Option Builders
    |--------------------------------------------------------------------------
    */

    /**
     * Memformat satu baris data assessment untuk tampilan tabel detail.
     */
    private function formatAssessmentRow(JournalAssessment $assessment): array
    {
        return [
            'id' => $assessment->id,
            'period' => $assessment->period,
            'status' => $assessment->status,
            'status_label' => $assessment->status_label,
            'status_color' => $assessment->status_color,
            'total_score' => $assessment->total_score,
            'max_score' => $assessment->max_score,
            'percentage' => $assessment->percentage,
            'grade' => $assessment->grade,
            'submitted_at' => $assessment->submitted_at?->format('d M Y H:i'),
            'reviewed_at' => $assessment->reviewed_at?->format('d M Y H:i'),
            'assessment_date' => $assessment->assessment_date?->format('d M Y'),
            'journal' => $assessment->journal ? [
                'id' => $assessment->journal->id,
                'title' => $assessment->journal->title,
                'issn' => $assessment->journal->issn,
            ] : null,
            'university' => $assessment->journal?->university ? [
                'id' => $assessment->journal->university->id,
                'name' => $assessment->journal->university->name,
                'code' => $assessment->journal->university->code,
            ] : null,
            'user' => $assessment->user ? [
                'id' => $assessment->user->id,
                'name' => $assessment->user->name,
                'email' => $assessment->user->email,
            ] : null,
        ];
    }

    /**
     * Membangun daftar opsi untuk dropdown filter di halaman rekap.
     *
     * @return array{
     *   pembinaan: \Illuminate\Support\Collection,
     *   universities: \Illuminate\Support\Collection,
     *   status_options: array,
     *   periods: \Illuminate\Support\Collection
     * }
     */
    private function buildFilterOptions(): array
    {
        $pembinaan = Pembinaan::query()
            ->select(['id', 'name', 'category', 'status'])
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'value' => $p->id,
                'label' => "{$p->name} ({$p->category_label})",
            ]);

        $universities = University::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code'])
            ->map(fn ($u) => [
                'value' => $u->id,
                'label' => $u->name,
            ]);

        $statusOptions = [
            ['value' => 'draft',     'label' => 'Draft'],
            ['value' => 'submitted', 'label' => 'Submitted'],
            ['value' => 'reviewed',  'label' => 'Reviewed'],
        ];

        // Distinct periods recorded in assessments (non-null)
        $periods = JournalAssessment::query()
            ->whereNotNull('period')
            ->distinct()
            ->orderBy('period', 'desc')
            ->pluck('period')
            ->map(fn ($p) => ['value' => $p, 'label' => $p]);

        return [
            'pembinaan' => $pembinaan,
            'universities' => $universities,
            'status_options' => $statusOptions,
            'periods' => $periods,
        ];
    }
}
