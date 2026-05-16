<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerController extends Controller
{
    /**
     * List assignments
     */
    public function assignments(): Response
    {
        return Inertia::render('Reviewer/Assignments', [
            'assignments' => [],
        ]);
    }

    /**
     * Show assignment detail
     */
    public function show($assignment): Response
    {
        return Inertia::render('Reviewer/Show', [
            'assignment' => $assignment,
        ]);
    }

    /**
     * Review form
     */
    public function reviewForm($assignment): Response
    {
        return Inertia::render('Review/Recommendation', [
            'reviewDecisionId' => $assignment,
        ]);
    }

    /**
     * Submit review
     */
    public function submitReview(Request $request, $assignment)
    {
        return redirect()->back()->with('success', 'Review submitted.');
    }

    /**
     * Download attachment
     */
    public function downloadAttachment($assignment, $attachment)
    {
        abort(404);
    }
}