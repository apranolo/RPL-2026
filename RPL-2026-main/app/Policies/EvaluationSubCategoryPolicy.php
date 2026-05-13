<?php

namespace App\Policies;

use App\Models\EvaluationSubCategory;
use App\Models\User;

/**
 * EvaluationSubCategoryPolicy
 *
 * Authorization policy for evaluation sub-categories (Sub-Unsur).
 * All actions restricted to Super Admin only.
 */
class EvaluationSubCategoryPolicy
{
    /**
     * Determine if the user can view any sub-categories.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can view the sub-category.
     */
    public function view(User $user, EvaluationSubCategory $subCategory): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can create sub-categories.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can update the sub-category.
     */
    public function update(User $user, EvaluationSubCategory $subCategory): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can delete the sub-category.
     * Super Admin only + additional business rule check.
     */
    public function delete(User $user, EvaluationSubCategory $subCategory): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Business rule: cannot delete if sub-category has indicators used in submitted assessments
        return $subCategory->canBeDeleted();
    }

    /**
     * Determine if the user can restore the sub-category.
     */
    public function restore(User $user, EvaluationSubCategory $subCategory): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can permanently delete the sub-category.
     */
    public function forceDelete(User $user, EvaluationSubCategory $subCategory): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can move sub-category to different category.
     */
    public function move(User $user, EvaluationSubCategory $subCategory): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can reorder sub-categories.
     */
    public function reorder(User $user): bool
    {
        return $user->isSuperAdmin();
    }
}
