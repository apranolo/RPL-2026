<?php

namespace App\Policies;

use App\Models\EvaluationCategory;
use App\Models\User;

/**
 * EvaluationCategoryPolicy
 *
 * Authorization policy for evaluation categories (Unsur Evaluasi).
 * All actions restricted to Super Admin only.
 */
class EvaluationCategoryPolicy
{
    /**
     * Determine if the user can view any categories.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can view the category.
     */
    public function view(User $user, EvaluationCategory $category): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can create categories.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can update the category.
     */
    public function update(User $user, EvaluationCategory $category): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can delete the category.
     * Super Admin only + additional business rule check.
     */
    public function delete(User $user, EvaluationCategory $category): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Business rule: cannot delete if category has indicators used in submitted assessments
        return $category->canBeDeleted();
    }

    /**
     * Determine if the user can restore the category.
     */
    public function restore(User $user, EvaluationCategory $category): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can permanently delete the category.
     */
    public function forceDelete(User $user, EvaluationCategory $category): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can reorder categories.
     */
    public function reorder(User $user): bool
    {
        return $user->isSuperAdmin();
    }
}
