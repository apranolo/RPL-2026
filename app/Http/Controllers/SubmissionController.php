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
    /**
     * Menampilkan daftar naskah milik user yang sedang login.
     */
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
            ]
        ]);
    }

    /**
     * Menyimpan naskah baru ke dalam sistem.
     */
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
            'title' => $validated['title'],
            'abstract' => $validated['abstract'] ?? $validated['description'] ?? '',
            'file_path' => $filePath,
            'status' => 'Draft', 
        ]);

        return redirect()->route('submissions.index')
            ->with('success', 'Naskah berhasil disimpan sebagai Draft.');
    }

    /**
     * 2. MENAMPILKAN FORMULIR UNTUK MEMBUAT PENGAJUAN BARU
     */
    public function create(): Response
    {
        return Inertia::render('Submission/Create');
    }

    /**
     * 3. MENYIMPAN DATA BARU DARI FORMULIR KE DATABASE
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'file'        => 'required|file|mimes:pdf,doc,docx,zip|max:5120', 
        ]);

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('submissions', 'public');
            $validatedData['file_path'] = $filePath;
        }

        Submission::create([
            'user_id'     => auth()->id(),
            'title'       => $validatedData['title'],
            'description' => $validatedData['description'],
            'file_path'   => $validatedData['file_path'] ?? null,
            'status'      => 'pending', 
        ]);

        return redirect()->route('submissions.index')->with('success', 'Pengajuan berhasil dikirim!');
    }
     * Menampilkan halaman detail naskah beserta linimasa status.
     */
    public function show(Submission $submission): Response
    {
        $submission->load([
            'author',
            'statusHistories',
            'reviewer',
        ]);

        if ($submission->author_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Submission/Show', [
            'submission' => $submission,
            'tracking' => $submission->statusHistories,
>>>>>>> e61e90173d9a79656f141463c8caa7f9aa9fc6f0
        ]);
    }

    /**
<<<<<<< HEAD
     * 5. MENAMPILKAN FORMULIR EDIT (Misal untuk admin merubah status)
     */
    public function edit($id)
    {
        $submission = Submission::findOrFail($id);

        // Mengarahkan ke file React: resources/js/pages/Submission/Edit.tsx
        return Inertia::render('Submission/Edit', [
            'submission' => $submission
        ]);
    }

    /**
     * 6. MEMPROSES UPDATE/PERUBAHAN DATA DI DATABASE
     */
    public function update(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $submission->update([
            'status' => $request->status
        ]);

        return redirect()->route('submissions.index')->with('success', 'Status pengajuan berhasil diperbarui!');
    }

    /**
     * 7. MENGHAPUS DATA PENGAJUAN
     */
    public function destroy($id)
    {
        $submission = Submission::findOrFail($id);

        // Hapus file fisik jika ada
        if ($submission->file_path && Storage::disk('public')->exists($submission->file_path)) {
            Storage::disk('public')->delete($submission->file_path);
        }

        // Hapus data dari database
        $submission->delete();

        return redirect()->route('submissions.index')->with('success', 'Pengajuan berhasil dihapus!');
    }
}
=======
     * Membatalkan (menghapus) naskah yang masih berstatus draft.
     * Hanya author pemilik naskah yang boleh membatalkan.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cancel(Submission $submission)
    {
        if ($submission->author_id !== auth()->id()) {
            abort(403);
        }

        if ($submission->status !== 'draft') {
            return back()->with(
                'error',
                'Only draft submissions can be cancelled.'
            );
        }

        $submission->delete();

        // TODO: ganti ke route('submissions.index') begitu halaman
        // daftar submission dibuat. Untuk saat ini rute itu belum ada
        // di web.php, jadi redirect ke dashboard agar tidak 404.
        return redirect()
            ->route('dashboard')
            ->with(
                'success',
                'Submission cancelled successfully.'
            );
    }
}
<<<<<<< HEAD
development
=======
>>>>>>> e61e90173d9a79656f141463c8caa7f9aa9fc6f0
>>>>>>> 0655c6d2010f1cbc9a09a5f3a5e3b9f1fcb70f61
