<?php

namespace App\Http\Controllers;

use App\Models\PembinaanReview;
use App\Models\ReviewerAssignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerController extends Controller
{
    /**
     * Display reviewer's assignments.
     */
    public function assignments(Request $request): Response
    {
        $user = $request->user();

        $query = ReviewerAssignment::forReviewer($user->id)
            ->with([
                'registration.pembinaan',
                'registration.journal.university',
                'registration.journal.scientificField',
                'registration.user',
                'assigner',
            ]);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $assignments = $query->orderBy('assigned_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Reviewer/Assignments/Index', [
            'assignments' => $assignments,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show assignment detail with registration information.
     */
    public function show(ReviewerAssignment $assignment): Response
    {
        $this->authorize('view', $assignment);

        $assignment->load([
            'registration.pembinaan.accreditationTemplate',
            'registration.journal.university',
            'registration.journal.scientificField',
            'registration.journal.user',
            'registration.user',
            'registration.attachments.uploader',
            'assigner',
        ]);

        // Check if review already submitted
        $existingReview = PembinaanReview::where('registration_id', $assignment->registration_id)
            ->where('reviewer_id', $assignment->reviewer_id)
            ->first();

        return Inertia::render('Reviewer/Assignments/Show', [
            'assignment' => $assignment,
            'existingReview' => $existingReview,
        ]);
    }

    /**
     * Show review submission form.
     */
    public function reviewForm(ReviewerAssignment $assignment): Response
    {
        $user = request()->user();

        // Authorize via policy
        $this->authorize('submitReview', [
            PembinaanReview::class,
            $user->id,
            $assignment->registration_id,
        ]);

        $assignment->load([
            'registration.pembinaan.accreditationTemplate',
            'registration.journal.university',
            'registration.journal.scientificField',
            'registration.attachments',
        ]);

        return Inertia::render('Reviewer/Assignments/Review', [
            'assignment' => $assignment,
        ]);
    }

    /**
     * Submit review for an assignment.
     */
    public function submitReview(Request $request, ReviewerAssignment $assignment): RedirectResponse
    {
        $user = $request->user();

        // Authorize via policy
        $this->authorize('submitReview', [
            PembinaanReview::class,
            $user->id,
            $assignment->registration_id,
        ]);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'feedback' => 'required|string|max:2000',
            'recommendation' => 'nullable|string|max:1000',
        ]);

        // Create review
        PembinaanReview::create([
            'registration_id' => $assignment->registration_id,
            'reviewer_id' => $user->id,
            'score' => $validated['score'],
            'feedback' => $validated['feedback'],
            'recommendation' => $validated['recommendation'],
            'reviewed_at' => now(),
        ]);

        // Update assignment status to completed
        $assignment->markCompleted();

        // TODO: Send email notification to Admin Kampus and User

        return redirect()
            ->route('reviewer.assignments.show', $assignment)
            ->with('success', 'Review submitted successfully.');
    }

    /**
     * Download attachment from registration.
     */
    public function downloadAttachment(ReviewerAssignment $assignment, $attachmentId): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('view', $assignment);

        $attachment = $assignment->registration->attachments()->findOrFail($attachmentId);

        if (! $attachment->fileExists()) {
            abort(404, 'File not found.');
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download(
            $attachment->file_path,
            $attachment->file_name
        );
    }
}
