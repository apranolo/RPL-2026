<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SubmissionController extends Controller
{
    public function index(): Response
    {
        $submissions = Submission::where('user_id', Auth::id())
            ->orWhere('author_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Submission/Index', [
            'submissions' => $submissions,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Submission/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'nullable|string',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,zip|max:5120',
        ]);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('submissions', 'public');
        }

        Submission::create([
            'user_id' => Auth::id(),
            'author_id' => Auth::id(),
            'title' => $validated['title'],
            'abstract' => $validated['abstract'] ?? $validated['description'] ?? '',
            'file_path' => $filePath,
            'status' => 'draft',
        ]);

        return redirect()->route('submissions.index')
            ->with('success', 'Naskah berhasil disimpan sebagai Draft.');
    }

    public function show(Submission $submission): Response
    {
        $submission->load([
            'author',
            'statusHistories',
            'reviewer',
        ]);

        if ($submission->author_id !== auth()->id() && $submission->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Submission/Show', [
            'submission' => $submission,
            'tracking' => $submission->statusHistories,
        ]);
    }

    public function edit($id)
    {
        $submission = Submission::findOrFail($id);

        return Inertia::render('Submission/Edit', [
            'submission' => $submission,
        ]);
    }

    public function update(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $submission->update([
            'status' => $request->status,
        ]);

        return redirect()->route('submissions.index')->with('success', 'Status pengajuan berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $submission = Submission::findOrFail($id);

        if ($submission->file_path && Storage::disk('public')->exists($submission->file_path)) {
            Storage::disk('public')->delete($submission->file_path);
        }

        $submission->delete();

        return redirect()->route('submissions.index')->with('success', 'Pengajuan berhasil dihapus!');
    }

    public function cancel(Submission $submission)
    {
        if ($submission->author_id !== auth()->id() && $submission->user_id !== auth()->id()) {
            abort(403);
        }

        if (strtolower($submission->status) !== 'draft') {
            return back()->with(
                'error',
                'Only draft submissions can be cancelled.'
            );
        }

        if ($submission->file_path && Storage::disk('public')->exists($submission->file_path)) {
            Storage::disk('public')->delete($submission->file_path);
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
