<?php

namespace App\Http\Controllers;

use App\Models\Revision;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RevisionController extends Controller
{
    public function create(Request $request, Submission $submission): Response
    {
        if ($submission->user_id !== Auth::id()) {
            abort(403, 'You are not authorized to upload revisions for this submission.');
        }

        $revision = Revision::where('submission_id', $submission->id)
            ->where('status', 'requested')
            ->first();

        if (!$revision) {
            abort(404, 'No revision request found for this submission.');
        }

        return Inertia::render('submissions/revision-form', [
            'submission' => $submission->load('journal'),
            'revision' => $revision,
        ]);
    }

    public function uploadRevision(Request $request, Submission $submission)
    {
        if ($submission->user_id !== Auth::id()) {
            throw ValidationException::withMessages([
                'submission' => 'You are not authorized to upload revisions for this submission.',
            ]);
        }

        if ($submission->status !== 'revision_requested') {
            throw ValidationException::withMessages([
                'submission' => 'This submission is not awaiting revision. Current status: ' . $submission->status,
            ]);
        }

        $request->validate([
            'revision_file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:20480'], // Max 20MB
            'cover_letter' => ['nullable', 'string', 'max:5000'],
            'response_to_reviewers' => ['nullable', 'string', 'max:10000'], // Point-by-point response
        ]);

        $revision = Revision::where('submission_id', $submission->id)
            ->where('status', 'requested')
            ->first();

        if (!$revision) {
            throw ValidationException::withMessages([
                'submission' => 'No revision request found for this submission.',
            ]);
        }

        $file = $request->file('revision_file');
        $originalName = $file->getClientOriginalName();
        $fileName = time() . '_' . $submission->id . '_revision_' . $originalName;
        $filePath = $file->storeAs('revisions/' . $submission->id, $fileName, 'public');

        if ($revision->file_path && Storage::disk('public')->exists($revision->file_path)) {
            Storage::disk('public')->delete($revision->file_path);
        }

        $revision->update([
            'file_path' => $filePath,
            'original_filename' => $originalName,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'cover_letter' => $request->cover_letter,
            'response_to_reviewers' => $request->response_to_reviewers,
            'submitted_at' => now(),
            'version' => $revision->version + 1,
            'status' => 'submitted',
        ]);

        $submission->update([
            'status' => 'revision_submitted',
            'revision_submitted_at' => now(),
        ]);

        return redirect()->route('submissions.show', $submission->id)
            ->with('success', 'Revision has been uploaded successfully. The editor will review your changes.');
    }

    public function history(Submission $submission): Response
    {
        if ($submission->user_id !== Auth::id() && !Auth::user()->hasRole(['editor', 'admin'])) {
            abort(403, 'You are not authorized to view revision history.');
        }

        $revisions = Revision::where('submission_id', $submission->id)
            ->orderBy('version', 'desc')
            ->get();

        return Inertia::render('submissions/revision-history', [
            'submission' => $submission->load('journal', 'user'),
            'revisions' => $revisions,
        ]);
    }

    public function download(Revision $revision)
    {
        $submission = $revision->submission;
        
        if ($submission->user_id !== Auth::id() && 
            !Auth::user()->hasRole(['editor', 'reviewer', 'admin'])) {
            abort(403, 'You are not authorized to download this revision file.');
        }

        if (!$revision->file_path || !Storage::disk('public')->exists($revision->file_path)) {
            abort(404, 'Revision file not found.');
        }

        return Storage::disk('public')->download(
            $revision->file_path,
            $revision->original_filename ?? 'revision_file_' . $revision->id . '.pdf'
        );
    }

    public function approve(Request $request, Revision $revision)
    {
        if (!Auth::user()->hasRole(['editor', 'admin'])) {
            abort(403, 'Only editors can approve revisions.');
        }

        $submission = $revision->submission;

        if ($revision->status !== 'submitted') {
            throw ValidationException::withMessages([
                'revision' => 'This revision cannot be approved. Current status: ' . $revision->status,
            ]);
        }

        $request->validate([
            'editor_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $revision->update([
            'status' => 'approved',
            'editor_notes' => $request->editor_notes,
            'reviewed_at' => now(),
            'reviewed_by' => Auth::id(),
        ]);

        $submission->update([
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);

        return redirect()->route('submissions.review', $submission->id)
            ->with('success', 'Revision has been approved. Submission status updated to Accepted.');
    }

    public function requestAdditionalRevision(Request $request, Revision $revision)
    {
        if (!Auth::user()->hasRole(['editor', 'admin'])) {
            abort(403, 'Only editors can request additional revisions.');
        }

        $submission = $revision->submission;

        if ($revision->status !== 'submitted') {
            throw ValidationException::withMessages([
                'revision' => 'This revision cannot be reviewed. Current status: ' . $revision->status,
            ]);
        }

        $request->validate([
            'revision_notes' => ['required', 'string', 'min:20', 'max:5000'],
            'due_date' => ['nullable', 'date', 'after:today'],
        ]);

        $revision->update([
            'status' => 'rejected',
            'editor_notes' => $request->revision_notes,
            'reviewed_at' => now(),
            'reviewed_by' => Auth::id(),
        ]);

        $newRevision = Revision::create([
            'submission_id' => $submission->id,
            'requested_by' => Auth::id(),
            'revision_notes' => $request->revision_notes,
            'due_date' => $request->due_date ?? now()->addDays(14),
            'status' => 'requested',
            'version' => $revision->version + 1,
        ]);

        $submission->update([
            'status' => 'revision_requested',
        ]);

        return redirect()->route('submissions.review', $submission->id)
            ->with('success', 'Additional revision requested. Author has been notified.');
    }
}