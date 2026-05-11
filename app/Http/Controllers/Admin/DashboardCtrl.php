<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardCtrl extends Controller
{
    /**
     * Menampilkan halaman dashboard Admin dengan data agregasi
     */
    public function index()
    {
        // Agregasi data dashboard admin global
        $stats = [
            'total_users' => DB::table('users')->count(),
            'total_journals' => DB::table('journals')->count(),
        ];

        return Inertia::render('Dashboard/Admin', [
            'stats' => $stats,
            'fundingData' => $this->getFundingChart()
        ]);
    }

    /**
     * Agregasi pendanaan tahunan menggunakan Query Builder
     * 
     * @return array
     */
    public function getFundingChart()
    {
        // Contoh implementasi Query Build jika ada tabel pendanaan/kontrak
        // Karena di studi kasus ini kita asumsikan tabel kontrak akan ada di minggu 9-11
        // Maka kita sertakan bentuk query builder dan mengembalikan mock data untuk charting

        /*
        $data = DB::table('kontraks')
            ->select(
                DB::raw('YEAR(tanggal_mulai) as year'), 
                DB::raw('SUM(dana_disetujui) as total')
            )
            ->where('status', 'disetujui')
            ->groupBy(DB::raw('YEAR(tanggal_mulai)'))
            ->orderBy('year', 'asc')
            ->get();
            
        return $data;
        */

        // Mock data
        return [
            [ 'year' => 2022, 'total' => 150000000 ],
            [ 'year' => 2023, 'total' => 200000000 ],
            [ 'year' => 2024, 'total' => 350000000 ],
            [ 'year' => 2025, 'total' => 500000000 ],
            [ 'year' => 2026, 'total' => 450000000 ],
        ];
    }
}
