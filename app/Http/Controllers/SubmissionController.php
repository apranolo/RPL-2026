<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    public function show($id)
    {
        $submission = Submission::with([
            'author',
            'statusHistories',
            'reviewer',
        ])->findOrFail($id);

        if ($submission->author_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Author/Submissions/Show', [
            'submission' => $submission,
            'tracking' => $submission->statusHistories,
        ]);
    }
}