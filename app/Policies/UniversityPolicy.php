<?php

namespace App\Policies;

use App\Models\University;
use App\Models\User;

class UniversityPolicy
{
    /**
     * Determine if the user can view any universities.
     *
     * Rules:
     * - Super Admin: Can view all universities
     * - Admin Kampus: Can view only their university
     * - User: Can view only their university
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine if the user can view the university.
     */
    public function view(User $user, University $university): bool
    {
        // Super Admin can view any university
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus and User can view only their university
        return $user->university_id === $university->id;
    }

    /**
     * Determine if the user can create universities.
     *
     * Rules:
     * - Only Super Admin can create universities
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can update the university
     *
     * Rules:
     * - Only Super Admin can update universities
     */
    public function update(User $user, University $university): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can delete the university
     *
     * Rules:
     * - Only Super Admin can delete universities
     * - Cannot delete if university has journals
     */
    public function delete(User $user, University $university): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Prevent deletion if the university has associated journals
        return $university->journals()->count() === 0;
    }

    /**
     * Determine if the user can restore the university.
     */
    public function restore(User $user, University $university): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can permanently delete the university.
     */
    public function forceDelete(User $user, University $university): bool
    {
        return $user->isSuperAdmin();
    }
}
