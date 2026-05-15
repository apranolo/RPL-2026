<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CopyeditingSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CopyeditingController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | TUGAS 1 & 2: Panel Copyeditor (3 kolom) + Upload File Copyedited
    |--------------------------------------------------------------------------
    */

    public function panel(CopyeditingSubmission $submission)
    {
        $submission->load(['article', 'author', 'copyeditor']);

        return Inertia::render('User/Copyediting/CopyeditingPanel', [
            'submission' => $this->formatSubmission($submission),
        ]);
    }

    public function uploadCopyeditedFile(Request $request, CopyeditingSubmission $submission)
    {
        $request->validate([
            'copyedited_file'  => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'copyeditor_notes' => ['nullable', 'string', 'max:2000'],
        ], [
            'copyedited_file.required' => 'File copyediting wajib diupload.',
            'copyedited_file.mimes'    => 'File harus berformat PDF, DOC, atau DOCX.',
            'copyedited_file.max'      => 'Ukuran file maksimal 10MB.',
        ]);

        if ($submission->copyedited_file_path) {
            Storage::disk('public')->delete($submission->copyedited_file_path);
        }

        $file = $request->file('copyedited_file');
        $path = $file->store('copyediting/copyedited', 'public');

        $submission->update([
            'copyedited_file_path' => $path,
            'copyedited_file_name' => $file->getClientOriginalName(),
            'copyeditor_notes'     => $request->copyeditor_notes,
            'status'               => 'waiting_approval',
            'copyedited_at'        => now(),
        ]);

        return back()->with('success', 'File copyediting berhasil diupload. Menunggu persetujuan Author.');
    }

    /*
    |--------------------------------------------------------------------------
    | TUGAS 3 & 4: Persetujuan Author + View Konfirmasi
    |--------------------------------------------------------------------------
    */

     * TUGAS 4: Tampilkan view konfirmasi persetujuan Author
     * (sebelum masuk tahap Production)
     */
    public function approvalPage(CopyeditingSubmission $submission)
    {
        $submission->load(['article', 'copyeditor']);

        return Inertia::render('User/Copyediting/AuthorApproval', [
            'submission' => $this->formatSubmission($submission),
        ]);
    }

    public function approve(Request $request, CopyeditingSubmission $submission)
    {
        $request->validate([
            'author_approval_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! $submission->isWaitingApproval()) {
            return back()->withErrors(['error' => 'Submission tidak dalam status menunggu persetujuan.']);
        }

        $submission->update([
            'status'                => 'approved',
            'author_approval_notes' => $request->author_approval_notes,
            'author_approved_at'    => now(),
        ]);

        return redirect()
            ->route('user.copyediting.panel', $submission)
            ->with('success', 'Anda telah menyetujui hasil copyediting. Artikel siap masuk tahap Production.');
    }

    public function reject(Request $request, CopyeditingSubmission $submission)
    {
        $request->validate([
            'author_approval_notes' => ['required', 'string', 'max:1000'],
        ], [
            'author_approval_notes.required' => 'Catatan penolakan wajib diisi agar Copyeditor tahu yang perlu diperbaiki.',
        ]);

        if (! $submission->isWaitingApproval()) {
            return back()->withErrors(['error' => 'Submission tidak dalam status menunggu persetujuan.']);
        }

        $submission->update([
            'status'                => 'copyediting',
            'author_approval_notes' => $request->author_approval_notes,
            'copyedited_file_path'  => null,
            'copyedited_file_name'  => null,
            'copyedited_at'         => null,
        ]);

        return redirect()
            ->route('user.copyediting.panel', $submission)
            ->with('success', 'Hasil copyediting dikembalikan ke Copyeditor untuk direvisi.');
    }

    /*
    |--------------------------------------------------------------------------
    | Helper
    |--------------------------------------------------------------------------
    */

    private function formatSubmission(CopyeditingSubmission $submission): array
    {
        return [
            'id'                    => $submission->id,
            'status'                => $submission->status,
            'original_file_name'    => $submission->original_file_name,
            'original_file_url'     => $submission->original_file_path
                ? Storage::disk('public')->url($submission->original_file_path)
                : null,
            'copyedited_file_name'  => $submission->copyedited_file_name,
            'copyedited_file_url'   => $submission->copyedited_file_path
                ? Storage::disk('public')->url($submission->copyedited_file_path)
                : null,
            'copyeditor_notes'      => $submission->copyeditor_notes,
            'author_approval_notes' => $submission->author_approval_notes,
            'copyedited_at'         => $submission->copyedited_at?->toDateTimeString(),
            'author_approved_at'    => $submission->author_approved_at?->toDateTimeString(),
            'article'               => $submission->article ? [
                'id'    => $submission->article->id,
                'title' => $submission->article->title,
            ] : null,
            'author'                => $submission->author ? [
                'id'   => $submission->author->id,
                'name' => $submission->author->name,
            ] : null,
            'copyeditor'            => $submission->copyeditor ? [
                'id'   => $submission->copyeditor->id,
                'name' => $submission->copyeditor->name,
            ] : null,
        ];
    }
}
