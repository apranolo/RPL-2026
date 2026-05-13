<?php

namespace App\Http\Controllers;

use App\Models\JournalAssessment;
use App\Models\PembinaanReview;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewHistoryController extends Controller
{
    /**
     * Menampilkan riwayat review dosen.
     * Jika parameter dosen diberikan, akan menampilkan riwayat dosen tersebut (untuk Admin).
     * Jika tidak, akan menampilkan riwayat user yang sedang login (untuk Reviewer/Dosen).
     */
    public function index(Request $request, ?User $dosen = null)
    {
        // Tentukan ID reviewer: dari parameter jika ada, jika tidak dari user login
        $reviewerId = $dosen ? $dosen->id : $request->user()->id;

        // Riwayat Pembinaan Review
        $pembinaanReviewsQuery = PembinaanReview::with([
            'registration.pembinaan',
            'registration.journal.university',
            'registration.user'
        ])
        ->byReviewer($reviewerId)
        ->orderBy('reviewed_at', 'desc');

        // Riwayat Journal Assessment (Penilaian Jurnal)
        $journalAssessmentsQuery = JournalAssessment::with([
            'journal.university',
            'user'
        ])
        ->where('reviewed_by', $reviewerId)
        ->where('status', 'reviewed')
        ->orderBy('reviewed_at', 'desc');

        // Ambil data (menggunakan pagination)
        $pembinaanReviews = $pembinaanReviewsQuery->paginate(10, ['*'], 'pembinaan_page')->withQueryString();
        $journalAssessments = $journalAssessmentsQuery->paginate(10, ['*'], 'journal_page')->withQueryString();

        
        if ($request->wantsJson()) {
            return response()->json([
                'dosen' => $dosen,
                'pembinaan_reviews' => $pembinaanReviews,
                'journal_assessments' => $journalAssessments,
            ]);
        }

        // Return view menggunakan Inertia
        return Inertia::render('Proposal/ReviewHistory', [
            'dosen' => $dosen,
            'pembinaanReviews' => $pembinaanReviews,
            'journalAssessments' => $journalAssessments,
        ]);
    }
}
