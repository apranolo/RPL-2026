<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;

class ContractPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('user') || $user->hasRole('admin_kampus') || $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can view the model.
     * User can only view their own contracts
     */
    public function view(User $user, Contract $contract): bool
    {
        // Researcher can view their own contracts
        if ($user->id === $contract->researcher_id) {
            return true;
        }

        // Admin kampus can view contracts from their university
        if ($user->hasRole('admin_kampus')) {
            return $user->university_id === $contract->researcher->university_id;
        }

        // Super admin can view all contracts
        if ($user->hasRole('super_admin')) {
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Only super admin and admin kampus can create contracts
        return $user->hasRole('super_admin') || $user->hasRole('admin_kampus');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Contract $contract): bool
    {
        // Only super admin and admin kampus can update contracts
        if ($user->hasRole('super_admin') || $user->hasRole('admin_kampus')) {
            // Admin kampus can only update contracts from their university
            if ($user->hasRole('admin_kampus')) {
                return $user->university_id === $contract->researcher->university_id;
            }
            return true;
        }

        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Contract $contract): bool
    {
        // Only super admin can delete contracts
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Contract $contract): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Contract $contract): bool
    {
        return $user->hasRole('super_admin');
    }
}
