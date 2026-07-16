<?php

namespace App\Policies;

use App\Models\ResearchOutput;
use App\Models\User;

class ResearchOutputPolicy
{
    /**
     * Determine if the user can view any research outputs.
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine if the user can view the research output.
     */
    public function view(User $user, ResearchOutput $output): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->id === $output->user_id;
    }

    /**
     * Determine if the user can create research outputs.
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine if the user can update the research output.
     *
     * Only the owner or a Super Admin can update an output.
     */
    public function update(User $user, ResearchOutput $output): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->id === $output->user_id;
    }

    /**
     * Determine if the user can delete the research output.
     *
     * Only the owner (when status is draft) or a Super Admin can delete.
     */
    public function delete(User $user, ResearchOutput $output): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Regular users can only delete their own outputs while still in draft
        return $user->id === $output->user_id && $output->status === 'draft';
    }

    /**
     * Determine if the user can restore the research output.
     */
    public function restore(User $user, ResearchOutput $output): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can permanently delete the research output.
     */
    public function forceDelete(User $user, ResearchOutput $output): bool
    {
        return $user->isSuperAdmin();
    }
}
