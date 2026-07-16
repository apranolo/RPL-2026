<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Carbon\Carbon;

class MonevReportController extends Controller
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
                    'is_late' => Carbon::parse($report->tanggal_update)->addDays(14)->isPast(),
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
            // Localized Research Domain Dummy Data Fallback with multi-tenant filtering
            $dummyReports = collect([
                [
                    'id' => 1,
                    'university_id' => 1, // Assume 1 is Univ A
                    'judul_penelitian' => 'Pengembangan Sistem Deteksi Dini Kanker menggunakan Artificial Intelligence',
                    'nama_dosen' => 'Dr. Ahmad Fauzi',
                    'fakultas' => 'Fakultas Kedokteran',
                    'progres' => 75,
                    'status' => 'Berjalan',
                    'anggaran' => 5000000000,
                    'anggaran_terserap' => 3500000000,
                    'skor_kinerja' => 88,
                    'tanggal_update' => '2026-05-12'
                ],
                [
                    'id' => 2,
                    'university_id' => 2, // Assume 2 is Univ B
                    'judul_penelitian' => 'Analisis Perbandingan Protokol Keamanan pada IoT Smart Grid',
                    'nama_dosen' => 'Budi Santoso, M.T.',
                    'fakultas' => 'Fakultas Teknik',
                    'progres' => 100,
                    'status' => 'Selesai',
                    'anggaran' => 6000000000,
                    'anggaran_terserap' => 3000000000,
                    'skor_kinerja' => 82,
                    'tanggal_update' => '2026-05-10'
                ],
                [
                    'id' => 3,
                    'university_id' => 1, // Univ A
                    'judul_penelitian' => 'Studi Efektivitas Pembelajaran Jarak Jauh Berbasis Virtual Reality',
                    'nama_dosen' => 'Rina Wijayanti, Ph.D.',
                    'fakultas' => 'Fakultas Ilmu Komputer',
                    'progres' => 20,
                    'status' => 'Tertunda',
                    'anggaran' => 4000000000,
                    'anggaran_terserap' => 2000000000,
                    'skor_kinerja' => 76,
                    'tanggal_update' => '2026-05-08'
                ],
                [
                    'id' => 4,
                    'university_id' => 2, // Univ B
                    'judul_penelitian' => 'Optimasi Rantai Pasok Berkelanjutan pada Industri Manufaktur',
                    'nama_dosen' => 'Dr. Ir. Hendra Wijaya',
                    'fakultas' => 'Fakultas Teknik',
                    'progres' => 45,
                    'status' => 'Berjalan',
                    'anggaran' => 3500000000,
                    'anggaran_terserap' => 1500000000,
                    'skor_kinerja' => 80,
                    'tanggal_update' => '2026-05-14'
                ]
            ]);

            if ($universityId) {
                $dummyReports = $dummyReports->where('university_id', $universityId);
            }

            $total_program = $dummyReports->count();
            $program_selesai = $dummyReports->where('status', 'Selesai')->count();
            $program_berjalan = $dummyReports->where('status', 'Berjalan')->count();
            $program_tertunda = $dummyReports->where('status', 'Tertunda')->count();

            $total_anggaran = $dummyReports->sum('anggaran');
            $anggaran_terserap = $dummyReports->sum('anggaran_terserap');
            $persentase_serapan = $total_anggaran > 0 ? round(($anggaran_terserap / $total_anggaran) * 100, 2) : 0;

            $kinerja_fakultas = $dummyReports->groupBy('fakultas')->map(function ($group, $fakultas) {
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

            $penelitian_terbaru = $dummyReports->sortByDesc('tanggal_update')->take(5)->map(function ($report) {
                return [
                    'id' => $report['id'],
                    'judul_penelitian' => $report['judul_penelitian'],
                    'nama_dosen' => $report['nama_dosen'],
                    'progres' => $report['progres'],
                    'status' => $report['status'],
                    'tanggal_update' => $report['tanggal_update'],
                    'is_late' => Carbon::parse($report['tanggal_update'])->addDays(14)->isPast(),
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
        }

        return Inertia::render('Admin/Monev/Report', [
            'data' => $data
        ]);
    }

    /**
     * Mengubah status penelitian (Lanjut/Stop)
     */
    public function decideAction(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'action' => 'required|string|in:Lanjut,Stop,Berjalan,Tertunda,Selesai'
        ]);

        $id = $request->input('id');
        $action = $request->input('action');

        // Map "Lanjut" to "Berjalan" and "Stop" to "Tertunda"
        $status = $action;
        if ($action === 'Lanjut') {
            $status = 'Berjalan';
        } elseif ($action === 'Stop') {
            $status = 'Tertunda';
        }

        $user = $request->user();
        $universityId = null;

        if ($user && $user->isAdminKampus()) {
            abort_if(
                is_null($user->university_id),
                403,
                'Akun Admin Kampus Anda belum terhubung ke universitas. Hubungi Super Admin.'
            );
            $universityId = $user->university_id;
        }

        $hasTable = Schema::hasTable('progress_reports');

        if ($hasTable) {
            $query = DB::table('progress_reports')->where('id', $id);

            if ($universityId) {
                $query->where('university_id', $universityId);
            }

            $report = $query->first();

            if (!$report) {
                return redirect()->back()->with('error', 'Laporan penelitian tidak ditemukan atau Anda tidak memiliki akses.');
            }

            DB::table('progress_reports')
                ->where('id', $id)
                ->update([
                    'status' => $status,
                    'tanggal_update' => now()->toDateString(),
                    'updated_at' => now()
                ]);
        }

        return redirect()->back()->with('success', 'Status penelitian berhasil diperbarui.');
    }
}
