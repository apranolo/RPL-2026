<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Models\PembinaanReview;
use App\Models\ReviewerAssignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Store a newly created review assessment in storage.
     */
    public function storeAssessment(StoreReviewRequest $request, ReviewerAssignment $assignment): RedirectResponse
    {
        $user = $request->user();

        // Authorize using PembinaanReviewPolicy 'submitReview'
        $this->authorize('submitReview', [
            PembinaanReview::class,
            $assignment->registration_id,
        ]);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $assignment, $user) {
            // Create the review
            PembinaanReview::create([
                'registration_id' => $assignment->registration_id,
                'reviewer_id' => $user->id,
                'score' => $validated['score'],
                'feedback' => $validated['feedback'],
                'recommendation' => $validated['recommendation'] ?? null,
                'reviewed_at' => now(),
            ]);

            // Update assignment status to completed
            $assignment->markCompleted();

            // Update registration review_status to review_selesai
            $assignment->registration()->update([
                'review_status' => 'review_selesai',
            ]);
        });

        return redirect()
            ->route('reviewer.assignments.show', $assignment)
            ->with('success', 'Penilaian proposal berhasil disimpan.');
    }

    /**
     * Update the specified review assessment in storage.
     */
    public function updateAssessment(StoreReviewRequest $request, ReviewerAssignment $assignment): RedirectResponse
    {
        $user = $request->user();

        // Find the existing review
        $review = PembinaanReview::where('registration_id', $assignment->registration_id)
            ->where('reviewer_id', $user->id)
            ->firstOrFail();

        // Authorize using PembinaanReviewPolicy 'update'
        $this->authorize('update', $review);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $review, $assignment) {
            $review->update([
                'score' => $validated['score'],
                'feedback' => $validated['feedback'],
                'recommendation' => $validated['recommendation'] ?? null,
            ]);

            // Ensure assignment and registration statuses are correct
            if (!$assignment->isCompleted()) {
                $assignment->markCompleted();
            }

            if ($assignment->registration->review_status !== 'review_selesai') {
                $assignment->registration()->update([
                    'review_status' => 'review_selesai',
                ]);
            }
        });

        return redirect()
            ->route('reviewer.assignments.show', $assignment)
            ->with('success', 'Penilaian proposal berhasil diperbarui.');
    }
}
