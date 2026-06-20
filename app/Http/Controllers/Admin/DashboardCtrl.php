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
     * Agregasi pendanaan tahunan menggunakan Query Builder dari data riil database
     * * @return \Illuminate\Support\Collection
     */
    public function getFundingChart()
    {
        // Mengambil data riil dari tabel contracts sesuai skema database PR #25
        $data = DB::table('contracts')
            ->select(
                DB::raw('YEAR(start_date) as year'), 
                DB::raw('SUM(contract_value) as total')
            )
            // Memfilter kontrak yang sudah disetujui/berjalan (active & completed)
            ->whereIn('status', ['active', 'completed'])
            ->groupBy(DB::raw('YEAR(start_date)'))
            ->orderBy('year', 'asc')
            ->get();
            
        return $data;
    }
}