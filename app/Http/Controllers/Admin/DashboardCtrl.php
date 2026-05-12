<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardCtrl extends Controller
{
    /**
     * Aggregate faculty/university performance statistics.
     *
     * Returns per-university metrics including:
     * - Total journals count
     * - Total users (pengelola) count
     * - SINTA rank distribution
     * - Scopus-indexed journal count
     * - Assessment completion rate
     * - Average assessment score
     *
     * Results are cached for 1 hour to improve performance.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getFacultyStat(): array
    {
        $cacheKey = 'admin_faculty_statistics';

        return Cache::remember($cacheKey, 3600, function () {
            // Get all active universities with related counts
            $universities = University::query()
                ->active()
                ->withCount(['users', 'journals'])
                ->with('journals')
                ->get();

            $facultyStats = [];

            foreach ($universities as $university) {
                // SINTA rank distribution for this university
                $sintaDistribution = $university->journals
                    ->groupBy('sinta_rank')
                    ->map(fn ($group) => $group->count())
                    ->toArray();

                // Count Scopus-indexed journals
                $scopusCount = $university->journals
                    ->filter(fn ($j) => isset($j->indexations['Scopus']))
                    ->count();

                // Count journals by approval status
                $approvedCount = $university->journals
                    ->where('approval_status', 'approved')
                    ->count();

                $pendingCount = $university->journals
                    ->where('approval_status', 'pending')
                    ->count();

                // Assessment statistics for this university's journals
                $journalIds = $university->journals->pluck('id');

                $assessmentStats = DB::table('journal_assessments')
                    ->whereIn('journal_id', $journalIds)
                    ->selectRaw('COUNT(*) as total_assessments')
                    ->selectRaw('COUNT(CASE WHEN status = "submitted" OR status = "reviewed" THEN 1 END) as completed_assessments')
                    ->selectRaw('AVG(CASE WHEN total_score IS NOT NULL THEN total_score END) as average_score')
                    ->first();

                // Build SINTA breakdown (sinta_1 through sinta_6 + non_sinta)
                $sintaBreakdown = [];
                for ($rank = 1; $rank <= 6; $rank++) {
                    $key = "sinta_{$rank}";
                    $sintaBreakdown[$key] = $sintaDistribution[$key] ?? 0;
                }
                $sintaBreakdown['non_sinta'] = ($sintaDistribution['non_sinta'] ?? 0)
                    + ($sintaDistribution[null] ?? 0)
                    + ($sintaDistribution[''] ?? 0);

                // Total SINTA-accredited journals (any rank from 1-6)
                $totalSinta = array_sum(array_slice($sintaBreakdown, 0, 6));

                $facultyStats[] = [
                    'university_id' => $university->id,
                    'university_name' => $university->name,
                    'university_short_name' => $university->short_name,
                    'accreditation_status' => $university->accreditation_status,
                    'cluster' => $university->cluster,
                    'total_users' => $university->users_count,
                    'total_journals' => $university->journals_count,
                    'approved_journals' => $approvedCount,
                    'pending_journals' => $pendingCount,
                    'scopus_indexed' => $scopusCount,
                    'total_sinta' => $totalSinta,
                    'sinta_breakdown' => $sintaBreakdown,
                    'total_assessments' => $assessmentStats->total_assessments ?? 0,
                    'completed_assessments' => $assessmentStats->completed_assessments ?? 0,
                    'average_score' => $assessmentStats->average_score
                        ? round($assessmentStats->average_score, 2)
                        : 0.0,
                    'assessment_completion_rate' => ($assessmentStats->total_assessments ?? 0) > 0
                        ? round(
                            (($assessmentStats->completed_assessments ?? 0) / $assessmentStats->total_assessments) * 100,
                            1
                        )
                        : 0.0,
                ];
            }

            // Sort by total journals descending
            usort($facultyStats, fn ($a, $b) => $b['total_journals'] <=> $a['total_journals']);

            return $facultyStats;
        });
    }

    /**
     * Get aggregated category statistics for pie chart visualization.
     *
     * Returns journal counts grouped by SINTA rank categories
     * across all universities.
     *
     * @return array<string, mixed>
     */
    public function getCategoryStat(): array
    {
        $cacheKey = 'admin_category_statistics';

        return Cache::remember($cacheKey, 3600, function () {
            $journals = Journal::query()->get();
            $total = $journals->count();

            // Group by SINTA rank
            $sintaGroups = $journals->groupBy('sinta_rank');

            $categories = [];

            // SINTA 1-6
            for ($rank = 1; $rank <= 6; $rank++) {
                $key = "sinta_{$rank}";
                $count = $sintaGroups->get($key)?->count() ?? 0;
                $categories[] = [
                    'label' => "SINTA {$rank}",
                    'value' => $count,
                    'percentage' => $total > 0 ? round(($count / $total) * 100, 1) : 0,
                ];
            }

            // Non-SINTA
            $nonSintaCount = ($sintaGroups->get('non_sinta')?->count() ?? 0)
                + ($sintaGroups->get(null)?->count() ?? 0)
                + ($sintaGroups->get('')?->count() ?? 0);

            $categories[] = [
                'label' => 'Non-SINTA',
                'value' => $nonSintaCount,
                'percentage' => $total > 0 ? round(($nonSintaCount / $total) * 100, 1) : 0,
            ];

            return [
                'total' => $total,
                'categories' => $categories,
            ];
        });
    }

    /**
     * Clear faculty statistics cache.
     * Should be called when journals/users are modified.
     */
    public static function clearFacultyCache(): void
    {
        Cache::forget('admin_faculty_statistics');
        Cache::forget('admin_category_statistics');
    }
}
