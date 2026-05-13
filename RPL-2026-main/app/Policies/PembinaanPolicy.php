<?php

namespace App\Policies;

use App\Models\Pembinaan;
use App\Models\User;

class PembinaanPolicy
{
    /**
     * Determine whether the user can view any pembinaan.
     *
     * Rules:
     * - Super Admin: Can view all pembinaan
     * - Admin Kampus: Can view pembinaan to see registrations from their university
     * - User: Can view active pembinaan to register
     */
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    /**
     * Determine whether the user can view the pembinaan.
     *
     * Rules:
     * - Super Admin: Can view all
     * - Admin Kampus: Can view to see registrations from their university
     * - User: Can view active pembinaan
     */
    public function view(User $user, Pembinaan $pembinaan): bool
    {
        if (! $user->is_active) {
            return false;
        }

        // Super Admin can view all
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Admin Kampus can view all pembinaan
        if ($user->isAdminKampus()) {
            return true;
        }

        // Users can only view active pembinaan
        if ($user->isUser() || $user->isPengelolaJurnal()) {
            return $pembinaan->status === 'active';
        }

        return false;
    }

    /**
     * Determine whether the user can create pembinaan.
     *
     * Rules:
     * - Only Super Admin can create pembinaan
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    /**
     * Determine whether the user can update the pembinaan.
     *
     * Rules:
     * - Only Super Admin can update pembinaan
     */
    public function update(User $user, Pembinaan $pembinaan): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    /**
     * Determine whether the user can delete the pembinaan.
     *
     * Rules:
     * - Only Super Admin can delete pembinaan
     * - Cannot delete if has approved registrations
     */
    public function delete(User $user, Pembinaan $pembinaan): bool
    {
        if (! $user->isSuperAdmin() || ! $user->is_active) {
            return false;
        }

        // Cannot delete if has approved registrations
        return $pembinaan->canBeDeleted();
    }

    /**
     * Determine whether the user can restore the pembinaan.
     */
    public function restore(User $user, Pembinaan $pembinaan): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    /**
     * Determine whether the user can permanently delete the pembinaan.
     */
    public function forceDelete(User $user, Pembinaan $pembinaan): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    /**
     * Determine whether the user can toggle status (draft -> active -> closed).
     *
     * Rules:
     * - Only Super Admin can toggle status
     */
    public function toggleStatus(User $user, Pembinaan $pembinaan): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    /**
     * Determine whether the user can view registrations for this pembinaan.
     *
     * Rules:
     * - Super Admin: All registrations
     * - Admin Kampus: Registrations from their university
     */
    public function viewRegistrations(User $user, Pembinaan $pembinaan): bool
    {
        if (! $user->is_active) {
            return false;
        }

        return $user->isSuperAdmin() || $user->isAdminKampus();
    }
}
