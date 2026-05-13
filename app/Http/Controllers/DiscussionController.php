<?php

namespace App\Http\Controllers;

use App\Models\DiscussionMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DiscussionController extends Controller
{
    /**
     * Reply to a message in a discussion thread.
     *
     * Creates a new DiscussionMessage as a reply (child) to the given parent message.
     * The reply inherits the same polymorphic discussable context from its parent,
     * ensuring thread integrity within the same entity (e.g., JournalAssessment).
     *
     * @route POST /discussions/{parentMessage}/reply
     */
    public function reply(Request $request, DiscussionMessage $parentMessage): RedirectResponse
    {
        $validated = $request->validate([
            'body' => 'required|string|max:5000',
        ]);

        $user = $request->user();

        DB::beginTransaction();
        try {
            $reply = DiscussionMessage::create([
                'discussable_type' => $parentMessage->discussable_type,
                'discussable_id' => $parentMessage->discussable_id,
                'user_id' => $user->id,
                'parent_id' => $parentMessage->id,
                'body' => $validated['body'],
                'author_role' => $user->role?->name ?? 'User',
            ]);

            DB::commit();

            return back()->with('success', 'Balasan berhasil dikirim.');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Failed to reply to discussion message', [
                'parent_message_id' => $parentMessage->id,
                'user_id' => $user->id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Gagal mengirim balasan: '.$e->getMessage());
        }
    }

    /**
     * Upload an attachment to a discussion message.
     *
     * Stores the uploaded file on the "public" disk under the
     * discussion_attachments/ directory and updates the discussion message
     * with the attachment file path.
     *
     * @route POST /discussions/{message}/upload-attachment
     */
    public function uploadAttachment(Request $request, DiscussionMessage $message): RedirectResponse
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB max
        ]);

        $user = $request->user();

        try {
            $file = $validated['file'];
            $originalFilename = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $storedFilename = time().'_'.uniqid().'.'.$extension;

            $filePath = $file->storeAs(
                'discussion_attachments/'.$message->id,
                $storedFilename,
                'public'
            );

            // Update the message with attachment info
            $message->update([
                'attachment_path' => $filePath,
                'attachment_filename' => $originalFilename,
            ]);

            return back()->with('success', 'Attachment berhasil diupload.');

        } catch (\Exception $e) {
            \Log::error('Failed to upload discussion attachment', [
                'message_id' => $message->id,
                'user_id' => $user->id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->with('error', 'Gagal mengupload attachment: '.$e->getMessage());
        }
    }
}
