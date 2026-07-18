<?php

namespace App\Http\Controllers;

use App\Models\Funding;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FundingLogController extends Controller
{
    /**
     * Menampilkan daftar riwayat perubahan termin pendanaan
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Eager loading sudah bersih dari updated_by
        $query = Funding::query()->with(['contract.university']);

        // Filter Otorisasi Multi-Tenancy
        // [PERBAIKAN] Menggunakan helper model User sesuai standardisasi
        if ($user->isAdminKampus()) {
            $query->whereHas('contract', function ($q) use ($user) {
                $q->where('university_id', $user->university_id);
            });
        }

        // Ambil data dengan paginasi
        $logs = $query->latest('updated_at')->paginate(10);

        // Render response ke Inertia (menuju Logs.tsx)
        return Inertia::render('Finance/Funding/Logs', [
            'logs' => $logs,
        ]);
    }
}
