<?php

namespace App\Policies;

use App\Models\ReviewSchedule;
use App\Models\User;

class ReviewSchedulePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active && ($user->isSuperAdmin() || $user->isAdminKampus());
    }

    public function view(User $user, ReviewSchedule $schedule): bool
    {
        if (! $user->is_active) {
            return false;
        }

        if ($user->isSuperAdmin()) {
            return true;
        }

        if ($user->isAdminKampus()) {
            return $schedule->proposal?->journal?->university_id === $user->university_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    public function update(User $user, ReviewSchedule $schedule): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    public function delete(User $user, ReviewSchedule $schedule): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    public function restore(User $user, ReviewSchedule $schedule): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }

    public function forceDelete(User $user, ReviewSchedule $schedule): bool
    {
        return $user->isSuperAdmin() && $user->is_active;
    }
}
