<?php

namespace App\Policies;

use App\Models\Journal;
use App\Models\User;

class JournalPolicy
{
    /**
     * Determine if the user can view any journals.
     *
     * Rules:
     * - Super Admin: Can view all journals
     * - Admin Kampus: Can view journals from their university
     * - User: Can view their own journals
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine if the user can view the journal.
     */
    public function view(User $user, Journal $journal): bool
    {
        // Super Admin can view all journals
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can view journals from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $journal->university_id;
        }

        // User can only view their own journals
        if ($user->isUser()) {
            return $user->id === $journal->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can create journals.
     *
     * Rules:
     * - Super Admin: Can create journals (for testing)
     * - Admin Kampus: Can create journals in their university
     * - User: Can create their own journals
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine what university the user can create journal for.
     */
    public function canCreateForUniversity(User $user, int $universityId): bool
    {
        // Super Admin can create for any university
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus & User can only create for their university
        return $user->university_id === $universityId;
    }

    /**
     * Determine what user can be assigned as journal manager.
     */
    public function canAssignUser(User $authUser, int $targetUserId): bool
    {
        // Super Admin can assign anyone
        if ($authUser->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can assign users from their university
        if ($authUser->isAdminKampus()) {
            $targetUser = User::find($targetUserId);

            return $targetUser
                && $targetUser->university_id === $authUser->university_id
                && $targetUser->isUser();
        }

        // User can only assign themselves
        if ($authUser->isUser()) {
            return $authUser->id === $targetUserId;
        }

        return false;
    }

    /**
     * Determine if the user can update the journal.
     */
    public function update(User $user, Journal $journal): bool
    {
        // Super Admin can update all journals
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can update journals from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $journal->university_id;
        }

        // User can only update their own journals
        if ($user->isUser()) {
            return $user->id === $journal->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can delete the journal.
     *
     * Journals with approval_status = 'approved' cannot be deleted
     * (they are considered verified and in use).
     */
    public function delete(User $user, Journal $journal): bool
    {
        // Super Admin can delete all journals
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can delete journals from their university
        // BUT not if the journal has been approved
        if ($user->isAdminKampus()) {
            if ($user->university_id !== $journal->university_id) {
                return false;
            }

            return $journal->approval_status !== 'approved';
        }

        // User can delete their own journals
        // BUT not if the journal has been approved
        if ($user->isUser()) {
            if ($user->id !== $journal->user_id) {
                return false;
            }

            return $journal->approval_status !== 'approved';
        }

        return false;
    }

    /**
     * Determine if the user can restore the journal.
     */
    public function restore(User $user, Journal $journal): bool
    {
        // Super Admin can restore all journals
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can restore journals from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $journal->university_id;
        }

        // User can restore their own journals
        if ($user->isUser()) {
            return $user->id === $journal->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can permanently delete the journal.
     */
    public function forceDelete(User $user, Journal $journal): bool
    {
        // Only Super Admin can force delete
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can view journal assessments.
     */
    public function viewAssessments(User $user, Journal $journal): bool
    {
        return $this->view($user, $journal);
    }

    /**
     * Determine if the user can export journal data.
     */
    public function export(User $user, Journal $journal): bool
    {
        // Super Admin can export all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can export journals from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $journal->university_id;
        }

        // User can export their own journals
        if ($user->isUser()) {
            return $user->id === $journal->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can approve/reject journal submissions.
     *
     * Rules:
     * - Admin Kampus: Can approve journals from their university
     * - Super Admin: Can approve any journal (for testing/oversight)
     */
    public function approve(User $user, Journal $journal): bool
    {
        // Super Admin can approve any journal
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can approve journals from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $journal->university_id;
        }

        return false;
    }

    /**
     * Determine if the user can reassign journal manager.
     *
     * Rules:
     * - Admin Kampus: Can reassign journals within their university
     * - Super Admin: Can reassign any journal
     */
    public function reassign(User $user, Journal $journal): bool
    {
        // Super Admin can reassign any journal
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can reassign journals from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $journal->university_id;
        }

        return false;
    }
}
