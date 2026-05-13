<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeskController extends Controller
{
    /**
     * Display the Editor's inbox with tabbed submission list.
     *
     * Tabs:
     * - unassigned: Submissions with no active editor assignment
     * - active: Submissions actively handled by the current editor
     * - awaiting: Submissions pending confirmation from this editor
     *
     * @route GET /editorial/desk/inbox
     */
    public function inbox(Request $request): Response
    {
        $user = $request->user();
        $tab = $request->input('tab', 'unassigned');
        $search = $request->input('search');

        // Base query with eager loading
        $query = Submission::with([
            'journal:id,title,issn',
            'author:id,name,email',
            'editorialAssignments.editor:id,name',
        ]);

        // Apply search filter
        if ($search) {
            $query->search($search);
        }

        // Apply tab-specific scoping
        switch ($tab) {
            case 'active':
                $query->activeForEditor($user->id);
                break;

            case 'awaiting':
                $query->awaitingConfirmation($user->id);
                break;

            case 'unassigned':
            default:
                $tab = 'unassigned';
                $query->unassigned();
                break;
        }

        $submissions = $query
            ->latest('submitted_at')
            ->paginate(15)
            ->withQueryString();

        // Get counts for tab badges
        $counts = [
            'unassigned' => Submission::unassigned()->count(),
            'active' => Submission::activeForEditor($user->id)->count(),
            'awaiting' => Submission::awaitingConfirmation($user->id)->count(),
        ];

        return Inertia::render('Editorial/Desk/Inbox', [
            'submissions' => $submissions,
            'counts' => $counts,
            'filters' => [
                'tab' => $tab,
                'search' => $search,
            ],
        ]);
    }
}
