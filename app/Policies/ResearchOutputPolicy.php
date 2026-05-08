<?php

namespace App\Policies;

use App\Models\ResearchOutput;
use App\Models\User;

class ResearchOutputPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ResearchOutput $researchOutput): bool
    {
        return $user->is_active && ($user->id === $researchOutput->user_id);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ResearchOutput $researchOutput): bool
    {
        return $user->is_active 
        && ($user->id === $researchOutput->user_id) 
        && ($researchOutput->status === 'draft' || $researchOutput->status === 'rejected');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ResearchOutput $researchOutput): bool
    {
        return $user->is_active 
        && ($user->id === $researchOutput->user_id)
        && ($researchOutput->status === 'draft');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ResearchOutput $researchOutput): bool
    {
        return $user->is_active && ($user->id === $researchOutput->user_id);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ResearchOutput $researchOutput): bool
    {
        return false;
    }
}
