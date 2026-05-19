<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeskController extends Controller
{
    /**
     * Display the editorial desk inbox with tabs for different statuses.
     */
    public function inbox(Request $request)
    {
        // Calculate counts for each tab
        $counts = [
            'unassigned' => Submission::where('status', 'unassigned')->count(),
            'active' => Submission::where('status', 'active')->count(),
            'awaiting_decision' => Submission::where('status', 'awaiting_decision')->count(),
            'archived' => Submission::where('status', 'archived')->count(),
        ];

        // Determine active tab from query params, default to unassigned
        $activeTab = $request->query('tab', 'unassigned');
        
        // Ensure valid tab
        if (!in_array($activeTab, array_keys($counts))) {
            $activeTab = 'unassigned';
        }

        // Get submissions for the active tab
        $submissions = Submission::with(['author', 'journal'])
            ->where('status', $activeTab)
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Editorial/Desk/Inbox', [
            'counts' => $counts,
            'activeTab' => $activeTab,
            'submissions' => $submissions,
        ]);
    }
}
