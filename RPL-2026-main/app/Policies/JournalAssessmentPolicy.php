<?php

namespace App\Policies;

use App\Models\JournalAssessment;
use App\Models\User;

class JournalAssessmentPolicy
{
    /**
     * Determine if the user can view any assessments.
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine if the user can view the assessment.
     */
    public function view(User $user, JournalAssessment $assessment): bool
    {
        // Super Admin can view all assessments
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can view assessments from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $assessment->journal->university_id;
        }

        // User can only view their own assessments
        if ($user->isUser()) {
            return $user->id === $assessment->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can create assessments.
     *
     * Rules:
     * - Only User (Pengelola Jurnal) can create assessments for their journals
     */
    public function create(User $user): bool
    {
        return $user->isUser() && $user->is_active;
    }

    /**
     * Determine if the user can create assessment for specific journal.
     */
    public function createForJournal(User $user, int $journalId): bool
    {
        if (! $user->isUser()) {
            return false;
        }

        // User can only create assessment for their own journals
        $journal = \App\Models\Journal::find($journalId);

        return $journal && $journal->user_id === $user->id;
    }

    /**
     * Determine if the user can update the assessment.
     *
     * Rules:
     * - User can update their own assessments
     * - BUT only if status is 'draft'
     */
    public function update(User $user, JournalAssessment $assessment): bool
    {
        // Cannot update if already submitted
        if ($assessment->isSubmitted()) {
            return false;
        }

        // Super Admin can update (for testing purposes)
        if ($user->isSuperAdmin()) {
            return true;
        }

        // User can only update their own draft assessments
        if ($user->isUser()) {
            return $user->id === $assessment->user_id
                && $assessment->status === 'draft';
        }

        return false;
    }

    /**
     * Determine if the user can delete the assessment.
     *
     * Rules:
     * - User can delete their own assessments
     * - BUT only if status is 'draft'
     */
    public function delete(User $user, JournalAssessment $assessment): bool
    {
        // Cannot delete if already submitted
        if ($assessment->isSubmitted()) {
            return false;
        }

        // Super Admin can delete (for testing purposes)
        if ($user->isSuperAdmin()) {
            return true;
        }

        // User can only delete their own draft assessments
        if ($user->isUser()) {
            return $user->id === $assessment->user_id
                && $assessment->status === 'draft';
        }

        return false;
    }

    /**
     * Determine if the user can submit the assessment.
     */
    public function submit(User $user, JournalAssessment $assessment): bool
    {
        // Can only submit if status is 'draft'
        if ($assessment->status !== 'draft') {
            return false;
        }

        // User can only submit their own assessments
        if ($user->isUser()) {
            return $user->id === $assessment->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can review the assessment.
     *
     * Rules:
     * - Super Admin: Can review all submitted assessments
     * - Admin Kampus: Can review submitted assessments from their university
     */
    public function review(User $user, JournalAssessment $assessment): bool
    {
        // Can only review if status is 'submitted'
        if ($assessment->status !== 'submitted') {
            return false;
        }

        // Super Admin can review all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can review assessments from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $assessment->journal->university_id;
        }

        return false;
    }

    /**
     * Determine if the user can add responses to assessment.
     */
    public function addResponse(User $user, JournalAssessment $assessment): bool
    {
        // Can only add response if status is 'draft'
        if ($assessment->status !== 'draft') {
            return false;
        }

        // User can only add responses to their own assessments
        if ($user->isUser()) {
            return $user->id === $assessment->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can upload attachments to assessment.
     */
    public function uploadAttachment(User $user, JournalAssessment $assessment): bool
    {
        return $this->addResponse($user, $assessment);
    }

    /**
     * Determine if the user can download assessment attachments.
     */
    public function downloadAttachments(User $user, JournalAssessment $assessment): bool
    {
        return $this->view($user, $assessment);
    }

    /**
     * Determine if the user can export assessment report.
     */
    public function export(User $user, JournalAssessment $assessment): bool
    {
        // Super Admin can export all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can export assessments from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $assessment->journal->university_id;
        }

        // User can export their own assessments (if submitted)
        if ($user->isUser()) {
            return $user->id === $assessment->user_id
                && $assessment->isSubmitted();
        }

        return false;
    }

    /**
     * Determine if the user can restore the assessment.
     */
    public function restore(User $user, JournalAssessment $assessment): bool
    {
        // Super Admin can restore all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // User can restore their own assessments
        if ($user->isUser()) {
            return $user->id === $assessment->user_id;
        }

        return false;
    }

    /**
     * Determine if the user can permanently delete the assessment.
     */
    public function forceDelete(User $user, JournalAssessment $assessment): bool
    {
        // Only Super Admin can force delete
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can assign a reviewer to the assessment.
     *
     * Rules:
     * - Only Super Admin (acting as Dikti) can assign reviewers
     * - Assessment must be approved by Admin Kampus first
     */
    public function assignReviewer(User $user, JournalAssessment $assessment): bool
    {
        // Only Super Admin (Dikti) can assign reviewers
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Assessment must be in approved_by_lppm status or already in review
        return in_array($assessment->status, ['approved_by_lppm', 'in_review']);
    }
}
