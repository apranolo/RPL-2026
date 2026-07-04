<?php

namespace App\Policies;

use App\Models\ReviewAssignment;
use App\Models\User;

class ReviewAssignmentPolicy
{
    /**
     * Determine whether the user can cancel a review invitation.
     *
     * NOTE: Placeholder sementara. Idealnya pembatalan hanya boleh dilakukan
     * oleh Pengelola Jurnal yang mengelola submission terkait (lewat relasi
     * submission->journal), tapi model Submission belum ada di branch ini.
     * Update method ini begitu modul Submission (Kelas G) sudah merge ke
     * development, supaya scope-nya bisa dibatasi per jurnal.
     */
    public function cancel(User $user, ReviewAssignment $assignment): bool
    {
        if (! $user->is_active) {
            return false;
        }

        return $user->isSuperAdmin() || $user->isPengelolaJurnal();
    }
}