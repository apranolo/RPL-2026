<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\ReviewSchedule;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewHistoryController extends Controller
{
    /**
     * Menampilkan riwayat review dosen.
     * Jika parameter dosen diberikan, akan menampilkan riwayat dosen tersebut (untuk Admin).
     * Jika tidak, akan menampilkan riwayat user yang sedang login (untuk Reviewer/Dosen).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User|null  $dosen
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request, ?User $dosen = null)
    {
        // --- AUTHORIZATION CHECK ---
        if ($dosen && $dosen->id !== $request->user()->id) {
            // Hanya Super Admin atau Admin Kampus yang diperbolehkan melihat riwayat review dosen lain
            if (!$request->user()->isSuperAdmin() && !$request->user()->isAdminKampus()) {
                abort(403, 'Anda tidak memiliki otorisasi untuk melihat riwayat review dosen lain.');
            }
        }

        // Tentukan ID reviewer: dari parameter jika ada, jika tidak dari user login
        $reviewerId = $dosen ? $dosen->id : $request->user()->id;

        // Riwayat Review (Review Selesai)
        $reviewsQuery = Review::with([
            'registration.pembinaan',
            'registration.journal.university',
            'registration.journal.scientificField',
            'registration.user'
        ])
        ->byReviewer($reviewerId)
        ->orderBy('reviewed_at', 'desc');

        // Riwayat Jadwal/Penugasan Review (Schedules)
        $reviewSchedulesQuery = ReviewSchedule::with([
            'registration.pembinaan',
            'registration.journal.university',
            'registration.journal.scientificField',
            'registration.user'
        ])
        ->forReviewer($reviewerId)
        ->orderBy('assigned_at', 'desc');

        // Ambil data dengan pagination
        $reviews = $reviewsQuery->paginate(10, ['*'], 'reviews_page')->withQueryString();
        $reviewSchedules = $reviewSchedulesQuery->paginate(10, ['*'], 'schedules_page')->withQueryString();

        if ($request->wantsJson()) {
            return response()->json([
                'dosen' => $dosen,
                'reviews' => $reviews,
                'review_schedules' => $reviewSchedules,
            ]);
        }

        // Return view menggunakan Inertia
        return Inertia::render('Proposal/ReviewHistory', [
            'dosen' => $dosen,
            'reviews' => $reviews,
            'reviewSchedules' => $reviewSchedules,
        ]);
    }
}
