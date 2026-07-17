<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemLog;
use Inertia\Inertia;

class LogController extends Controller
{
    /**
     * Display a listing of the system logs.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $logs = SystemLog::with('user', 'loggable')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Logs/Index', [
            'logs' => $logs,
        ]);
    }
}
