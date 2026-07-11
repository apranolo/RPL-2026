<?php

namespace App\Http\Controllers;

use App\Models\ReviewerAssignment;
use App\Models\ReviewerProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewerProfileController extends Controller
{
    /**
     * Show the reviewer's profile page.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load(['role', 'university', 'scientificField']);
        $profile = $user->reviewerProfile;
        $totalReviews = ReviewerAssignment::where('reviewer_id', $user->id)->count();
        $completedReviews = ReviewerAssignment::where('reviewer_id', $user->id)->where('status', 'completed')->count();
        $inProgressReviews = ReviewerAssignment::where('reviewer_id', $user->id)->where('status', 'in_progress')->count();
        $assignedReviews = ReviewerAssignment::where('reviewer_id', $user->id)->where('status', 'assigned')->count();

        if ($profile) {
            // Synchronize stats to database if they differ
            if ($profile->total_reviews !== $totalReviews || $profile->completed_reviews !== $completedReviews) {
                $profile->update([
                    'total_reviews' => $totalReviews,
                    'completed_reviews' => $completedReviews,
                ]);
            }
        }

        return Inertia::render('Profile/ReviewerProfile', [
            'profile' => $profile,
            'statistics' => [
                'total_reviews' => $totalReviews,
                'completed_reviews' => $completedReviews,
                'in_progress_reviews' => $inProgressReviews,
                'assigned_reviews' => $assignedReviews,
            ],
        ]);
    }

    /**
     * Store or update the reviewer's profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'research_interests' => 'nullable|array',
            'research_interests.*' => 'string|max:100',
            'biography' => 'nullable|string|max:5000',
        ]);

        $totalReviews = ReviewerAssignment::where('reviewer_id', $user->id)->count();
        $completedReviews = ReviewerAssignment::where('reviewer_id', $user->id)->where('status', 'completed')->count();
        ReviewerProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'research_interests' => $validated['research_interests'] ?? [],
                'biography' => $validated['biography'] ?? null,
                'total_reviews' => $totalReviews,
                'completed_reviews' => $completedReviews,
            ]
        );

        return back()->with('success', 'Profil Reviewer berhasil diperbarui.');
    }
}
