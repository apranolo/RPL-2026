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

    public function cancel(Submission $submission)
    {
        if ($submission->author_id !== auth()->id()) {
            abort(403);
        }

        if ($submission->status !== 'draft') {
            return back()->with(
                'error',
                'Only draft submissions can be cancelled.'
            );
        }

        $submission->delete();

        return redirect()
            ->route('submissions.index')
            ->with(
                'success',
                'Submission cancelled successfully.'
            );
    }
}