<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Http\Requests\ReviewSubmissionRequest;
use App\Models\ReviewDecision;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Save draft review
     */
    public function saveDraft(
        ReviewSubmissionRequest $request,
        int $assignmentId
    ): RedirectResponse {

        ReviewDecision::updateOrCreate(
            [
                'review_assignment_id' => $assignmentId,
                'reviewer_id' => Auth::id(),
            ],
            [
                'recommendation' => $request->recommendation,
                'scores' => $request->scores,
                'overall_comment' => $request->overall_comment,
                'is_submitted' => false,
            ]
        );

        return back()->with(
            'success',
            'Draft review berhasil disimpan.'
        );
    }

    /**
     * Submit final recommendation
     */
    public function submitRecommendation(
        ReviewSubmissionRequest $request,
        int $assignmentId
    ): RedirectResponse {

        ReviewDecision::updateOrCreate(
            [
                'review_assignment_id' => $assignmentId,
                'reviewer_id' => Auth::id(),
            ],
            [
                'recommendation' => $request->recommendation,
                'scores' => $request->scores,
                'overall_comment' => $request->overall_comment,
                'is_submitted' => true,
                'submitted_at' => now(),
            ]
        );

        return redirect()
            ->back()
            ->with(
                'success',
                'Final recommendation berhasil dikirim.'
            );
    }
}