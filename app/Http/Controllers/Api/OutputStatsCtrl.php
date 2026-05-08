<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutputStatsCtrl extends Controller
{
    /**
     * Get total luaran (journal registration outcomes) grouped by pembinaan category.
     *
     * Returns the count of approved pembinaan registrations per category
     * (e.g., 'akreditasi', 'indeksasi'), giving a breakdown of how many
     * journal outputs belong to each pembinaan programme category.
     *
     * @return JsonResponse
     *
     * @example GET /api/stats/outputs/by-category
     * Response:
     * {
     *   "success": true,
     *   "data": [
     *     { "category": "akreditasi", "label": "Akreditasi", "total": 42 },
     *     { "category": "indeksasi", "label": "Indeksasi",  "total": 18 }
     *   ],
     *   "meta": {
     *     "grand_total": 60
     *   }
     * }
     */
    public function getCategory(): JsonResponse
    {
        // Category label map (matches Pembinaan::getCategoryLabelAttribute)
        $categoryLabels = [
            'akreditasi' => 'Akreditasi',
            'indeksasi'  => 'Indeksasi',
        ];

        // Aggregate approved registrations by pembinaan category.
        // Joins pembinaan_registrations → pembinaan to get the category,
        // then counts only approved registrations (confirmed outputs).
        $rows = DB::table('pembinaan_registrations as pr')
            ->join('pembinaan as p', 'p.id', '=', 'pr.pembinaan_id')
            ->whereNull('pr.deleted_at')
            ->whereNull('p.deleted_at')
            ->where('pr.status', 'approved')
            ->select(
                'p.category',
                DB::raw('COUNT(pr.id) as total')
            )
            ->groupBy('p.category')
            ->orderBy('p.category')
            ->get();

        // Build the response payload, filling in labels and ensuring every
        // known category appears (even when its count is zero).
        $data = collect($categoryLabels)
            ->map(function (string $label, string $category) use ($rows) {
                $row = $rows->firstWhere('category', $category);

                return [
                    'category' => $category,
                    'label'    => $label,
                    'total'    => $row ? (int) $row->total : 0,
                ];
            })
            ->values();

        // Include any unexpected/custom categories returned by the query
        // that are not in the known label map.
        $knownCategories = array_keys($categoryLabels);
        $extra = $rows
            ->filter(fn ($row) => ! in_array($row->category, $knownCategories))
            ->map(fn ($row) => [
                'category' => $row->category,
                'label'    => ucfirst($row->category),
                'total'    => (int) $row->total,
            ])
            ->values();

        $data = $data->concat($extra);

        $grandTotal = $data->sum('total');

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'grand_total' => $grandTotal,
            ],
        ]);
    }

    /**
     * Get total luaran (approved pembinaan registrations) grouped by year.
     *
     * The year is derived from the registration date (`registered_at`).
     * Accepts optional query-string filters:
     *   - `from` (int) – earliest year to include (inclusive)
     *   - `to`   (int) – latest  year to include (inclusive)
     *
     * @return JsonResponse
     *
     * @example GET /api/stats/outputs/yearly?from=2024&to=2026
     * Response:
     * {
     *   "success": true,
     *   "data": [
     *     { "year": 2024, "total": 15 },
     *     { "year": 2025, "total": 27 },
     *     { "year": 2026, "total": 8  }
     *   ],
     *   "meta": {
     *     "from": 2024,
     *     "to":   2026,
     *     "grand_total": 50
     *   }
     * }
     */
    public function getYearly(Request $request): JsonResponse
    {
        $from = $request->integer('from') ?: null;
        $to   = $request->integer('to')   ?: null;

        // Aggregate approved registrations by the year of registered_at.
        // Respects soft-deletes on both tables and optional year bounds.
        $rows = DB::table('pembinaan_registrations as pr')
            ->join('pembinaan as p', 'p.id', '=', 'pr.pembinaan_id')
            ->whereNull('pr.deleted_at')
            ->whereNull('p.deleted_at')
            ->where('pr.status', 'approved')
            ->when($from, fn ($q) => $q->whereYear('pr.registered_at', '>=', $from))
            ->when($to,   fn ($q) => $q->whereYear('pr.registered_at', '<=', $to))
            ->select(
                DB::raw('YEAR(pr.registered_at) as year'),
                DB::raw('COUNT(pr.id) as total')
            )
            ->groupBy(DB::raw('YEAR(pr.registered_at)'))
            ->orderBy(DB::raw('YEAR(pr.registered_at)'))
            ->get();

        // Cast to clean types for JSON serialisation.
        $data = $rows->map(fn ($row) => [
            'year'  => (int) $row->year,
            'total' => (int) $row->total,
        ])->values();

        $grandTotal = $data->sum('total');

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'from'        => $from,
                'to'          => $to,
                'grand_total' => $grandTotal,
            ],
        ]);
    }
}
