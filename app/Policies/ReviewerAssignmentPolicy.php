<?php

namespace App\Policies;

use App\Models\ReviewerAssignment;
use App\Models\User;

class ReviewerAssignmentPolicy
{
    /**
     * Determine whether the user can view any assignments.
     *
     * Rules:
     * - Super Admin: Can view all
     * - Admin Kampus: Can view assignments for their university
     * - Reviewer: Can view their own assignments
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can view the assignment.
     *
     * Rules:
     * - Super Admin: Can view all
     * - Admin Kampus: Can view if registration belongs to their university
     * - Reviewer: Can view their own assignments
     */
    public function view(User $user, ReviewerAssignment $assignment): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Super Admin can view all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can view assignments for their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $assignment->registration->journal->university_id;
        }

        // Reviewer can view their own assignments
        if ($user->isReviewer()) {
            return $user->id === $assignment->reviewer_id;
        }

        return false;
    }

    /**
     * Determine whether the user can create assignments (assign reviewers).
     *
     * Rules:
     * - Super Admin: Can assign to any registration
     * - Admin Kampus: Can assign to registrations from their university
     */
    public function create(User $user): bool
    {
        if (! $user->is_active) {
            return false;
        }

        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine whether the user can assign reviewer to specific registration.
     *
     * Rules:
     * - Super Admin: Can assign to any approved registration
     * - Admin Kampus: Can assign to approved registrations from their university
     * - Target user must have Reviewer role
     */
    public function assign(User $user, int $registrationId, int $reviewerId): bool
    {
        if (! $this->create($user)) {
            return false;
        }

        // Check registration
        $registration = \App\Models\PembinaanRegistration::find($registrationId);
        if (! $registration) {
            return false;
        }

        // Can only assign to approved registrations
        if (! $registration->isApproved()) {
            return false;
        }

        // Check university scope for Admin Kampus
        if ($user->isAdminKampus()) {
            if ($user->university_id !== $registration->journal->university_id) {
                return false;
            }
        }

        // Check if target user is a reviewer
        $reviewer = User::find($reviewerId);
        if (! $reviewer || ! $reviewer->isReviewer()) {
            return false;
        }

        // Check if already assigned
        $alreadyAssigned = ReviewerAssignment::where('registration_id', $registrationId)
            ->where('reviewer_id', $reviewerId)
            ->exists();

        return ! $alreadyAssigned;
    }

    /**
     * Determine whether the user can update the assignment.
     *
     * Rules:
     * - Reviewer can update status (mark as in progress, completed)
     */
    public function update(User $user, ReviewerAssignment $assignment): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Reviewer can update their own assignment status
        if ($user->isReviewer() && $user->id === $assignment->reviewer_id) {
            return true;
        }

        // Admin can update
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine whether the user can delete the assignment.
     *
     * Rules:
     * - Super Admin: Can delete any
     * - Admin Kampus: Can delete assignments for their university
     * - Assigner: Can delete their own assignments if not yet completed
     */
    public function delete(User $user, ReviewerAssignment $assignment): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Cannot delete completed assignments
        if ($assignment->isCompleted()) {
            return false;
        }

        // Super Admin can delete any
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can delete assignments from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $assignment->registration->journal->university_id;
        }

        // Assigner can delete their own assignments
        if ($user->id === $assignment->assigned_by) {
            return true;
        }

        return false;
    }
}
