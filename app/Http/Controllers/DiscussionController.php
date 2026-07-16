<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDiscussionRequest;
use App\Models\DiscussionMessage;
use App\Models\SubmissionDiscussion;
use Illuminate\Http\RedirectResponse;
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

    /**
     * Reply to a message in a discussion thread.
     */
    public function reply(StoreDiscussionRequest $request, DiscussionMessage $parentMessage): RedirectResponse
    {
        // Otorisasi keamanan (Critical): memastikan user berhak (terlibat) dalam diskusi
        $submissionDiscussion = $parentMessage->discussion;
        if (!$submissionDiscussion || !$submissionDiscussion->submission) {
            abort(404, 'Diskusi tidak ditemukan.');
        }

        $submission = $submissionDiscussion->submission;
        $user = auth()->user();

        // Mengizinkan apabila ia adalah author dari submission, atau merupakan salah satu peran terkait
        $isAuthor = $submission->author_id === $user->id;
        $isEditor = $user->hasRole('Editor') || $user->hasRole('Super Admin') || $user->hasRole('Reviewer') || $user->hasRole('Admin Kampus');

        if (!$isAuthor && !$isEditor) {
            abort(403, 'Anda tidak memiliki hak akses untuk membalas diskusi ini.');
        }

        $validated = $request->validated();

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $extension = $file->getClientOriginalExtension();
            $storedFilename = time().'_'.uniqid().'.'.$extension;
            $attachmentPath = $file->storeAs(
                'discussion_attachments/'.$submissionDiscussion->id,
                $storedFilename,
                'public'
            );
        }

        // Catatan: Mengimpor App\Models\DiscussionMessage; Model ini baru ditambahkan pada branch development Alfin
        DiscussionMessage::create([
            'submission_discussion_id' => $submissionDiscussion->id,
            'user_id' => $user->id,
            'message' => $validated['body'] ?? '',
            'parent_message_id' => $parentMessage->id,
            'attachment' => $attachmentPath,
        ]);

        return redirect()->back()->with('success', 'Balasan berhasil dikirim.');
    }

    /**
     * Upload an attachment to a discussion message.
     */
    public function uploadAttachment(StoreDiscussionRequest $request, DiscussionMessage $message): RedirectResponse
    {
        // Otorisasi keamanan (Critical): memastikan user berhak (terlibat) dalam diskusi
        $submissionDiscussion = $message->discussion;
        if (!$submissionDiscussion || !$submissionDiscussion->submission) {
            abort(404, 'Diskusi tidak ditemukan.');
        }

        $submission = $submissionDiscussion->submission;
        $user = auth()->user();

        $isAuthor = $submission->author_id === $user->id;
        $isEditor = $user->hasRole('Editor') || $user->hasRole('Super Admin') || $user->hasRole('Reviewer') || $user->hasRole('Admin Kampus');

        if (!$isAuthor && !$isEditor) {
            abort(403, 'Anda tidak memiliki hak akses untuk mengunggah berkas pada diskusi ini.');
        }

        $validated = $request->validated();

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $extension = $file->getClientOriginalExtension();
            $storedFilename = time().'_'.uniqid().'.'.$extension;

            $filePath = $file->storeAs(
                'discussion_attachments/messages/'.$message->id,
                $storedFilename,
                'public'
            );

            // Menyimpan path di database sesuai model baru Alfin
            $message->update([
                'attachment' => $filePath,
            ]);
        }

        return redirect()->back()->with('success', 'Attachment berhasil diupload.');
    }
}
