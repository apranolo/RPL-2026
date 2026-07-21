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
    public function view(User $user, ResearchOutput $output): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $user->university_id === $output->user?->university_id;
        }

        if ($user->isUser()) {
            return $user->id === $output->user_id;
        }

        return false;
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
    public function update(User $user, ResearchOutput $output): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $user->university_id === $output->user?->university_id;
        }

        if ($user->isUser()) {
            return $user->id === $output->user_id;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ResearchOutput $output): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            if ($user->university_id !== $output->user?->university_id) {
                return false;
            }
        }

        if ($user->isUser()) {
            if ($user->id !== $output->user_id) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ResearchOutput $output): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $user->university_id === $output->user?->university_id;
        }

        if ($user->isUser()) {
            return $user->id === $output->user_id;
        }

        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ResearchOutput $output): bool
    {
        return $user->isSuperAdmin();
    }
}