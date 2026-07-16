<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDiscussionRequest;
use App\Models\DiscussionMessage;
use App\Models\SubmissionDiscussion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DiscussionController extends Controller
{
    public function index()
    {
        $discussions = SubmissionDiscussion::with(['messages.user'])->latest()->get();

        return Inertia::render('Discussion/Thread', [
            'discussions' => $discussions,
        ]);
    }

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

        return redirect()->back()->with('success', 'Discussion created successfully.');
    }

    public function reply(StoreDiscussionRequest $request, SubmissionDiscussion $discussion)
    {
        $this->authorize('view', $discussion);

        $validated = $request->validated();

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $extension = $file->getClientOriginalExtension();
            $storedFilename = time().'_'.uniqid().'.'.$extension;
            $attachmentPath = $file->storeAs(
                'discussion_attachments/'.$discussion->id,
                $storedFilename,
                'public'
            );
        }

        DiscussionMessage::create([
            'submission_discussion_id' => $discussion->id,
            'user_id' => auth()->id(),
            'message' => $validated['body'],
            'parent_message_id' => $validated['parent_id'] ?? null,
            'attachment' => $attachmentPath,
        ]);

        return redirect()->back()->with('success', 'Reply sent successfully.');
    }

    public function uploadAttachment(Request $request, DiscussionMessage $message)
    {
        $this->authorize('update', $message);

        $validated = $request->validate([
            'attachment' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        $file = $validated['attachment'];
        $extension = $file->getClientOriginalExtension();
        $storedFilename = time().'_'.uniqid().'.'.$extension;

        $filePath = $file->storeAs(
            'discussion_attachments/messages/'.$message->id,
            $storedFilename,
            'public'
        );

        $message->update([
            'attachment' => $filePath,
        ]);

        return redirect()->back()->with('success', 'Attachment uploaded successfully.');
    }
}
