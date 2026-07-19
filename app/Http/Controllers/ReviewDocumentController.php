<?php

namespace App\Http\Controllers;

use App\Models\Review;
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
        $proposal = null;
        $reviewerId = null;
        $proposerId = null;

        if ($type === 'proposal') {
            $review = Review::with([
                'proposal.user.university',
                'proposal.researchSchema',
                'reviewer'
            ])->findOrFail($id);

            $proposal = $review->proposal;
            $reviewerId = $review->reviewer_id;
            $proposerId = $proposal?->user_id;
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
        // 3. The proposer who owns/submitted the proposal is authorized
        elseif ($proposerId && (int) $user->id === (int) $proposerId) {
            $isAuthorized = true;
        }
        // 4. Admin Kampus from the same university as the proposer is authorized
        elseif ($user->isAdminKampus() && $proposal && $proposal->user && (int) $proposal->user->university_id === (int) $user->university_id) {
            $isAuthorized = true;
        }

        if (!$isAuthorized) {
            abort(403, 'Anda tidak memiliki akses untuk mencetak berita acara ini.');
        }

        return view('print.berita_acara', [
            'type' => $type,
            'review' => $review,
            'proposal' => $proposal,
        ]);
    }
}
