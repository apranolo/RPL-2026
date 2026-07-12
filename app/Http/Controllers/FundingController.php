<?php

namespace App\Http\Controllers;

use App\Models\Funding;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class FundingController extends Controller
{
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
        return $pdf->stream('Kwitansi_Termin_' . $funding->id . '.pdf');
    }
}