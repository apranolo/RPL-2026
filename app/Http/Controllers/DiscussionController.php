<?php

namespace App\Http\Controllers;

use App\Models\DiscussionMessage;
use App\Models\SubmissionDiscussion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscussionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'submission_id' => ['required', 'integer'],
            'stage' => ['required', 'string'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['nullable', 'string'],
        ]);

        $discussion = SubmissionDiscussion::create([
            'submission_id' => $validated['submission_id'],
            'stage' => $validated['stage'],
            'subject' => $validated['subject'],
        ]);

        if (! empty($validated['message'])) {
            DiscussionMessage::create([
                'submission_discussion_id' => $discussion->id,
                'user_id' => auth()->id(),
                'message' => $validated['message'],
            ]);
        }

        return redirect()->back()->with(
            'success',
            'Discussion created successfully.'
        );
    }

    public function reply(Request $request, SubmissionDiscussion $discussion)
    {
        $validated = $request->validate([
            'message' => ['required', 'string'],
            'attachment' => ['nullable', 'string'],
        ]);

        DiscussionMessage::create([
            'submission_discussion_id' => $discussion->id,
            'user_id' => auth()->id(),
            'message' => $validated['message'],
            'attachment' => $validated['attachment'] ?? null,
        ]);

        return redirect()->back()->with(
            'success',
            'Reply sent successfully.'
        );
    }

    public function index()
    {
    $discussions = SubmissionDiscussion::with([
        'messages.user',
    ])
        ->latest()
        ->get();

    return Inertia::render('Discussion/Thread', [
        'discussions' => $discussions,
    ]);
    }
}
