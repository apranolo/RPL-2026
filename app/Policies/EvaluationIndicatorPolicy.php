<?php

namespace App\Policies;

use App\Models\EvaluationIndicator;
use App\Models\User;

/**
 * EvaluationIndicatorPolicy (NEW v1.1)
 *
 * Authorization policy for evaluation indicators.
 * All hierarchical management restricted to Super Admin only.
 *
 * Note: This is NEW policy for v1.1. Old indicators (v1.0) without sub_category_id
 * are considered legacy and may have different access rules in the future.
 */
class EvaluationIndicatorPolicy
{
    /**
     * Determine if the user can view any indicators.
     */
    public function viewAny(User $user): bool
    {
        // All roles can view indicators for assessment purposes
        return true;
    }

    /**
     * Determine if the user can view the indicator.
     */
    public function view(User $user, EvaluationIndicator $indicator): bool
    {
        // All roles can view individual indicators
        return true;
    }

    /**
     * Determine if the user can create indicators.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can update the indicator.
     */
    public function update(User $user, EvaluationIndicator $indicator): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can delete the indicator.
     * Super Admin only + additional business rule check.
     */
    public function delete(User $user, EvaluationIndicator $indicator): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Business rule: cannot delete if indicator is used in submitted assessments
        $usedInSubmittedAssessments = $indicator->responses()
            ->whereHas('journalAssessment', function ($query) {
                $query->where('status', 'submitted');
            })
            ->exists();

        return ! $usedInSubmittedAssessments;
    }

    /**
     * Determine if the user can restore the indicator.
     */
    public function restore(User $user, EvaluationIndicator $indicator): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can permanently delete the indicator.
     */
    public function forceDelete(User $user, EvaluationIndicator $indicator): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can reorder indicators.
     */
    public function reorder(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can migrate legacy indicator to v1.1 hierarchy.
     */
    public function migrate(User $user, EvaluationIndicator $indicator): bool
    {
        return $user->isSuperAdmin() && $indicator->isLegacy();
    }
}
