<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage; // Memuat library Storage untuk menyimpan file

class SubmissionWizardController extends Controller
{
    // ==========================================
    // STEP 1 - VIEW PAGE (Menampilkan Halaman)
    // ==========================================
    public function step1()
    {
        return Inertia::render('Submission/Wizard/Step1Start', [
            'journals' => [
                // Contoh data dummy dulu agar dropdown pilihan jurnal di Step 1 tidak kosong pelontos
                ['id' => 1, 'name' => 'Jurnal Teknologi Informasi (JTI)'],
                ['id' => 2, 'name' => 'Jurnal Rekayasa Perangkat Lunak (RPL)'],
            ], 
        ]);
    }

    // ==========================================
    // STEP 1 - STORE DATA (Memproses Form & Redirect)
    // ==========================================
    public function storeStep1(Request $request)
    {
        // 1. Validasi input dari React component Step 1
        $request->validate([
            'journal_id' => 'required', 
            'agreement' => 'required|accepted',
        ], [
            'journal_id.required' => 'Silakan pilih jurnal tujuan terlebih dahulu.',
            'agreement.accepted' => 'Anda harus menyetujui syarat dan ketentuan untuk melanjutkan.',
        ]);

        // 2. Ambil data session lama (jika ada) atau buat array baru
        $submission = session('submission', []);
        
        // 3. Masukkan data dari Step 1 ke session
        $submission['journal_id'] = $request->journal_id;
        $submission['agreement'] = $request->agreement;
        $submission['step'] = 2; // Tandai bahwa user sekarang berhak ke step 2

        session(['submission' => $submission]);

        // 4. Lempar user secara aman ke halaman Step 2 menggunakan Inertia Redirect
        return redirect()->route('submission.step2');
    }

    // ==========================================
    // INIT WIZARD SESSION (Optional tapi penting)
    // ==========================================
    public function initWizard(Request $request)
    {
        session([
            'submission' => [
                'step' => 1,
                'data' => []
            ]
        ]);

        return response()->json([
            'message' => 'Wizard initialized'
        ]);
    }

    // ==========================================
    // STEP 2 - VIEW PAGE (Menampilkan Halaman)
    // ==========================================
    public function step2()
    {
        return Inertia::render('Submission/Wizard/Step2Upload');
    }

    // ==========================================
    // STEP 2 - UPLOAD PROCESS (Memproses Unggah Berkas)
    // ==========================================
   // ==========================================
    // STEP 2 - UPLOAD PROCESS (Memproses Unggah Berkas)
    // ==========================================
public function step2Upload(Request $request)
{
    // Validasi file
    $request->validate([
        'manuscript' => 'required|file|mimes:pdf,doc,docx|max:10240',
    ]);

    // Simpan file jika ada
    if ($request->hasFile('manuscript')) {

        $file = $request->file('manuscript');

        // simpan file
        $path = $file->store('submissions');

        // simpan session wizard
        $submission = session('submission', []);

        $submission['manuscript_path'] = $path;
        $submission['step'] = 3;

        session(['submission' => $submission]);

        // PINDAH KE STEP 3
        return redirect('/submission/step-3');
    }

    return back()->withErrors([
        'manuscript' => 'Upload gagal'
    ]);
}
}