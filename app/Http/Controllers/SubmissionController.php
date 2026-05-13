<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function show(Submission $submission): Response
    {
        $submission->load([
            'author',
            'statusHistories',
            'reviewer',
        ]);

        if ($submission->author_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Author/Submissions/Show', [
            'submission' => $submission,
            'tracking' => $submission->statusHistories,
        ]);
    }
}