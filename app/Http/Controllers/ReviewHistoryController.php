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
        // --- AUTHENTICATION CHECK ---
        if (! $request->user()) {
            return redirect()->route('login');
        }

        // --- AUTHORIZATION CHECK ---
        if ($dosen && $request->user()->isAdminKampus() && $dosen->university_id !== $request->user()->university_id) {
            abort(403, 'Anda hanya dapat melihat riwayat dosen dari universitas Anda sendiri.');
        }

        // Tentukan ID reviewer/dosen: dari parameter jika ada, jika tidak dari user login
        $targetUserId = $dosen ? $dosen->id : $request->user()->id;
        $targetUser = $dosen ?: $request->user();

        // Menentukan context (Reviewer vs Author) secara dinamis:
        // Jika parameter dosen diisi, itu berarti Admin sedang menginspeksi dosen tersebut.
        // Jika kosong (melihat riwayat sendiri), Dosen/Author/Pengelola Jurnal selalu diarahkan ke konteks Author.
        if ($dosen) {
            $isReviewer = $dosen->isReviewer();
        } else {
            $currentUser = $request->user();
            if ($currentUser->isUser() || $currentUser->isPengelolaJurnal() || $request->routeIs('proposal.history')) {
                $isReviewer = false;
            } else {
                $isReviewer = $currentUser->isReviewer();
            }
        }

        if ($isReviewer) {
            // Riwayat Review (Review Selesai) yang dikerjakan oleh Reviewer
            $reviewsQuery = Review::with([
                'proposal.user.university',
                'proposal.researchSchema',
                'reviewer',
            ])
                ->byReviewer($targetUserId)
                ->orderBy('reviewed_at', 'desc');

            // Riwayat Jadwal/Penugasan Review (Schedules)
            $reviewSchedulesQuery = ReviewSchedule::with([
                'proposal.user.university',
                'proposal.researchSchema',
                'reviewer',
            ])
                ->forReviewer($targetUserId)
                ->orderBy('assigned_at', 'desc');
        } else {
            // Jika user adalah Dosen/Pengusul, tampilkan review yang diterima proposal mereka
            $reviewsQuery = Review::with([
                'proposal.user.university',
                'proposal.researchSchema',
                'reviewer',
            ])
                ->whereHas('proposal', function ($query) use ($targetUserId) {
                    $query->where('user_id', $targetUserId);
                })
                ->orderBy('reviewed_at', 'desc');

            // Dosen tidak memiliki jadwal penugasan review
            $reviewSchedulesQuery = ReviewSchedule::whereRaw('1 = 0');
        }

        // Ambil data dengan pagination
        $reviews = $reviewsQuery->paginate(10, ['*'], 'reviews_page')->withQueryString();
        $reviewSchedules = $reviewSchedulesQuery->paginate(10, ['*'], 'schedules_page')->withQueryString();

        if ($request->wantsJson()) {
            return response()->json([
                'dosen' => $dosen,
                'reviews' => $reviews,
                'review_schedules' => $reviewSchedules,
                'isReviewer' => $isReviewer,
            ]);
        }

        // Return view menggunakan Inertia
        return Inertia::render('Proposal/ReviewHistory', [
            'dosen' => $dosen,
            'reviews' => $reviews,
            'reviewSchedules' => $reviewSchedules,
            'isReviewer' => $isReviewer,
        ]);
    }
}
