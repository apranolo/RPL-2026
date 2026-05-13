<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonevReportCtrl extends Controller
{
    /**
     * Mengambil rekap monev keseluruhan dengan data dummy
     */
    public function index(Request $request)
    {
        // Data dummy untuk rekap monev keseluruhan
        $dummyData = [
            'ringkasan' => [
                'total_program' => 120,
                'program_selesai' => 45,
                'program_berjalan' => 60,
                'program_tertunda' => 15,
            ],
            'anggaran' => [
                'total_anggaran' => 15000000000,
                'anggaran_terserap' => 8500000000,
                'persentase_serapan' => 56.67
            ],
            'kinerja_wilayah' => [
                ['wilayah' => 'Jawa Barat', 'skor' => 85, 'status' => 'Baik'],
                ['wilayah' => 'Jawa Tengah', 'skor' => 78, 'status' => 'Cukup'],
                ['wilayah' => 'Jawa Timur', 'skor' => 92, 'status' => 'Sangat Baik'],
            ],
            'kegiatan_terbaru' => [
                [
                    'id' => 1,
                    'nama_kegiatan' => 'Pembangunan Fasilitas Air Bersih',
                    'progres' => 75,
                    'status' => 'Berjalan',
                    'tanggal_update' => '2026-05-12'
                ],
                [
                    'id' => 2,
                    'nama_kegiatan' => 'Pelatihan Kewirausahaan Pemuda',
                    'progres' => 100,
                    'status' => 'Selesai',
                    'tanggal_update' => '2026-05-10'
                ],
                [
                    'id' => 3,
                    'nama_kegiatan' => 'Pembangunan Jalan Desa',
                    'progres' => 20,
                    'status' => 'Tertunda',
                    'tanggal_update' => '2026-05-08'
                ]
            ]
        ];

        return Inertia::render('Admin/Monev/Report', [
            'data' => $dummyData
        ]);
    }
}
