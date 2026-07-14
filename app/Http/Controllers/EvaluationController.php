<?php

namespace App\Http\Controllers;

use App\Models\ReviewerAssignment;
use App\Models\PembinaanReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    // Task 10 - index(): daftar proposal yang perlu dievaluasi
    public function index()
    {
        $assignments = ReviewerAssignment::with([
            'registration.journal.university',
            'registration.pembinaan',
        ])
            ->where('reviewer_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Reviewer/Evaluation/Index', [
            'assignments' => $assignments,
        ]);
    }

    /**
     * Show evaluation note input form.
     */
    public function note(ReviewerAssignment $assignment)
    {
        abort_if($assignment->reviewer_id !== Auth::id(), 403);

        $assignment->load([
            'registration.journal.university',
            'registration.journal.scientificField',
            'registration.pembinaan',
            'registration.reviewerAssignments.reviewer',
        ]);

        $existingReview = PembinaanReview::where('registration_id', $assignment->registration_id)
            ->where('reviewer_id', Auth::id())
            ->first();

        return Inertia::render('Reviewer/Evaluation/Note', [
            'assignment' => $assignment,
            'existingReview' => $existingReview,
        ]);
    }

    /**
     * Submit/save evaluation note.
     */
    public function submit(Request $request, ReviewerAssignment $assignment)
    {
        abort_if($assignment->reviewer_id !== Auth::id(), 403);

        $validated = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
            'feedback' => 'required|string|max:2000',
            'recommendation' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($assignment, $validated) {
            PembinaanReview::updateOrCreate(
                [
                    'registration_id' => $assignment->registration_id,
                    'reviewer_id' => Auth::id(),
                ],
                [
                    'score' => $validated['score'] ?? null,
                    'feedback' => $validated['feedback'],
                    'recommendation' => $validated['recommendation'] ?? null,
                    'reviewed_at' => now(),
                ]
            );

            // Update assignment status to completed
            $assignment->status = 'completed';
            $assignment->save();

            // Update registration review_status to review_selesai
            $registration = $assignment->registration;
            if ($registration) {
                $registration->review_status = 'review_selesai';
                $registration->save();
            }
        });

        return redirect()
            ->route('reviewer.evaluations.note', $assignment->id)
            ->with('success', 'Catatan evaluasi berhasil disimpan.');
    }

    /**
     * Update status Monev.
     */
    public function updateStatus(Request $request, ReviewerAssignment $assignment)
    {
        abort_if($assignment->reviewer_id !== Auth::id(), 403);

        $validated = $request->validate([
            'review_status' => 'required|in:menunggu_reviewer,sedang_direview,review_selesai,ditolak',
        ]);

        DB::transaction(function () use ($assignment, $validated) {
            $registration = $assignment->registration;
            if ($registration) {
                $registration->review_status = $validated['review_status'];
                $registration->save();
            }

            // Sync assignment status
            if ($validated['review_status'] === 'sedang_direview') {
                $assignment->status = 'in_progress';
            } elseif ($validated['review_status'] === 'menunggu_reviewer') {
                $assignment->status = 'assigned';
            } elseif (in_array($validated['review_status'], ['review_selesai', 'ditolak'])) {
                $assignment->status = 'completed';
            }
            $assignment->save();
        });

        return redirect()
            ->route('reviewer.evaluations.note', $assignment->id)
            ->with('success', 'Status Monev berhasil diperbarui.');
    }
}
