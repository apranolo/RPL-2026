<?php

namespace App\Policies;

use App\Models\Agenda;
use App\Models\User;

class AgendaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || ($user->isAdminKampus() && $user->is_active);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Agenda $agenda): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdminKampus() && $user->is_active && $user->university_id === $agenda->university_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || ($user->isAdminKampus() && $user->is_active && $user->university_id !== null);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Agenda $agenda): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdminKampus() && $user->is_active && $user->university_id === $agenda->university_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Agenda $agenda): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdminKampus() && $user->is_active && $user->university_id === $agenda->university_id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Agenda $agenda): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return $user->isAdminKampus() && $user->is_active && $user->university_id === $agenda->university_id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Agenda $agenda): bool
    {
        return $user->isSuperAdmin(); // Usually only super admin can force delete
    }
}
