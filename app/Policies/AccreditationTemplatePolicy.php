<?php

namespace App\Policies;

use App\Models\AccreditationTemplate;
use App\Models\User;

/**
 * AccreditationTemplatePolicy
 *
 * Authorization policy for hierarchical borang template management.
 * All actions restricted to Super Admin only.
 */
class AccreditationTemplatePolicy
{
    /**
     * Determine if the user can view any templates.
     */
    public function viewAny(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can view the template.
     */
    public function view(User $user, AccreditationTemplate $template): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can create templates.
     */
    public function create(User $user): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can update the template.
     */
    public function update(User $user, AccreditationTemplate $template): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can delete the template.
     * Super Admin only + additional business rule check.
     */
    public function delete(User $user, AccreditationTemplate $template): bool
    {
        if (! $user->isSuperAdmin()) {
            return false;
        }

        // Business rule: cannot delete if template is in use or is the only active template
        return $template->canBeDeleted();
    }

    /**
     * Determine if the user can restore the template.
     */
    public function restore(User $user, AccreditationTemplate $template): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can permanently delete the template.
     */
    public function forceDelete(User $user, AccreditationTemplate $template): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can clone the template.
     */
    public function clone(User $user, AccreditationTemplate $template): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine if the user can toggle template activation status.
     */
    public function toggleActive(User $user, AccreditationTemplate $template): bool
    {
        return $user->isSuperAdmin();
    }
}
