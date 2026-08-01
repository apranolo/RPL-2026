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
        return $user->isSuperAdmin() || $user->isAdminKampus();
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
}
