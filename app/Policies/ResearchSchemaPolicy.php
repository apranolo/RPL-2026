<?php

namespace App\Policies;

use App\Models\ResearchSchema;
use App\Models\User;

/**
 * ResearchSchemaPolicy
 *
 * Menentukan aturan otorisasi untuk operasi CRUD pada
 * model ResearchSchema (Skema Penelitian).
 *
 * Hanya Super Admin yang diizinkan melakukan semua operasi.
 */
class ResearchSchemaPolicy
{
    /**
     * Determine if the user can view any research schemas.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine if the user can view a specific research schema.
     */
    public function view(User $user, ResearchSchema $schema): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine if the user can create research schemas.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine if the user can update the research schema.
     */
    public function update(User $user, ResearchSchema $schema): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine if the user can delete the research schema.
     */
    public function delete(User $user, ResearchSchema $schema): bool
    {
        if (! ($user->isSuperAdmin() || $user->isAdminKampus())) {
            return false;
        }

        // Prevent deletion if the schema has associated proposals
        return $schema->proposals()->count() === 0;
    }

    /**
     * Determine if the user can restore the research schema.
     */
    public function restore(User $user, ResearchSchema $schema): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }

    /**
     * Determine if the user can permanently delete the research schema.
     */
    public function forceDelete(User $user, ResearchSchema $schema): bool
    {
        return $user->isSuperAdmin() || $user->isAdminKampus();
    }
}
