<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Models\Proposal;
use App\Services\StatsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly StatsService $statsService
    ) {}

    /**
     * Show the dashboard page with statistics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load(['role', 'university']);

        // Calculate journal statistics for visualization first to utilize cached data
        $statistics = $this->calculateJournalStatisticsForRole($user);

        // Initialize stats
        $stats = [
            'total_journals' => $statistics['totals']['total_journals'] ?? 0,
            'total_assessments' => 0,
            'average_score' => 0.0,
        ];

        // Get stats based on user role
        if ($user->role->name === 'Super Admin') {
            // Super Admin sees all data
            $stats['total_assessments'] = DB::table('journal_assessments')->count();

            $avgScore = DB::table('journal_assessments')
                ->whereNotNull('total_score')
                ->avg('total_score');
            $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

            // Add pending LPPM Admin registrations count
            $stats['pending_lppm_count'] = DB::table('users')
                ->whereNull('role_id')
                ->where('approval_status', 'pending')
                ->count();

            // Add university distribution (journal count by university)
            $stats['universities_distribution'] = DB::table('journals')
                ->join('universities', 'journals.university_id', '=', 'universities.id')
                ->select('universities.id', 'universities.name', DB::raw('COUNT(*) as count'))
                ->groupBy('universities.id', 'universities.name')
                ->orderByDesc('count')
                ->get()
                ->toArray();

        } elseif ($user->role->name === 'Admin Kampus') {
            // Admin Kampus sees only their university data
            $stats['total_assessments'] = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.university_id', $user->university_id)
                ->count();

            $avgScore = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.university_id', $user->university_id)
                ->whereNotNull('journal_assessments.total_score')
                ->avg('journal_assessments.total_score');
            $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

        } else {
            // Regular user (Peneliti/Dosen) — Modul 6: show proposal riset stats only.
            $uid = (int) $user->id;

            $proposalCounts = DB::table('proposals')
                ->whereNull('deleted_at')
                ->where('user_id', $uid)
                ->selectRaw("
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as masuk,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as lolos,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as gagal,
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
                ")
                ->first();

            $stats['total_proposals'] = (int) ($proposalCounts->total ?? 0);
            $stats['proposal_masuk'] = (int) ($proposalCounts->masuk ?? 0);
            $stats['proposal_lolos'] = (int) ($proposalCounts->lolos ?? 0);
            $stats['proposal_gagal'] = (int) ($proposalCounts->gagal ?? 0);
            $stats['proposal_draft'] = (int) ($proposalCounts->draft ?? 0);

            // Add journal breakdown by approval status for User
            $stats['journals_by_status'] = $statistics['totals']['journals_by_status'] ?? [
                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
            ];
        }

        // Calculate proposal (riset) aggregate stats from the `proposals` table
        $proposalStats = $this->getProposalStat($user);

        // Route to role-specific dashboard views
        $roleName = $user->role->name ?? '';

        if ($roleName === 'User' || $roleName === 'Dosen') {
            return Inertia::render('Dashboard/User', [
                'stats'          => $stats,
                'proposal_stats' => $proposalStats,
            ]);
        }

                'pending' => 0,
                'approved' => 0,
                'rejected' => 0,
            ];
        }

>>>>>>> 66bbcbefb8704a66a3933c918c0b46c842469e12
        return Inertia::render('dashboard', [
            'stats'          => $stats,
            'statistics'     => $statistics,
            'proposal_stats' => $proposalStats,
        ]);
    }

    /**
     * Aggregate proposal riset stats from the `proposals` table (Modul 1 PRD).
     *
     * Returns a scope-aware summary for the given user role:
     *  - Super Admin   → system-wide totals across all proposals
     *  - Admin Kampus  → totals for proposals submitted by researchers
     *                    belonging to the Admin Kampus's university
     *  - User          → personal totals (only their own proposals)
     *
     * @param  \App\Models\User  $user
     * @return array{
     *     total: int,
     *     masuk: int,
     *     lolos: int,
     *     gagal: int,
     *     draft: int,
     *     success_rate: float,
     *     total_pendanaan: float
     * }
     */
    public function getProposalStat($user): array
    {
        $roleName = $user->role->name ?? '';

        if ($roleName === 'Super Admin') {
            return $this->statsService->getProposalSummaryAll();
        }

        if ($roleName === 'Admin Kampus') {
            return $this->statsService->getProposalSummaryForUniversity(
                (int) $user->university_id
            );
        }

        // Default: Peneliti/Dosen – personal proposal stats only
        return $this->statsService->getProposalSummaryForUser((int) $user->id);
    }

    /**
     * Calculate journal statistics based on user role.
     * Results are cached for 1 hour to improve performance.
     */
    private function calculateJournalStatisticsForRole($user): array
    {
        // Generate cache key based on role and scope
        if ($user->role->name === 'Super Admin') {
            $cacheKey = 'dashboard_statistics_super_admin';

            return Cache::remember($cacheKey, 3600, function () {
                return $this->calculateJournalStatistics(null, null);
            });
        } elseif ($user->role->name === 'Admin Kampus') {
            $cacheKey = "dashboard_statistics_university_{$user->university_id}";

            return Cache::remember($cacheKey, 3600, function () use ($user) {
                return $this->calculateJournalStatistics($user->university_id, null);
            });
        } else {
            $cacheKey = "dashboard_statistics_user_{$user->id}";

            return Cache::remember($cacheKey, 3600, function () use ($user) {
                return $this->calculateJournalStatistics(null, $user->id);
            });
        }
    }

    /**
     * Calculate journal statistics with optional filtering.
     *
     * @param  int|null  $universityId  Filter by university (for Admin Kampus)
     * @param  int|null  $userId  Filter by user (for regular users)
     */
    private function calculateJournalStatistics(?int $universityId, ?int $userId): array
    {
        // Build query based on filters
        $query = Journal::query()->with('scientificField');

        if ($universityId !== null) {
            $query->where('university_id', $universityId);
        }

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        $journals = $query->get();
        $totalJournals = $journals->count();

        // Calculate totals
        // Note: "Indexed journals" means Scopus-indexed only (as per meeting notes 02 Feb 2026)
        $indexedJournals = $journals->filter(fn ($j) => isset($j->indexations['Scopus']))->count();
        $sintaJournals = $journals->filter(fn ($j) => $j->sinta_rank !== null && $j->sinta_rank !== 'non_sinta')->count();
        $nonSintaJournals = $totalJournals - $sintaJournals;

        // Aggregate by indexation
        $indexationCounts = [];
        foreach ($journals as $journal) {
            if ($journal->indexations && is_array($journal->indexations)) {
                foreach (array_keys($journal->indexations) as $platform) {
                    $indexationCounts[$platform] = ($indexationCounts[$platform] ?? 0) + 1;
                }
            }
        }

        $byIndexation = collect($indexationCounts)
            ->map(fn ($count, $name) => [
                'name' => $name,
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ])
            ->sortByDesc('count')
            ->values()
            ->toArray();

        // Aggregate by SINTA rank
        $sintaGroups = $journals->groupBy('sinta_rank');
        $byAccreditation = [];

        // Non-Sinta journals
        $byAccreditation[] = [
            'sinta_rank' => 'non_sinta',
            'label' => 'Non-Sinta',
            'count' => $nonSintaJournals,
            'percentage' => $totalJournals > 0 ? round(($nonSintaJournals / $totalJournals) * 100, 1) : 0,
        ];

        // SINTA 1-6
        for ($rank = 1; $rank <= 6; $rank++) {
            $sintaRankKey = "sinta_{$rank}";
            $count = $sintaGroups->get($sintaRankKey)?->count() ?? 0;
            $byAccreditation[] = [
                'sinta_rank' => $sintaRankKey,
                'label' => "SINTA {$rank}",
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ];
        }

        // Aggregate by scientific field
        $fieldGroups = $journals->filter(fn ($j) => $j->scientificField !== null)
            ->groupBy('scientific_field_id');

        $byScientificField = $fieldGroups->map(function ($group) use ($totalJournals) {
            $field = $group->first()->scientificField;
            $count = $group->count();

            return [
                'id' => $field->id,
                'name' => $field->name,
                'count' => $count,
                'percentage' => $totalJournals > 0 ? round(($count / $totalJournals) * 100, 1) : 0,
            ];
        })
            ->sortByDesc('count')
            ->values()
            ->toArray();

        $journalsByStatus = [
            'pending' => $journals->filter(fn ($j) => $j->approval_status === 'pending')->count(),
            'approved' => $journals->filter(fn ($j) => $j->approval_status === 'approved')->count(),
            'rejected' => $journals->filter(fn ($j) => $j->approval_status === 'rejected')->count(),
        ];

        return [
            'totals' => [
                'total_journals' => $totalJournals,
                'indexed_journals' => $indexedJournals,
                'sinta_journals' => $sintaJournals,
                'non_sinta_journals' => $nonSintaJournals,
                'journals_by_status' => $journalsByStatus,
            ],
            'by_indexation' => $byIndexation,
            'by_accreditation' => $byAccreditation,
            'by_scientific_field' => $byScientificField,
        ];
    }

    /**
     * Clear dashboard statistics cache.
     * Called when journals are created, updated, or deleted.
     *
     * @param  int|null  $universityId  Clear cache for specific university (null = clear all)
     * @param  int|null  $userId  Clear cache for specific user (null = clear all in scope)
     */
    public static function clearStatisticsCache(?int $universityId = null, ?int $userId = null): void
    {
        // Always clear super admin cache as it aggregates all data
        Cache::forget('dashboard_statistics_super_admin');

        // Clear university-specific cache if provided
        if ($universityId !== null) {
            Cache::forget("dashboard_statistics_university_{$universityId}");
        }

        // Clear user-specific cache if provided
        if ($userId !== null) {
            Cache::forget("dashboard_statistics_user_{$userId}");
        }

        // If no specific scope, clear all dashboard caches (wildcard not supported by all drivers)
        // This is a fallback for scenarios where we can't determine the scope
        if ($universityId === null && $userId === null) {
            // Clear all university caches (assumes max 1000 universities)
            for ($i = 1; $i <= 1000; $i++) {
                Cache::forget("dashboard_statistics_university_{$i}");
            }
            // Clear all user caches would be too expensive, so we skip it
            // Users will see fresh data after their cache expires (1 hour)
        }
    }
}
