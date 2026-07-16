<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Aggregate faculty performance statistics for Modul 6 Kelas B.
     *
     * Returns per-faculty (using university as proxy) metrics:
     * - faculty_name: Name of the faculty/university
     * - submitted: Total proposals submitted
     * - accepted: Total research outputs (luaran) accepted/approved
     *
     * @return array<int, array<string, mixed>>
     */
    public function getFacultyStat(): array
    {
        $cacheKey = 'admin_faculty_performance_b';

        return Cache::remember($cacheKey, 3600, function () {
            $universities = University::query()->active()->get();

            $facultyStats = [];

            foreach ($universities as $university) {
                // Get all users in this university (acting as faculty)
                $userIds = User::where('university_id', $university->id)->pluck('id');

                if ($userIds->isEmpty()) {
                    continue; // Skip faculties with no users
                }

                // Count total proposals (submitted)
                $submitted = DB::table('proposals')
                    ->whereIn('user_id', $userIds)
                    ->count();

                // Count research outputs (accepted/luaran)
                $accepted = DB::table('research_outputs')
                    ->whereIn('user_id', $userIds)
                    ->where('status', 'approved')
                    ->count();

                // Include if there's any activity
                if ($submitted > 0 || $accepted > 0) {
                    $facultyStats[] = [
                        'faculty_name' => $university->name,
                        'submitted' => $submitted,
                        'accepted' => $accepted,
                    ];
                }
            }

            // Sort by most submitted
            usort($facultyStats, fn ($a, $b) => $b['submitted'] <=> $a['submitted']);

            return $facultyStats;
        });
    }

    /**
     * Get aggregated category statistics for pie chart visualization (Modul 6 Kelas B).
     *
     * Returns proposal counts grouped by Research Schema (Kategori).
     *
     * @return array<string, mixed>
     */
    public function getCategoryStat(): array
    {
        $cacheKey = 'admin_category_statistics_b';

        return Cache::remember($cacheKey, 3600, function () {
            $schemas = DB::table('research_schemas')->get();
            
            $total = DB::table('proposals')->count();
            $categories = [];

            foreach ($schemas as $schema) {
                $count = DB::table('proposals')
                    ->where('research_schema_id', $schema->id)
                    ->count();

                if ($count > 0) {
                    $categories[] = [
                        'label' => $schema->name,
                        'value' => $count,
                        'percentage' => $total > 0 ? round(($count / $total) * 100, 1) : 0,
                    ];
                }
            }

            return [
                'total' => $total,
                'categories' => $categories,
            ];
        });
    }

    /**
     * Clear statistics cache.
     */
    public static function clearFacultyCache(): void
    {
        Cache::forget('admin_faculty_performance_b');
        Cache::forget('admin_category_statistics_b');
    }
}
