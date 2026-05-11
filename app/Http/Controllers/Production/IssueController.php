<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IssueController extends Controller
{

    public function show(Issue $issue)
    {
        return Inertia::render('Production/Issue/Show', [
            'issue' => $issue->loadCount('galleys'),
        ]);
    }

    public function edit(Issue $issue)
    {
        return Inertia::render('Production/Issue/Edit', [
            'issue' => $issue,
        ]);
    }

    public function destroy(Issue $issue)
    {

        if ($issue->status !== 'Draft') {
            return redirect()->back()->with('error', 'Hanya Issue berstatus Draft yang dapat dihapus.');
        }

        if ($issue->galleys()->count() > 0) {
            return redirect()->back()->with('error', 'Issue tidak dapat dihapus karena sudah memiliki artikel.');
        }

        $issue->delete();

        return redirect()->back()->with('success', 'Issue berhasil dihapus.');
    }
}