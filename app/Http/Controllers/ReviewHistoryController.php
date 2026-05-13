<?php

namespace App\Http\Controllers;

use App\Models\PembinaanReview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewHistoryController extends Controller
{
    /**
     * Menampilkan riwayat review untuk Dosen pengusul
     */
    public function index(Request $request): Response
    {
        // Mendapatkan user (dosen) yang sedang login
        $user = $request->user();

        // Mengambil data dari PembinaanReview berdasarkan dosen yang login
        $query = PembinaanReview::where('reviewer_id', $user->id)
            ->with([
                // Memuat relasi ke data pendaftaran dan user(pengusul) agar bisa tampil di tabel
                'registration.user',
                'registration.pembinaan'
            ]);

        // Mengurutkan dari yang paling baru direview dan membaginya 15 data per halaman
        $histories = $query->orderBy('reviewed_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        // MENGEMBALIKAN KE VIEW YANG TEPAT
        // 'Proposal/ReviewHistory' merujuk ke file resources/js/pages/Proposal/ReviewHistory.tsx
        return Inertia::render('Proposal/ReviewHistory', [
            'histories' => $histories,
        ]);
    }
}