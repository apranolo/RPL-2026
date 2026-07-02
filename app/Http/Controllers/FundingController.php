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
        // Ambil data funding dan relasi universitas
        // Sesuaikan 'university' jika nama fungsi relasi di model Funding berbeda
        $funding = Funding::with(['university'])->findOrFail($id);

        // Siapkan data untuk dikirim ke view
        $data = [
            'title' => 'Kwitansi Termin Pencairan',
            'date' => date('d/m/Y'),
            'funding' => $funding,
        ];

        // Render tampilan PDF dari resources/views/print/kwitansi.blade.php
        $pdf = Pdf::loadView('print.kwitansi', $data);

        // Set ukuran kertas (A4 Landscape)
        $pdf->setPaper('A4', 'landscape'); 

        // Tampilkan PDF di browser
        return $pdf->stream('Kwitansi_Termin_' . $funding->id . '.pdf');
    }
}