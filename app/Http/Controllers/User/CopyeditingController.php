<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CopyeditingTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CopyeditingController extends Controller
{
    public function panel(CopyeditingTask $task)
    {
        if (auth()->id() !== $task->copyeditor_id && auth()->id() !== $task->submission?->author_id) {
            abort(403);
        }

        $task->load(['submission.author', 'copyeditor']);

        return Inertia::render('Copyediting/CopyeditingPanel', [
            'submission' => $this->formatTask($task),
        ]);
    }

    public function uploadCopyeditedFile(Request $request, CopyeditingTask $task)
    {
        if (auth()->id() !== $task->copyeditor_id) {
            abort(403);
        }

        $request->validate([
            'copyedited_file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
            'copyeditor_notes' => ['nullable', 'string', 'max:2000'],
        ], [
            'copyedited_file.required' => 'File copyediting wajib diupload.',
            'copyedited_file.mimes' => 'File harus berformat PDF, DOC, atau DOCX.',
            'copyedited_file.max' => 'Ukuran file maksimal 10MB.',
        ]);

        if ($task->copyedited_file_path) {
            Storage::disk('public')->delete($task->copyedited_file_path);
        }

        $file = $request->file('copyedited_file');
        $path = $file->store('copyediting/copyedited', 'public');

        $task->update([
            'copyedited_file_path' => $path,
            'copyedited_file_name' => $file->getClientOriginalName(),
            'copyeditor_notes' => $request->copyeditor_notes,
            'status' => 'Completed',
            'copyedited_at' => now(),
        ]);

        return back()->with('success', 'File copyediting berhasil diupload. Menunggu persetujuan Author.');
    }

    public function approvalPage(CopyeditingTask $task)
    {
        if (auth()->id() !== $task->submission?->author_id) {
            abort(403);
        }

        $task->load(['submission', 'copyeditor']);

        return Inertia::render('Copyediting/AuthorApproval', [
            'submission' => $this->formatTask($task),
        ]);
    }

    public function approve(Request $request, CopyeditingTask $task)
    {
        if (auth()->id() !== $task->submission?->author_id) {
            abort(403);
        }

        $request->validate([
            'author_approval_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        if (! $task->isCompleted()) {
            return back()->withErrors(['error' => 'Task tidak dalam status menunggu persetujuan.']);
        }

        $task->update([
            'status' => 'Author_Approved',
            'author_approval_notes' => $request->author_approval_notes,
            'author_approved_at' => now(),
        ]);

        return redirect()
            ->route('user.pembinaan.copyediting.panel', $task)
            ->with('success', 'Anda telah menyetujui hasil copyediting. Naskah siap masuk tahap Production.');
    }

    public function reject(Request $request, CopyeditingTask $task)
    {
        if (auth()->id() !== $task->submission?->author_id) {
            abort(403);
        }

        $request->validate([
            'author_approval_notes' => ['required', 'string', 'max:1000'],
        ], [
            'author_approval_notes.required' => 'Catatan penolakan wajib diisi agar Copyeditor tahu yang perlu diperbaiki.',
        ]);

        if (! $task->isCompleted()) {
            return back()->withErrors(['error' => 'Task tidak dalam status menunggu persetujuan.']);
        }

        $task->update([
            'status' => 'In_Progress',
            'author_approval_notes' => $request->author_approval_notes,
            'copyedited_file_path' => null,
            'copyedited_file_name' => null,
            'copyedited_at' => null,
        ]);

        return redirect()
            ->route('user.pembinaan.copyediting.panel', $task)
            ->with('success', 'Hasil copyediting dikembalikan ke Copyeditor untuk direvisi.');
    }

    private function formatTask(CopyeditingTask $task): array
    {
        return [
            'id' => $task->id,
            'status' => $task->status,
            'original_file_name' => $task->original_file_name,
            'original_file_url' => $task->original_file_path
                ? Storage::disk('public')->url($task->original_file_path)
                : null,
            'copyedited_file_name' => $task->copyedited_file_name,
            'copyedited_file_url' => $task->copyedited_file_path
                ? Storage::disk('public')->url($task->copyedited_file_path)
                : null,
            'copyeditor_notes' => $task->copyeditor_notes,
            'author_approval_notes' => $task->author_approval_notes,
            'copyedited_at' => $task->copyedited_at?->toDateTimeString(),
            'author_approved_at' => $task->author_approved_at?->toDateTimeString(),
            'article' => $task->submission ? [
                'id' => $task->submission->id,
                'title' => $task->submission->title,
            ] : null,
            'author' => $task->submission?->author ? [
                'id' => $task->submission->author->id,
                'name' => $task->submission->author->name,
            ] : null,
            'copyeditor' => $task->copyeditor ? [
                'id' => $task->copyeditor->id,
                'name' => $task->copyeditor->name,
            ] : null,
        ];
    }
}
