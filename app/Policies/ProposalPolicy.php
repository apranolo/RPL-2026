<?php

namespace App\Policies;

use App\Models\Proposal;
use App\Models\User;

/**
 * ProposalPolicy
 *
 * Menentukan otorisasi aksi-aksi terhadap model Proposal.
 *
 * Aturan:
 * - Super Admin    : dapat melihat semua, approve, dan reject proposal
 * - Admin Kampus   : dapat melihat rekap review dan memperpanjang due date
 * - User (Dosen)   : dapat melihat proposal miliknya sendiri
 */
class ProposalPolicy
{
    /**
     * Tentukan apakah user dapat melihat daftar semua proposal (Admin view).
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Tentukan apakah user boleh mengubah proposal.
     * Hanya pemilik proposal ketika status masih Draft.
     */
    public function update(User $user, Proposal $proposal): bool
    {
        return $user->id === $proposal->user_id && $proposal->status_proposal === Proposal::STATUS_DRAFT;
    }

    /**
     * Tentukan apakah user boleh menghapus proposal.
     * Hanya pemilik proposal ketika status masih Draft.
     */
    public function delete(User $user, Proposal $proposal): bool
    {
        return $user->id === $proposal->user_id && $proposal->status_proposal === Proposal::STATUS_DRAFT;
    }

    /**
     * Tentukan apakah user dapat melihat proposal tertentu.
     */
    public function view(User $user, Proposal $proposal): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $proposal->user && $proposal->user->university_id === $user->university_id;
        }

        return $user->id === $proposal->user_id;
    }

    /**
     * Tentukan apakah user dapat meng-approve (validasi administrasi) proposal.
     * Super Admin dan Admin Kampus (pada universitas yang sama), untuk proposal berstatus Submitted.
     */
    public function approve(User $user, Proposal $proposal): bool
    {
        if (! ($user->isSuperAdmin() || $user->isAdminKampus())) {
            return false;
        }

        if ($user->isAdminKampus() && $proposal->user && $proposal->user->university_id !== $user->university_id) {
            return false;
        }

        $status = strtolower($proposal->status_proposal ?? '');
        return $status === 'submitted';
    }

    /**
     * Tentukan apakah user dapat menolak proposal.
     * Super Admin dan Admin Kampus (pada universitas yang sama), untuk proposal berstatus Submitted.
     */
    public function reject(User $user, Proposal $proposal): bool
    {
        if (! ($user->isSuperAdmin() || $user->isAdminKampus())) {
            return false;
        }

        if ($user->isAdminKampus() && $proposal->user && $proposal->user->university_id !== $user->university_id) {
            return false;
        }

        $status = strtolower($proposal->status_proposal ?? '');
        return $status === 'submitted';
    }

    /**
     * Tentukan apakah user dapat mengunggah dokumen proposal.
     * Hanya pemilik proposal yang dapat mengunggah.
     */
    public function upload(User $user, Proposal $proposal): bool
    {
        return $user->id === $proposal->user_id;
    }

    /**
     * Tentukan apakah user dapat melihat rekap review multi-reviewer.
     *
     * Digunakan oleh ReviewSummaryController::index().
     * Hanya SuperAdmin, AdminKampus, dan PengelolaJurnal.
     */
    public function viewSummary(User $user, Proposal $proposal): bool
    {
        return $user->isSuperAdmin()
            || $user->isAdminKampus()
            || $user->isPengelolaJurnal();
    }

    /**
     * Tentukan apakah user dapat memperpanjang due date reviewer assignment.
     *
     * Digunakan oleh ReviewAssignmentController::extendDue().
     * Hanya SuperAdmin, AdminKampus, dan PengelolaJurnal.
     */
    public function extendDueDate(User $user, Proposal $proposal): bool
    {
        return $user->isSuperAdmin()
            || $user->isAdminKampus()
            || $user->isPengelolaJurnal();
    }
}
