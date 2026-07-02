<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TopLecturerCtrl extends Controller
{
    /**
     * Mengambil top 5 dosen paling produktif berdasarkan jumlah proposal yang diajukan.
     *
     * @return JsonResponse
     */
    public function getTop(): JsonResponse
    {
        $topLecturers = User::select(
                'users.name',
                DB::raw('COUNT(proposals.id) as score')
            )
            ->join('proposals', 'users.id', '=', 'proposals.user_id')
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('score')
            ->limit(5)
            ->get();

        // Fallback: jika belum ada proposal sama sekali, ambil 5 user aktif
        if ($topLecturers->isEmpty()) {
            $topLecturers = User::select('name', DB::raw('0 as score'))
                ->where('is_active', true)
                ->limit(5)
                ->get();
        }

        return response()->json($topLecturers);
    }
}
