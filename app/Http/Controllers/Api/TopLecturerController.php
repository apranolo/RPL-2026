<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TopLecturerController extends Controller
{
    /**
     * Mengambil top 5 dosen paling produktif berdasarkan jumlah proposal yang diajukan.
     */
    public function getTop(): JsonResponse
    {
        $universityId = Auth::user()->university_id;

        $topLecturers = User::select(
            'users.name',
            DB::raw('COUNT(proposals.id) as score')
        )
            ->join('proposals', 'users.id', '=', 'proposals.user_id')
            ->where('users.university_id', $universityId)
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('score')
            ->limit(5)
            ->get();

        if ($topLecturers->isEmpty()) {
            $topLecturers = User::select('name', DB::raw('0 as score'))
                ->where('is_active', true)
                ->where('university_id', $universityId)
                ->limit(5)
                ->get();
        }

        return response()->json($topLecturers);
    }
}
