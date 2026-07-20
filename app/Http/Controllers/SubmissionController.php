<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SubmissionController extends Controller
{
    /**
     * Menampilkan daftar naskah milik user yang sedang login.
     */
    public function index()
    {
        // Mengunci kueri database berdasarkan ID user aktif (Multi-Tenancy)
        $submissions = Submission::where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Submission/Index', [
            'submissions' => $submissions
        ]);
    }

    /**
     * Menyimpan naskah baru ke dalam sistem.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'required|string',
        ]);

        // Menggunakan nilai enum 'Draft' (bukan 'pending') untuk menghindari constraint violation
        Submission::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'abstract' => $validated['abstract'],
            'status' => 'Draft', 
        ]);

        return redirect()->route('submissions.index')
            ->with('success', 'Naskah berhasil disimpan sebagai Draft.');
    }

    /**
     * Menampilkan detail naskah spesifik secara aman.
     */
    public function show(string $id)
    {
        // Memastikan pengaksesan detail naskah terikat pada user_id pemiliknya (Anti-IDOR)
        $submission = Submission::where('user_id', Auth::id())->findOrFail($id);

        return Inertia::render('Submission/Show', [
            'submission' => $submission
        ]);
    }

    /**
     * Memperbarui data naskah secara aman.
     */
    public function update(Request $request, string $id)
    {
        $submission = Submission::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'abstract' => 'required|string',
            'status' => 'required|string|in:Draft,Submitted,In_Review',
        ]);

        $submission->update($validated);

        return redirect()->route('submissions.index')
            ->with('success', 'Naskah berhasil diperbarui.');
    }

    /**
     * Menghapus data naskah secara aman.
     */
    public function destroy(string $id)
    {
        // Memastikan proses penghapusan terproteksi dari ID guessing user lain
        $submission = Submission::where('user_id', Auth::id())->findOrFail($id);
        
        $submission->delete();

        return redirect()->route('submissions.index')
            ->with('success', 'Naskah berhasil dihapus.');
    }
}