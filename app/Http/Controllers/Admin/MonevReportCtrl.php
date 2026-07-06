<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class MonevReportCtrl extends Controller
{
    /**
     * Mengambil rekap monev keseluruhan dengan data dummy / riil
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $universityId = null;

        // Multi-tenant check: Limit Admin Kampus to their own university's data
        if ($user && $user->isAdminKampus()) {
            abort_if(
                is_null($user->university_id),
                403,
                'Akun Admin Kampus Anda belum terhubung ke universitas. Hubungi Super Admin.'
            );
            $universityId = $user->university_id;
        }

        // Check if progress_reports table exists
        $hasTable = Schema::hasTable('progress_reports');

        if ($hasTable) {
            // Real Data Path (Option B: queried dynamically if table exists)
            $query = DB::table('progress_reports');

            if ($universityId) {
                $query->where('university_id', $universityId);
            }

            $reports = $query->get();

            $total_program = $reports->count();
            $program_selesai = $reports->where('status', 'Selesai')->count();
            $program_berjalan = $reports->where('status', 'Berjalan')->count();
            $program_tertunda = $reports->where('status', 'Tertunda')->count();

            $total_anggaran = $reports->sum('anggaran');
            $anggaran_terserap = $reports->sum('anggaran_terserap');
            $persentase_serapan = $total_anggaran > 0 ? round(($anggaran_terserap / $total_anggaran) * 100, 2) : 0;

            // Group by fakultas and calculate averages
            $kinerja_fakultas = $reports->groupBy('fakultas')->map(function ($group, $fakultas) {
                $avgSkor = round($group->avg('skor_kinerja'));
                $status = 'Cukup';
                if ($avgSkor >= 85) {
                    $status = 'Sangat Baik';
                } elseif ($avgSkor >= 75) {
                    $status = 'Baik';
                }
                return [
                    'fakultas' => $fakultas,
                    'skor' => $avgSkor,
                    'status' => $status
                ];
            })->values()->toArray();

            // Order by update date for recent research activities
            $penelitian_terbaru = $reports->sortByDesc('tanggal_update')->take(5)->map(function ($report) {
                return [
                    'id' => $report->id,
                    'judul_penelitian' => $report->judul_penelitian,
                    'nama_dosen' => $report->nama_dosen,
                    'progres' => $report->progres,
                    'status' => $report->status,
                    'tanggal_update' => $report->tanggal_update,
                ];
            })->values()->toArray();

            $data = [
                'ringkasan' => [
                    'total_penelitian' => $total_program,
                    'penelitian_selesai' => $program_selesai,
                    'penelitian_berjalan' => $program_berjalan,
                    'penelitian_tertunda' => $program_tertunda,
                ],
                'anggaran' => [
                    'total_anggaran' => $total_anggaran,
                    'anggaran_terserap' => $anggaran_terserap,
                    'persentase_serapan' => $persentase_serapan
                ],
                'kinerja_fakultas' => $kinerja_fakultas,
                'penelitian_terbaru' => $penelitian_terbaru
            ];
        } else {
            // Localized Research Domain Dummy Data Fallback
            $data = [
                'ringkasan' => [
                    'total_penelitian' => 120,
                    'penelitian_selesai' => 45,
                    'penelitian_berjalan' => 60,
                    'penelitian_tertunda' => 15,
                ],
                'anggaran' => [
                    'total_anggaran' => 15000000000,
                    'anggaran_terserap' => 8500000000,
                    'persentase_serapan' => 56.67
                ],
                'kinerja_fakultas' => [
                    ['fakultas' => 'Fakultas Ilmu Komputer', 'skor' => 88, 'status' => 'Sangat Baik'],
                    ['fakultas' => 'Fakultas Teknik', 'skor' => 82, 'status' => 'Baik'],
                    ['fakultas' => 'Fakultas Kedokteran', 'skor' => 76, 'status' => 'Cukup'],
                ],
                'penelitian_terbaru' => [
                    [
                        'id' => 1,
                        'judul_penelitian' => 'Pengembangan Sistem Deteksi Dini Kanker menggunakan Artificial Intelligence',
                        'nama_dosen' => 'Dr. Ahmad Fauzi',
                        'progres' => 75,
                        'status' => 'Berjalan',
                        'tanggal_update' => '2026-05-12'
                    ],
                    [
                        'id' => 2,
                        'judul_penelitian' => 'Analisis Perbandingan Protokol Keamanan pada IoT Smart Grid',
                        'nama_dosen' => 'Budi Santoso, M.T.',
                        'progres' => 100,
                        'status' => 'Selesai',
                        'tanggal_update' => '2026-05-10'
                    ],
                    [
                        'id' => 3,
                        'judul_penelitian' => 'Studi Efektivitas Pembelajaran Jarak Jauh Berbasis Virtual Reality',
                        'nama_dosen' => 'Rina Wijayanti, Ph.D.',
                        'progres' => 20,
                        'status' => 'Tertunda',
                        'tanggal_update' => '2026-05-08'
                    ]
                ]
            ];
        }

        return Inertia::render('Admin/Monev/Report', [
            'data' => $data
        ]);
    }
}
