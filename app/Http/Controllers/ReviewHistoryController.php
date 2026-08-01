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
     * @return \Inertia\Response|\Illuminate\Http\JsonResponse
     */
    public function index(Request $request, ?User $dosen = null)
    {
        // --- AUTHORIZATION CHECK ---
        if ($dosen && $request->user()->isAdminKampus() && $dosen->university_id !== $request->user()->university_id) {
            abort(403, 'Anda hanya dapat melihat riwayat dosen dari universitas Anda sendiri.');
        }

        // Tentukan ID reviewer: dari parameter jika ada, jika tidak dari user login
        $reviewerId = $dosen ? $dosen->id : $request->user()->id;

        // Riwayat Review (Review Selesai)
        $reviewsQuery = Review::with([
            'proposal.user.university',
            'proposal.researchSchema',
            'reviewer',
        ])
            ->byReviewer($reviewerId)
            ->latest();

        // Riwayat Jadwal/Penugasan Review (Schedules)
        $reviewSchedulesQuery = ReviewSchedule::with([
            'proposal.user.university',
            'proposal.researchSchema',
            'reviewer',
        ])
            ->forReviewer($reviewerId)
            ->latest();

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
