<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard page with statistics.
     */
    public function index(Request $request): Response
    {
        $user = $request->user()->load(['role', 'university']);

        // Initialize stats
        $stats = [
            'total_journals' => 0,
            'total_assessments' => 0,
            'average_score' => 0.0,
        ];

        // Get stats based on user role
        if ($user->role->name === 'Super Admin') {
            // Super Admin sees all data
            $stats['total_journals'] = DB::table('journals')->count();
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
            $stats['total_journals'] = DB::table('journals')
                ->where('university_id', $user->university_id)
                ->count();

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
            // Regular user (Pengelola Jurnal) sees only their own journals
            $stats['total_journals'] = DB::table('journals')
                ->where('user_id', $user->id)
                ->count();

            $stats['total_assessments'] = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.user_id', $user->id)
                ->count();

            $avgScore = DB::table('journal_assessments')
                ->join('journals', 'journal_assessments.journal_id', '=', 'journals.id')
                ->where('journals.user_id', $user->id)
                ->whereNotNull('journal_assessments.total_score')
                ->avg('journal_assessments.total_score');
            $stats['average_score'] = $avgScore ? round($avgScore, 2) : 0.0;

            // Add journal breakdown by approval status for User
            $stats['journals_by_status'] = [
                'pending' => DB::table('journals')
                    ->where('user_id', $user->id)
                    ->where('approval_status', 'pending')
                    ->count(),
                'approved' => DB::table('journals')
                    ->where('user_id', $user->id)
                    ->where('approval_status', 'approved')
                    ->count(),
                'rejected' => DB::table('journals')
                    ->where('user_id', $user->id)
                    ->where('approval_status', 'rejected')
                    ->count(),
            ];
        }

        // Calculate journal statistics for visualization
        $statistics = $this->calculateJournalStatisticsForRole($user);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'statistics' => $statistics,
        ]);
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

        return [
            'totals' => [
                'total_journals' => $totalJournals,
                'indexed_journals' => $indexedJournals,
                'sinta_journals' => $sintaJournals,
                'non_sinta_journals' => $nonSintaJournals,
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
