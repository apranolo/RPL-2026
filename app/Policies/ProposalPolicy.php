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
 * - Super Admin : dapat melihat semua, approve, dan reject proposal
 * - User (Dosen): dapat melihat proposal miliknya sendiri
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
     * Tentukan apakah user dapat melihat proposal tertentu.
     */
    public function view(User $user, Proposal $proposal): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Dosen (User) hanya bisa melihat proposal miliknya
        return $user->id === $proposal->user_id;
    }

    /**
     * Tentukan apakah user dapat meng-approve (validasi administrasi) proposal.
     *
     * Hanya Super Admin yang dapat memvalidasi proposal.
     */
    public function approve(User $user, Proposal $proposal): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Hanya proposal berstatus Submitted yang dapat divalidasi
        return $proposal->status_proposal === Proposal::STATUS_SUBMITTED;
    }

    /**
     * Tentukan apakah user dapat menolak proposal.
     *
     * Hanya Super Admin yang dapat menolak proposal.
     */
    public function reject(User $user, Proposal $proposal): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Hanya proposal berstatus Submitted yang dapat ditolak
        return $proposal->status_proposal === Proposal::STATUS_SUBMITTED;
    }
}
