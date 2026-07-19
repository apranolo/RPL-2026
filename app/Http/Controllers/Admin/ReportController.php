<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the overall recap/report page with filtering capabilities.
     *
     * Filters supported via query parameters:
     * - search        : Search by journal title / ISSN / E-ISSN
     * - university_id : Filter by specific university
     * - sinta_rank    : Filter by SINTA rank (sinta_1..sinta_6, non_sinta)
     * - approval_status: Filter by approval status (pending, approved, rejected)
     * - indexation    : Filter by indexation platform (Scopus, DOAJ, etc.)
     * - sort_by       : Sort field (title, university, sinta_rank, created_at)
     * - sort_dir      : Sort direction (asc, desc)
     * - per_page      : Items per page (default: 25)
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load(['role']);

        // ──────────────────────────────────────────────
        // 1. Build filtered journal query
        // ──────────────────────────────────────────────
        $query = Journal::query()
            ->with(['university:id,name,short_name', 'scientificField:id,name', 'user:id,name'])
            ->withCount('assessments');

        // Text search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('issn', 'like', "%{$search}%")
                    ->orWhere('e_issn', 'like', "%{$search}%");
            });
        }

        // University filter
        if ($universityId = $request->input('university_id')) {
            $query->where('university_id', (int) $universityId);
        }

        // SINTA rank filter
        if ($sintaRank = $request->input('sinta_rank')) {
            if ($sintaRank === 'non_sinta') {
                $query->where(function ($q) {
                    $q->where('sinta_rank', 'non_sinta')
                        ->orWhereNull('sinta_rank');
                });
            } else {
                $query->where('sinta_rank', $sintaRank);
            }
        }

        // Approval status filter
        if ($approvalStatus = $request->input('approval_status')) {
            $query->where('approval_status', $approvalStatus);
        }

        // Indexation platform filter
        if ($indexation = $request->input('indexation')) {
            $query->whereNotNull('indexations')
                ->whereRaw("JSON_CONTAINS_PATH(indexations, 'one', ?)", ['$."'.$indexation.'"']);
        }

        // Scientific field filter
        if ($fieldId = $request->input('scientific_field_id')) {
            $query->where('scientific_field_id', (int) $fieldId);
        }

        // ──────────────────────────────────────────────
        // 2. Sorting
        // ──────────────────────────────────────────────
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');

        $allowedSorts = ['title', 'sinta_rank', 'created_at', 'approval_status'];

        if (in_array($sortBy, $allowedSorts, true)) {
            $query->orderBy($sortBy, $sortDir === 'asc' ? 'asc' : 'desc');
        } elseif ($sortBy === 'university') {
            // Sort by university name via subquery
            $query->orderBy(
                University::select('name')
                    ->whereColumn('universities.id', 'journals.university_id')
                    ->limit(1),
                $sortDir === 'asc' ? 'asc' : 'desc'
            );
        } else {
            $query->orderByDesc('created_at');
        }

        // ──────────────────────────────────────────────
        // 3. Paginate results
        // ──────────────────────────────────────────────
        $perPage = min((int) $request->input('per_page', 25), 100);
        $journals = $query->paginate($perPage)->withQueryString();

        // ──────────────────────────────────────────────
        // 4. Aggregate summary statistics (unfiltered)
        // ──────────────────────────────────────────────
        $summary = $this->buildSummary();

        // ──────────────────────────────────────────────
        // 5. Filter options for dropdowns
        // ──────────────────────────────────────────────
        $filterOptions = [
            'universities' => University::query()
                ->active()
                ->orderBy('name')
                ->get(['id', 'name', 'short_name']),

            'sinta_ranks' => Journal::getSintaRankOptions(),

            'indexation_platforms' => Journal::getIndexationPlatforms(),

            'scientific_fields' => DB::table('scientific_fields')
                ->orderBy('name')
                ->get(['id', 'name']),
        ];

        // ──────────────────────────────────────────────
        // 6. Current active filters (for UI state)
        // ──────────────────────────────────────────────
        $activeFilters = array_filter([
            'search' => $request->input('search'),
            'university_id' => $request->input('university_id'),
            'sinta_rank' => $request->input('sinta_rank'),
            'approval_status' => $request->input('approval_status'),
            'indexation' => $request->input('indexation'),
            'scientific_field_id' => $request->input('scientific_field_id'),
            'sort_by' => $request->input('sort_by'),
            'sort_dir' => $request->input('sort_dir'),
            'per_page' => $request->input('per_page'),
        ]);

        return Inertia::render('Admin/Reports/Index', [
            'journals' => $journals,
            'summary' => $summary,
            'filterOptions' => $filterOptions,
            'activeFilters' => $activeFilters,
        ]);
    }

    /**
     * Build overall summary statistics across all journals.
     *
     * @return array<string, mixed>
     */
    private function buildSummary(): array
    {
        $totalJournals = DB::table('journals')->count();

        // Journals by approval status
        $byApproval = DB::table('journals')
            ->selectRaw('approval_status, COUNT(*) as count')
            ->groupBy('approval_status')
            ->pluck('count', 'approval_status')
            ->toArray();

        // Journals by SINTA rank
        $bySinta = DB::table('journals')
            ->selectRaw("COALESCE(sinta_rank, 'non_sinta') as rank_key, COUNT(*) as count")
            ->groupBy('rank_key')
            ->pluck('count', 'rank_key')
            ->toArray();

        // Scopus-indexed count
        $scopusCount = DB::table('journals')
            ->whereNotNull('indexations')
            ->whereRaw("JSON_CONTAINS_PATH(indexations, 'one', '$.Scopus')")
            ->count();

        // Assessment averages
        $assessmentStats = DB::table('journal_assessments')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('AVG(CASE WHEN total_score IS NOT NULL THEN total_score END) as avg_score')
            ->first();

        // Universities with journals
        $universitiesWithJournals = DB::table('journals')
            ->distinct('university_id')
            ->count('university_id');

        return [
            'total_journals' => $totalJournals,
            'approved' => $byApproval['approved'] ?? 0,
            'pending' => $byApproval['pending'] ?? 0,
            'rejected' => $byApproval['rejected'] ?? 0,
            'scopus_indexed' => $scopusCount,
            'sinta_breakdown' => $bySinta,
            'total_assessments' => $assessmentStats->total ?? 0,
            'average_score' => $assessmentStats->avg_score
                ? round($assessmentStats->avg_score, 2)
                : 0.0,
            'universities_with_journals' => $universitiesWithJournals,
        ];
    }
}
