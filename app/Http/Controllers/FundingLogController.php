<?php

namespace App\Http\Controllers;

use App\Models\Funding;
use Illuminate\Http\Request;
use Inertia\Inertia; // PERBAIKAN GAMBAR 2: Import class Inertia

class FundingLogController extends Controller
{
    public function index(Request $request)
    {
        // Inisialisasi query dengan relasi 'logs'
        $query = Funding::query()->with(['logs']);

        // PERBAIKAN GAMBAR 1 (Multi-Tenancy): Filter data jika diakses oleh Admin Kampus
        $user = $request->user();

        // Memastikan user login dan memiliki role 'Admin Kampus'
        // Note: Sesuaikan method ->hasRole() atau pengecekan role sesuai package yang kamu gunakan (misal: Spatie)
        if ($user && $user->hasRole('Admin Kampus')) {
            // Membatasi data hanya untuk universitas milik admin yang sedang login
            // Sesuaikan kolom 'university_id' dengan nama foreign key di tabel fundings Anda
            $query->where('university_id', $user->university_id);
        }

        // Ambil data terbaru dengan paginasi 10 data per halaman
        $logs = $query->latest()->paginate(10);

        // PERBAIKAN GAMBAR 1 & 2 (Inertia Mismatch): Mengembalikan render halaman Inertia, bukan JSON mentah
        return Inertia::render('Finance/Funding/Logs', [
            'logs' => $logs,
        ]);
    }
}
