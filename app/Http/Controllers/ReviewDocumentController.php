<?php

namespace App\Http\Controllers;

use App\Models\JournalAssessment;
use App\Models\PembinaanReview;
use Illuminate\Http\Request;

class ReviewDocumentController extends Controller
{
    /**
     * Cetak Berita Acara Review.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $type
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function print(Request $request, string $type, int $id)
    {
        $user = $request->user();
        $review = null;
        $journal = null;
        $reviewerId = null;
        $proposerId = null;

        if ($type === 'pembinaan') {
            $review = PembinaanReview::with([
                'registration.pembinaan',
                'registration.journal.university',
                'registration.journal.scientificField',
                'registration.user',
                'reviewer'
            ])->findOrFail($id);

            $journal = $review->registration?->journal;
            $reviewerId = $review->reviewer_id;
            $proposerId = $review->registration?->user_id;

        } elseif ($type === 'assessment' || $type === 'journal_assessment') {
            $review = JournalAssessment::with([
                'journal.university',
                'journal.scientificField',
                'user',
                'reviewer'
            ])->findOrFail($id);

            $journal = $review->journal;
            $reviewerId = $review->reviewed_by;
            $proposerId = $review->user_id;
            $type = 'assessment'; // normalize type to assessment for view
        } else {
            abort(404, 'Tipe review tidak valid.');
        }

        // --- AUTHORIZATION CHECK ---
        $isAuthorized = false;

        // 1. Super Admin is always authorized
        if ($user->isSuperAdmin()) {
            $isAuthorized = true;
        }
        // 2. The reviewer who conducted the review is authorized
        elseif ($reviewerId && (int) $user->id === (int) $reviewerId) {
            $isAuthorized = true;
        }
        // 3. The proposer who owns/registered the journal is authorized
        elseif ($proposerId && (int) $user->id === (int) $proposerId) {
            $isAuthorized = true;
        }
        // 4. Admin Kampus from the same university is authorized
        elseif ($user->isAdminKampus() && $journal && (int) $journal->university_id === (int) $user->university_id) {
            $isAuthorized = true;
        }

        if (!$isAuthorized) {
            abort(403, 'Anda tidak memiliki akses untuk mencetak berita acara ini.');
        }

        return view('print.berita_acara', [
            'type' => $type,
            'review' => $review,
            'journal' => $journal,
        ]);
    }
}
