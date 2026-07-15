<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerController extends Controller
{
    /**
     * Display a listing of the reviewer tasks.
     */
    public function index(Request $request): Response
    {
        return $this->assignments($request);
    }

    /**
     * Display reviewer's assignments based on Review records.
     */
    public function assignments(Request $request): Response
    {
        $reviews = $this->reviewerReviewsQuery($request)
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Reviewer/index', [
            'tasks' => $reviews,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show a review detail using Review model.
     */
    public function show(Request $request, int $reviewId): Response
    {
        $review = $this->findOwnReview($request, $reviewId);
        $review->load(['proposal', 'assessmentCriteria']);

        return Inertia::render('Reviewer/index', [
            'tasks' => $this->reviewerReviewsQuery($request)
                ->latest('created_at')
                ->paginate(15)
                ->withQueryString(),
            'selectedReview' => $review,
        ]);
    }

    /**
     * Show review submission form using Review model.
     */
    public function reviewForm(Request $request, int $reviewId): Response
    {
        $review = $this->findOwnReview($request, $reviewId);
        $review->load(['proposal', 'assessmentCriteria']);

        return Inertia::render('Reviewer/index', [
            'tasks' => $this->reviewerReviewsQuery($request)
                ->latest('created_at')
                ->paginate(15)
                ->withQueryString(),
            'selectedReview' => $review,
        ]);
    }

    /**
     * Submit or update a review record.
     */
    public function submitReview(Request $request, int $reviewId): RedirectResponse
    {
        $review = $this->findOwnReview($request, $reviewId);

        $validated = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
            'total_score' => 'nullable|numeric|min:0|max:100',
            'feedback' => 'nullable|string|max:2000',
            'notes' => 'nullable|string|max:2000',
            'status' => 'nullable|string|max:50',
            'recommendation' => 'nullable|string|max:1000',
        ]);

        $review->fill([
            'status' => $validated['status'] ?? 'completed',
            'notes' => $validated['notes'] ?? $validated['feedback'] ?? $review->notes,
            'total_score' => $validated['total_score'] ?? $validated['score'] ?? $review->total_score,
            'recommendation' => $validated['recommendation'] ?? $review->recommendation,
            'end_date' => now(),
        ])->save();

        return redirect()
            ->route('reviewer.assignments.index')
            ->with('success', 'Review updated successfully.');
    }

    /**
     * Download attachment from review record.
     */
    public function downloadAttachment(Request $request, int $reviewId, int $attachmentId): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $review = $this->findOwnReview($request, $reviewId);

        $attachment = $review->proposal?->attachments()?->findOrFail($attachmentId);

        if (! $attachment || ! $attachment->fileExists()) {
            abort(404, 'File not found.');
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download(
            $attachment->file_path,
            $attachment->file_name
        );
    }

    private function reviewerReviewsQuery(Request $request)
    {
        $query = Review::query()
            ->where('reviewer_id', $request->user()->id)
            ->with(['proposal', 'assessmentCriteria']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return $query;
    }

    private function findOwnReview(Request $request, int $reviewId): Review
    {
        return Review::where('reviewer_id', $request->user()->id)
            ->findOrFail($reviewId);
    }
}