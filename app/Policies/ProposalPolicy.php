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
        return $user->isSuperAdmin();
    }
    /**
     * Tentukan apakah user boleh mengubah proposal.
     * Hanya pemilik proposal berbasis kepemilikan user ID.
     */
    public function update(User $user, Proposal $proposal): bool
    {
        return $user->id === $proposal->user_id;
    }

    /**
     * Tentukan apakah user boleh menghapus proposal.
     * Hanya pemilik proposal berbasis kepemilikan user ID.
     */
    public function delete(User $user, Proposal $proposal): bool
    {
        return $user->id === $proposal->user_id;
    }

    /**
     * Tentukan apakah user dapat melihat proposal tertentu.
     */
    public function view(User $user, Proposal $proposal): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->id === $proposal->user_id;
    }

    /**
     * Tentukan apakah user dapat meng-approve (validasi administrasi) proposal.
     * Hanya Super Admin, hanya untuk proposal berstatus Submitted.
     */
    public function approve(User $user, Proposal $proposal): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        return $proposal->status_proposal === Proposal::STATUS_SUBMITTED;
    }

    /**
     * Tentukan apakah user dapat menolak proposal.
     * Hanya Super Admin, hanya untuk proposal berstatus Submitted.
     */
    public function reject(User $user, Proposal $proposal): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        return $proposal->status_proposal === Proposal::STATUS_SUBMITTED;
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
