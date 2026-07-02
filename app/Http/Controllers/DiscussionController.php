<?php

namespace App\Http\Controllers;

use App\Models\DiscussionMessage;
use App\Models\SubmissionDiscussion;
use Illuminate\Http\Request;

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
                'user_id' => auth()->id() ?? 1,
                'message' => $validated['message'],
            ]);
        }

        return response()->json([
            'message' => 'Discussion created successfully.',
            'data' => $discussion->load('messages'),
        ], 201);
    }

    public function reply(Request $request)
    {
        $validated = $request->validate([
            'submission_discussion_id' => ['required', 'integer'],
            'user_id' => ['required', 'integer'],
            'message' => ['required', 'string'],
            'attachment' => ['nullable', 'string'],
        ]);

        $message = DiscussionMessage::create($validated);

        return response()->json([
            'message' => 'Reply sent successfully.',
            'data' => $message,
        ], 201);
    }

    public function index()
    {
        $discussions = SubmissionDiscussion::with([
            'messages',
        ])->latest()->get();

        return response()->json($discussions);
    }
}
