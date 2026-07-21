<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OutputStatsController extends Controller
{
    /**
     * Get total luaran grouped by type.
     */
    public function getCategory(): JsonResponse
    {
        $user = Auth::user();

        $query = DB::table('outputs as o')
            ->whereNull('o.deleted_at')
            ->where('o.status', 'verified');

        if ($user && $user->isAdminKampus()) {
            $query->join('users as u', 'u.id', '=', 'o.user_id')
                ->where('u.university_id', $user->university_id);
        } elseif ($user && ! $user->isSuperAdmin()) {
            $query->where('o.user_id', $user->id);
        }

        $rows = $query->select(
            'o.type as category',
            DB::raw('COUNT(o.id) as total')
        )
            ->groupBy('o.type')
            ->orderBy('o.type')
            ->get();

        $data = $rows->map(fn ($row) => [
            'category' => $row->category,
            'label' => ucfirst($row->category),
            'total' => (int) $row->total,
        ])->values();

        $grandTotal = $data->sum('total');

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'grand_total' => $grandTotal,
            ],
        ]);
    }

    /**
     * Get total luaran grouped by year.
     */
    public function getYearly(Request $request): JsonResponse
    {
        $from = $request->integer('from') ?: null;
        $to = $request->integer('to') ?: null;
        $user = Auth::user();

        $query = DB::table('outputs as o')
            ->whereNull('o.deleted_at')
            ->where('o.status', 'verified')
            ->when($from, fn ($q) => $q->where('o.year', '>=', $from))
            ->when($to, fn ($q) => $q->where('o.year', '<=', $to));

        if ($user && $user->isAdminKampus()) {
            $query->join('users as u', 'u.id', '=', 'o.user_id')
                ->where('u.university_id', $user->university_id);
        } elseif ($user && ! $user->isSuperAdmin()) {
            $query->where('o.user_id', $user->id);
        }

        $rows = $query->select(
            'o.year',
            DB::raw('COUNT(o.id) as total')
        )
            ->groupBy('o.year')
            ->orderBy('o.year')
            ->get();

        $data = $rows->map(fn ($row) => [
            'year' => (int) $row->year,
            'total' => (int) $row->total,
        ])->values();

        $grandTotal = $data->sum('total');

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'from' => $from,
                'to' => $to,
                'grand_total' => $grandTotal,
            ],
        ]);
    }
}
