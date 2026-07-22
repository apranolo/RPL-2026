<?php

namespace App\Http\Controllers\Revision;

use App\Http\Controllers\Controller;
use App\Http\Requests\NotifyAuthorRevisionRequest;
use App\Models\RevisionRound;

class RevisionController extends Controller
{
    public function notifyAuthor(NotifyAuthorRevisionRequest $request, $id_submission)
    {
        // Data sudah tervalidasi & terotorisasi oleh NotifyAuthorRevisionRequest.
        $data = $request->validated();
        $nextRound = (int) RevisionRound::where('id_submission', $id_submission)->max('round_number') + 1;

        $revision = RevisionRound::create([
            'id_submission' => $id_submission,
            'round_number' => $nextRound,
            'status' => $data['status'],
            'editor_decision_note' => $data['editor_decision_note'],
            'due_date' => $data['due_date'],
        ]);

        return redirect()->back()
            ->with('success', 'Keputusan dan catatan revisi berhasil dikirim ke Author!');
    }

    /**
     * Upload file revisi oleh Author.
     */
    public function uploadRevision(\Illuminate\Http\Request $request, $submissionId)
    {
        $request->validate([
            'revision_file' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'author_notes' => 'nullable|string|max:1000',
        ]);

        $submission = \App\Models\Submission::findOrFail($submissionId);

        if ($request->hasFile('revision_file')) {
            $path = $request->file('revision_file')->store('revisions', 'public');

            $file = \App\Models\SubmissionFile::create([
                'submission_id' => $submission->id,
                'file_path' => $path,
                'file_name' => $request->file('revision_file')->getClientOriginalName(),
                'file_type' => 'revision',
                'uploaded_by' => auth()->id(),
            ]);

            return back()->with('success', 'File revisi berhasil diunggah.');
        }

        return back()->with('error', 'Gagal mengunggah file revisi.');
    }

    /**
     * Tampilkan histori versi dokumen.
     */
    public function versionHistory($submissionId)
    {
        $files = \App\Models\SubmissionFile::where('submission_id', $submissionId)
            ->with('uploader')
            ->latest()
            ->get();

        return response()->json($files);
    }
}
