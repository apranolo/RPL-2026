<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Menampilkan activity log per submission
     */
    public function index(int $submissionId): Response
    {
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
