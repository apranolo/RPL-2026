<?php

namespace App\Http\Controllers;

use App\Models\Submission; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia; // 1. WAJIB DIIMPORT: Menggunakan Inertia untuk render React

class SubmissionController extends Controller
{
    /**
     * 1. MENAMPILKAN SEMUA DATA (Terhubung dengan Index.tsx)
     */
    public function index()
    {
        // Mengambil semua data pengajuan, diurutkan dari yang terbaru
        $submissions = Submission::latest()->get();

        // Mengarahkan ke file React: resources/js/pages/Submission/Index.tsx
        return Inertia::render('Submission/Index', [
            'submissions' => $submissions,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ]
        ]);
    }

    /**
     * 2. MENAMPILKAN FORMULIR UNTUK MEMBUAT PENGAJUAN BARU
     */
    public function create()
    {
        // Mengarahkan ke file React: resources/js/pages/Submission/Create.tsx
        return Inertia::render('Submission/Create');
    }

    /**
     * 3. MENYIMPAN DATA BARU DARI FORMULIR KE DATABASE
     */
    public function store(Request $request)
    {
        // Validasi input
        $validatedData = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'file'        => 'required|file|mimes:pdf,doc,docx,zip|max:5120', 
        ]);

        // Proses Unggah File
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('submissions', 'public');
            $validatedData['file_path'] = $filePath;
        }

        // Simpan ke database
        Submission::create([
            'title'       => $validatedData['title'],
            'description' => $validatedData['description'],
            'file_path'   => $validatedData['file_path'] ?? null,
            'status'      => 'pending', 
        ]);

        // redirect menggunakan route name ke submissions.index dengan flash session
        return redirect()->route('submissions.index')->with('success', 'Pengajuan berhasil dikirim!');
    }

    /**
     * 4. MENAMPILKAN DETAIL DARI SATU PENGAJUAN SPESIFIK
     */
    public function show($id)
    {
        $submission = Submission::findOrFail($id);

        // Mengarahkan ke file React: resources/js/pages/Submission/Show.tsx
        return Inertia::render('Submission/Show', [
            'submission' => $submission
        ]);
    }

    /**
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