<?php

namespace App\Policies;

use App\Models\PembinaanReview;
use App\Models\User;

class PembinaanReviewPolicy
{
    /**
     * Determine whether the user can view any reviews.
     *
     * Rules:
     * - Super Admin: Can view all
     * - Admin Kampus: Can view reviews for their university
     * - Reviewer: Can view their own reviews
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can view the review.
     *
     * Rules:
     * - Super Admin: Can view all
     * - Admin Kampus: Can view if registration belongs to their university
     * - Reviewer: Can view their own reviews
     * - User: Can view reviews for their own registrations
     */
    public function view(User $user, PembinaanReview $review): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Super Admin can view all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can view reviews for their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $review->registration->journal->university_id;
        }

        // Reviewer can view their own reviews
        if ($user->isReviewer() && $user->id === $review->reviewer_id) {
            return true;
        }

        // User can view reviews for their registrations
        if ($user->isUser() || $user->isPengelolaJurnal()) {
            return $user->id === $review->registration->user_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create reviews.
     *
     * Rules:
     * - Only Reviewers who are assigned to the registration can create reviews
     */
    public function create(User $user): bool
    {
        if (! $user->is_active) {
            return false;
        }

        return $user->isReviewer();
    }

    /**
     * Determine whether the user can submit review for specific registration.
     *
     * Rules:
     * - Reviewer must be assigned to the registration
     * - Registration must be approved
     * - Cannot submit duplicate review
     */
    public function submitReview(User $user, int $registrationId): bool
    {
        if (! $this->create($user)) {
            return false;
        }

        // Check registration
        $registration = \App\Models\PembinaanRegistration::find($registrationId);
        if (! $registration) {
            return false;
        }

        // Can only review approved registrations
        if (! $registration->isApproved()) {
            return false;
        }

        // Check if reviewer is assigned
        $isAssigned = $registration->reviewerAssignments()
            ->where('reviewer_id', $user->id)
            ->exists();

        if (! $isAssigned) {
            return false;
        }

        // Check if already reviewed
        $alreadyReviewed = PembinaanReview::where('registration_id', $registrationId)
            ->where('reviewer_id', $user->id)
            ->exists();

        return ! $alreadyReviewed;
    }

    /**
     * Determine whether the user can update the review.
     *
     * Rules:
     * - Reviewer can update their own reviews
     * - Super Admin can update any review
     */
    public function update(User $user, PembinaanReview $review): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Super Admin can update any
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Reviewer can update their own reviews
        if ($user->isReviewer() && $user->id === $review->reviewer_id) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the review.
     *
     * Rules:
     * - Reviewer can delete their own reviews
     * - Super Admin can delete any review
     */
    public function delete(User $user, PembinaanReview $review): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Super Admin can delete any
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Reviewer can delete their own reviews
        if ($user->isReviewer() && $user->id === $review->reviewer_id) {
            return true;
        }

        return false;
    }
}
