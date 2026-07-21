<?php

namespace App\Policies;

use App\Models\PembinaanRegistration;
use App\Models\User;

class PembinaanRegistrationPolicy
{
    /**
     * Determine whether the user can view any registrations.
     *
     * Rules:
     * - Super Admin: Can view all
     * - Admin Kampus: Can view from their university
     * - User: Can view their own registrations
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can view the registration.
     *
     * Rules:
     * - Super Admin: Can view all
     * - Admin Kampus: Can view if journal belongs to their university
     * - User: Can view their own registration
     * - Reviewer: Can view if assigned to this registration
     */
    public function view(User $user, PembinaanRegistration $registration): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Super Admin can view all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can view registrations from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $registration->journal->university_id;
        }

        // User can view their own registration
        if ($user->isUser() || $user->isPengelolaJurnal()) {
            return $user->id === $registration->user_id;
        }

        // Reviewer can view if assigned
        if ($user->isReviewer()) {
            return $registration->reviewerAssignments()
                ->where('reviewer_id', $user->id)
                ->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can create registrations.
     *
     * Rules:
     * - Pengelola Jurnal can register their journals
     * - Must check if pembinaan is open and has quota
     */
    public function create(User $user): bool
    {
        if (! $user->is_active) {
            return false;
        }

        return $user->isPengelolaJurnal() || $user->isUser();
    }

    /**
     * Determine whether the user can register specific journal to pembinaan.
     *
     * Rules:
     * - User must own the journal
     * - Pembinaan must be open for registration
     * - Pembinaan must have quota available
     * - Journal not already registered
     */
    public function register(User $user, int $journalId, int $pembinaanId): bool
    {
        if (! $this->create($user)) {
            return false;
        }

        // Check journal ownership
        $journal = \App\Models\Journal::find($journalId);
        if (! $journal || $journal->user_id !== $user->id) {
            return false;
        }

        // Check pembinaan
        $pembinaan = \App\Models\Pembinaan::find($pembinaanId);
        if (! $pembinaan) {
            return false;
        }

        // Check if registration is open
        if (! $pembinaan->isRegistrationOpen()) {
            return false;
        }

        // Check quota
        if ($pembinaan->isQuotaFull()) {
            return false;
        }

        // Check if already registered
        $alreadyRegistered = PembinaanRegistration::where('pembinaan_id', $pembinaanId)
            ->where('journal_id', $journalId)
            ->exists();

        return ! $alreadyRegistered;
    }

    /**
     * Determine whether the user can update the registration.
     *
     * Rules:
     * - User can only update their own pending registrations (e.g., add files)
     */
    public function update(User $user, PembinaanRegistration $registration): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Only pending registrations can be updated
        if (! $registration->isPending()) {
            return false;
        }

        // User can update their own registration
        return $user->id === $registration->user_id;
    }

    /**
     * Determine whether the user can cancel/delete the registration.
     *
     * Rules:
     * - User can cancel their own pending registrations
     */
    public function delete(User $user, PembinaanRegistration $registration): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Only pending registrations can be cancelled
        if (! $registration->canBeCancelled()) {
            return false;
        }

        // Super Admin can delete any
        if ($user->isSuperAdmin()) {
            return true;
        }

        // User can cancel their own
        return $user->id === $registration->user_id;
    }

    /**
     * Determine whether the user can approve the registration.
     *
     * Rules:
     * - Admin Kampus: Can approve registrations from their university
     * - Super Admin: Can approve all
     */
    public function approve(User $user, PembinaanRegistration $registration): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Only pending registrations can be approved
        if (! $registration->isPending()) {
            return false;
        }

        // Super Admin can approve all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can approve registrations from their university
        if ($user->isAdminKampus()) {
            return $user->university_id === $registration->journal->university_id;
        }

        return false;
    }

    /**
     * Determine whether the user can reject the registration.
     *
     * Rules:
     * - Same as approve
     */
    public function reject(User $user, PembinaanRegistration $registration): bool
    {
        return $this->approve($user, $registration);
    }

    /**
     * Determine whether the user can upload attachments.
     *
     * Rules:
     * - User can upload to their own pending registrations
     */
    public function uploadAttachment(User $user, PembinaanRegistration $registration): bool
    {
        return $this->update($user, $registration);
    }

    /**
     * Determine whether the user can download attachments.
     *
     * Rules:
     * - User can download from their own registrations
     * - Admin Kampus can download from their university
     * - Super Admin can download all
     * - Reviewers can download if assigned
     */
    public function downloadAttachments(User $user, PembinaanRegistration $registration): bool
    {
        return $this->view($user, $registration);
    }

    /**
     * Determine if the user can create an assessment for this registration.
     */
    public function createAssessment(User $user, PembinaanRegistration $registration): bool
    {
        // Only the user who registered can create assessment
        if ($registration->user_id !== $user->id) {
            return false;
        }

        // Registration must be approved
        if ($registration->status !== 'approved') {
            return false;
        }

        return true;
    }
}
