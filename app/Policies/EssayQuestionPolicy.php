<?php

namespace App\Policies;

use App\Models\EssayQuestion;
use App\Models\User;

/**
 * EssayQuestionPolicy
 *
 * Authorization policy for essay questions.
 * All actions restricted to Super Admin only.
 */
class EssayQuestionPolicy
{
    /**
     * Determine if the user can view any essay questions.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can view the essay question.
     */
    public function view(User $user, EssayQuestion $essayQuestion): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can create essay questions.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can update the essay question.
     */
    public function update(User $user, EssayQuestion $essayQuestion): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can delete the essay question.
     */
    public function delete(User $user, EssayQuestion $essayQuestion): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can restore the essay question.
     */
    public function restore(User $user, EssayQuestion $essayQuestion): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can permanently delete the essay question.
     */
    public function forceDelete(User $user, EssayQuestion $essayQuestion): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can toggle essay question activation status.
     */
    public function toggleActive(User $user, EssayQuestion $essayQuestion): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can reorder essay questions.
     */
    public function reorder(User $user): bool
    {
        return $user->isSuperAdmin();
    }
}
