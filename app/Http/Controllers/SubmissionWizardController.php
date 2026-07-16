<?php

/**
 * @file SubmissionWizardController.php
 * @description Controller untuk menangani alur multi-step submission wizard naskah jurnal.
 * @author Haryansyah Dwi Nugroho <@Haryansyah15>
 */

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Models\Submission;
use Illuminate\Support\Facades\Auth;

class SubmissionWizardController extends Controller
{
    /**
     * Menampilkan Halaman Wizard Step 1 (Pemilihan Jurnal & Lisensi)
     */
    public function step1()
    {
        return Inertia::render('Submission/Wizard/Step1Start', [
            'journals' => [
                ['id' => 1, 'title' => 'Jurnal Teknologi Informasi (JTI)'],
                ['id' => 2, 'title' => 'Jurnal Rekayasa Perangkat Lunak (RPL)'],
            ],
        ]);
    }

    /**
     * Memproses Penyimpanan Data Step 1 (Menyimpan Draft ke DB)
     */
    public function storeStep1(Request $request)
    {
        $validated = $request->validate([
            'journal_id' => 'required|integer|exists:journals,id', // Pastikan exist jika ada DB real
            'agreement1' => 'required|accepted',
            'agreement2' => 'required|accepted',
            'agreement3' => 'required|accepted',
            'agreement4' => 'required|accepted',
        ], [
            'journal_id.required' => 'Silakan pilih jurnal tujuan terlebih dahulu.',
            'agreement1.accepted' => 'Anda harus menyetujui komitmen ke-1.',
            'agreement2.accepted' => 'Anda harus menyetujui komitmen ke-2.',
            'agreement3.accepted' => 'Anda harus menyetujui komitmen ke-3.',
            'agreement4.accepted' => 'Anda harus menyetujui komitmen ke-4.',
        ]);

        // Buat atau Update Draft Submission di Database
        $submission = Submission::updateOrCreate(
            [
                'id' => session('submission_id'),
                'author_id' => Auth::id(),
            ],
            [
                'journal_id' => $validated['journal_id'],
                'title' => 'Draft Submission', // Placeholder sebelum Step 3
                'status' => 'Draft',
            ]
        );

        // Simpan ID ke session untuk referensi step berikutnya
        session(['submission_id' => $submission->id]);

        return redirect()->route('submission.step2')
            ->with('success', 'Draft submission berhasil disimpan.');
    }

    /**
     * Menampilkan Halaman Wizard Step 2 (Upload File)
     */
    public function step2()
    {
        $submissionId = session('submission_id');
        if (!$submissionId) {
            return redirect()->route('submission.step1')
                ->with('error', 'Silakan isi Step 1 terlebih dahulu.');
        }

        return Inertia::render('Submission/Wizard/Step2Upload');
    }

    /**
     * Memproses Upload Manuscript & File Tambahan di Step 2
     */
    public function step2Upload(Request $request)
    {
        $request->validate([
            'manuscript' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'supplementary_files.*' => 'nullable|file|max:5120',
        ]);

        $submissionId = session('submission_id');
        if (!$submissionId) {
            return redirect()->route('submission.step1')
                ->withErrors(['wizard' => 'Sesi draf tidak ditemukan.']);
        }

        $submission = Submission::find($submissionId);
        if (!$submission) {
            return redirect()->route('submission.step1')
                ->withErrors(['wizard' => 'Draf submission tidak ditemukan di database.']);
        }

        if ($request->hasFile('manuscript')) {
            $path = $request->file('manuscript')->store('submissions/manuscripts', 'public');
            
            // Simpan path ke database (sesuaikan dengan skema tabel Anda)
            $submission->update([
                'manuscript_path' => $path, // Pastikan kolom ini ada atau tangani via relasi
            ]);

            // Handling file tambahan jika ada
            if ($request->hasFile('supplementary_files')) {
                foreach ($request->file('supplementary_files') as $file) {
                    $file->store('submissions/supplementary', 'public');
                    // Simpan ke tabel submission_files jika skema relasi sudah siap
                }
            }

            return redirect()->route('submission.step3')
                ->with('success', 'File manuskrip berhasil diunggah.');
        }

        return back()->withErrors(['manuscript' => 'Upload file gagal.']);
    }
}