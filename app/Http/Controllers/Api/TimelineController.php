<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalAssessment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TimelineController extends Controller
{
    /**
     * Get chart data for the timeline progress visualization.
     *
     * Returns monthly aggregated data scoped by user role.
     * Query params: year (int, optional, defaults to current year).
     */
    public function getChart(Request $request): JsonResponse
    {
        $user = $request->user()->load(['role']);
        $year = (int) $request->input('year', date('Y'));

        // -----------------------------------------------------------------
        // 1. Menggunakan Model yang Tepat
        // -----------------------------------------------------------------
        $baseQuery = JournalAssessment::query()
            ->whereYear('created_at', $year);

        // -----------------------------------------------------------------
        // 2. Filter Akses Berdasarkan Role
        // -----------------------------------------------------------------
        if ($user->role->name === 'Admin Kampus') {
            $baseQuery->whereHas('journal', fn ($q) => $q->where('university_id', $user->university_id)
            );
        } elseif ($user->role->name !== 'Super Admin') {
            $baseQuery->where('user_id', $user->id);
        }

        // -----------------------------------------------------------------
        // 3. Kalkulasi Data Bulanan
        // -----------------------------------------------------------------
        // Monthly counts
        $monthlyCounts = (clone $baseQuery)
            ->select(DB::raw('MONTH(created_at) as month'), DB::raw('COUNT(*) as count'))
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->pluck('count', 'month')->toArray();

        // Monthly scores (menggunakan 'percentage' sebagai nilai skor persentase)
        $monthlyScores = (clone $baseQuery)->whereNotNull('percentage')
            ->select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('AVG(percentage) as avg_score'),
                DB::raw('MAX(percentage) as max_score'),
                DB::raw('MIN(percentage) as min_score')
            )
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->get()->keyBy('month')->toArray();

        // Status distribution
        $statusDist = (clone $baseQuery)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')->pluck('count', 'status')->toArray();

        // -----------------------------------------------------------------
        // 4. Formatting Timeline
        // -----------------------------------------------------------------
        $months = [1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Ags', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'];

        $totalYear = (clone $baseQuery)->count();
        $timeline = [];
        $cumulative = 0;

        foreach ($months as $num => $label) {
            $count = $monthlyCounts[$num] ?? 0;
            $cumulative += $count;
            $scores = $monthlyScores[$num] ?? null;

            $timeline[] = [
                'month' => $num,
                'label' => $label,
                'count' => $count,
                'cumulative' => $cumulative,
                'progress' => $totalYear > 0 ? round(($cumulative / $totalYear) * 100, 1) : 0,
                'avg_score' => $scores ? round((float) $scores['avg_score'], 1) : null,
                'max_score' => $scores ? round((float) $scores['max_score'], 1) : null,
                'min_score' => $scores ? round((float) $scores['min_score'], 1) : null,
            ];
        }

        // -----------------------------------------------------------------
        // 5. Response
        // -----------------------------------------------------------------
        return response()->json([
            'year' => $year,
            'total' => $totalYear,
            'timeline' => $timeline,
            'status_distribution' => [
                'draft' => $statusDist['draft'] ?? 0,
                'submitted' => $statusDist['submitted'] ?? 0,
                'reviewed' => $statusDist['reviewed'] ?? 0,
            ],
            'summary' => [
                'total_evaluations' => $totalYear,
                'avg_score' => $totalYear > 0
                    ? round((clone $baseQuery)->whereNotNull('percentage')->avg('percentage') ?? 0, 1)
                    : 0,
                'completion_rate' => $totalYear > 0
                    ? round(((clone $baseQuery)->where('status', 'reviewed')->count() / $totalYear) * 100, 1)
                    : 0,
            ],
        ]);
    }
}
