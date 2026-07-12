<?php

namespace App\Http\Controllers;

use App\Models\Funding;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FundingController extends Controller
{
    /**
     * Upload bukti transfer (proof of disbursement) for a funding term.
     */
    public function uploadBukti(Request $request, Funding $funding): RedirectResponse
    {
        $validated = $request->validate([
            'proof_document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'reference_number' => 'nullable|string|max:100',
            'paid_at' => 'nullable|date',
        ], [
            'proof_document.required' => 'File bukti transfer harus diunggah.',
            'proof_document.mimes' => 'File hanya boleh berformat PDF, JPG, atau PNG.',
            'proof_document.max' => 'Ukuran file tidak boleh lebih dari 5MB.',
        ]);

        $file = $validated['proof_document'];
        $fileName = time().'_'.$file->getClientOriginalName();
        $filePath = $file->storeAs('funding_receipts', $fileName, 'public');

        $funding->update([
            'proof_document_path' => $filePath,
            'reference_number' => $validated['reference_number'] ?? $funding->reference_number,
            'paid_at' => $validated['paid_at'] ?? $funding->paid_at ?? now(),
            'status' => Funding::STATUS_DISBURSED,
        ]);

        return back()->with('success', 'Bukti transfer dana berhasil diunggah.');
    }

    /**
     * Mencetak kwitansi termin ke dalam format PDF
     */
    public function printKwitansi(Request $request, $id)
    {
        // Mengambil data funding dan relasi contract.university
        $funding = Funding::with(['contract.university'])->findOrFail($id);

        // Pengecekan Otorisasi Multi-Tenancy
        $user = $request->user();
        if ($user->hasRole('Admin Kampus') && $funding->contract->university_id !== $user->university_id) {
            abort(403, 'Unauthorized access to this funding receipt.');
        }

        // Siapkan data untuk dikirim ke view
        $data = [
            'title' => 'Kwitansi Termin Pencairan',
            'date' => date('d/m/Y'),
            'funding' => $funding,
        ];

        // Konfigurasi Kertas Dinamis
        // Mengambil parameter dari URL, jika tidak ada gunakan nilai default
        $orientation = $request->query('orientation', 'landscape');
        $size = $request->query('size', 'A4');

        // Render tampilan PDF
        $pdf = Pdf::loadView('print.kwitansi', $data);

        // Logika penentuan ukuran kertas
        if ($size === 'custom') {
            // Jika custom, ambil nilai width dan height dari URL (dalam satuan point/pt)
            // Default 500x300 pt jika tidak diisi
            $width = $request->query('width', 500);
            $height = $request->query('height', 300);

            // DomPDF menerima array [x, y, width, height] untuk ukuran custom
            $pdf->setPaper([0, 0, $width, $height]);
        } else {
            // Untuk ukuran standar (A4, Letter, Legal, dll) dan orientasi (landscape/portrait)
            $pdf->setPaper($size, $orientation);
        }

        // Tampilkan PDF di browser
        return $pdf->stream('Kwitansi_Termin_'.$funding->id.'.pdf');
    }
}
