<?php

/**
 * MOCK LOKAL - hapus setelah policy resmi terkait Proposal multi-reviewer di-merge.
 *
 * Policy untuk otorisasi rekap review & perpanjangan due date reviewer.
 *
 * @package App\Policies
 */

namespace App\Policies;

use App\Models\Proposal;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProposalPolicy
{
    use HandlesAuthorization;

    /**
     * Allow user to view review summary for a proposal.
     */
    public function viewSummary(User $user, Proposal $proposal): bool
    {
        return $user->isSuperAdmin()
            || $user->isAdminKampus()
            || $user->isPengelolaJurnal();
    }

    /**
     * Allow user to extend due date for a proposal's reviewer assignment.
     *
     * Note: Signature mengikuti requirement task.
     */
    public function extendDueDate(User $user, Proposal $proposal): bool
    {
        return $user->isSuperAdmin()
            || $user->isAdminKampus()
            || $user->isPengelolaJurnal();
    }
}

