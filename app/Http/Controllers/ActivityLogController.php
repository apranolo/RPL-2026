<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Menampilkan activity log per submission.
     *
     * Hanya dapat diakses oleh pengguna dengan role Editor atau Super Admin.
     */
    public function index(Request $request, int $submissionId): Response
    {
        // Validasi otorisasi: hanya Editor dan Super Admin yang boleh mengakses
        $user = $request->user();

        if (! $user || ! $user->roles()->whereIn('name', [Role::EDITOR, Role::SUPER_ADMIN])->exists()) {
            abort(403, 'Unauthorized access. Editor or Super Admin role required.');
        }

        $logs = ActivityLog::with('user')
            ->where('submission_id', $submissionId)
            ->latest()
            ->get();

        return Inertia::render('Editorial/ActivityLog', [
            'submissionId' => $submissionId,
            'logs' => $logs,
        ]);
    }
}
