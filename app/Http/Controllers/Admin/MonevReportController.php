<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Funding;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MonevReportController extends Controller
{
    /**
     * Mengambil rekap monev keseluruhan
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

        $search = $request->input('search');
        $statusFilter = $request->input('status');

        $contractQuery = Contract::query();
        if ($universityId) {
            $contractQuery->where('university_id', $universityId);
        }

        // Summary Calculations (excluding cancelled)
        $summaryQuery = clone $contractQuery;
        
        $total_program = (clone $summaryQuery)->count();
        $program_selesai = (clone $summaryQuery)->where('status', Contract::STATUS_COMPLETED)->count();
        $program_berjalan = (clone $summaryQuery)->where('status', Contract::STATUS_ACTIVE)->count();
        $program_tertunda = (clone $summaryQuery)->where('status', Contract::STATUS_CANCELLED)->count();

        $total_anggaran = (clone $summaryQuery)->sum('contract_value');
        
        // Funding query
        $fundingQuery = Funding::where('status', Funding::STATUS_DISBURSED);
        if ($universityId) {
            $fundingQuery->whereHas('contract', function($q) use ($universityId) {
                $q->where('university_id', $universityId);
            });
        }
        $anggaran_terserap = $fundingQuery->sum('amount');
        
        $persentase_serapan = $total_anggaran > 0 ? round(($anggaran_terserap / $total_anggaran) * 100, 2) : 0;

        // Kinerja Bidang Ilmu (menggunakan relasi Contract -> Proposal -> User -> ScientificField)
        // karena entitas Fakultas secara eksplisit tidak ada dalam schema saat ini.
        $contractsForKinerja = (clone $contractQuery)->with(['proposal.user.scientificField', 'progressReports'])->get();
        $kinerjaMap = [];
        
        foreach ($contractsForKinerja as $c) {
            $field = $c->proposal->user->scientificField->name ?? 'Belum Diketahui';
            if (!isset($kinerjaMap[$field])) {
                $kinerjaMap[$field] = ['total_progres' => 0, 'count' => 0];
            }
            
            $latestReport = $c->progressReports->sortByDesc('created_at')->first();
            $progress = $latestReport ? $latestReport->progress_percentage : 0;
            
            $kinerjaMap[$field]['total_progres'] += $progress;
            $kinerjaMap[$field]['count']++;
        }

        $kinerja_fakultas = [];
        foreach ($kinerjaMap as $field => $data) {
            $skor = $data['count'] > 0 ? (int) round($data['total_progres'] / $data['count']) : 0;
            $statusStr = 'Kurang';
            if ($skor >= 85) {
                $statusStr = 'Sangat Baik';
            } elseif ($skor >= 70) {
                $statusStr = 'Baik';
            } elseif ($skor >= 50) {
                $statusStr = 'Cukup';
            }

            $kinerja_fakultas[] = [
                'fakultas' => $field, // tetap menggunakan key 'fakultas' agar compatible dengan UI
                'skor' => $skor,
                'status' => $statusStr,
            ];
        }

        // Penelitian Terbaru with filters and pagination
        $listQuery = clone $contractQuery;
        $listQuery->with(['proposal.user', 'progressReports' => function($q) {
            $q->latest();
        }]);

        if ($search) {
            $listQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('proposal.user', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($statusFilter) {
            $listQuery->where('status', $statusFilter);
        }

        $contracts = $listQuery->latest()->paginate(10)->withQueryString();

        $penelitian_terbaru = $contracts->getCollection()->map(function ($contract) {
            $latestReport = $contract->progressReports->first();
            $progress = $latestReport ? $latestReport->progress_percentage : 0;
            $updatedAt = $latestReport ? $latestReport->updated_at : $contract->updated_at;
            
            $statusLabel = 'Draft';
            if ($contract->status === Contract::STATUS_ACTIVE) {
                $statusLabel = 'Berjalan';
            } elseif ($contract->status === Contract::STATUS_COMPLETED) {
                $statusLabel = 'Selesai';
            } elseif ($contract->status === Contract::STATUS_CANCELLED) {
                $statusLabel = 'Tertunda';
            }

            return [
                'id' => $contract->id,
                'judul_penelitian' => $contract->title ?? 'Tidak Ada Judul',
                'nama_dosen' => $contract->proposal->user->name ?? 'Unknown',
                'progres' => $progress,
                'status' => $statusLabel,
                'tanggal_update' => Carbon::parse($updatedAt)->format('Y-m-d'),
                'is_late' => Carbon::parse($updatedAt)->addDays(14)->isPast() && $contract->status === Contract::STATUS_ACTIVE,
            ];
        });

        // Re-assign mapped items to paginator
        $paginator = $contracts->setCollection($penelitian_terbaru);

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
            'penelitian_terbaru' => $paginator
        ];

        return Inertia::render('Admin/Monev/Report', [
            'data' => $data,
            'filters' => [
                'search' => $search ?? '',
                'status' => $statusFilter ?? '',
            ]
        ]);
    }

    /**
     * Mengubah status penelitian (Lanjut/Stop)
     */
    public function decideAction(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
            'action' => 'required|string|in:Lanjut,Stop'
        ]);

        $id = $request->input('id');
        $action = $request->input('action');

        $status = $action === 'Lanjut' ? Contract::STATUS_ACTIVE : Contract::STATUS_CANCELLED;

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

        $query = Contract::where('id', $id);
        if ($universityId) {
            $query->where('university_id', $universityId);
        }

        $contract = $query->first();

        if (!$contract) {
            return redirect()->back()->with('error', 'Penelitian (Kontrak) tidak ditemukan atau Anda tidak memiliki akses.');
        }

        $contract->update([
            'status' => $status
        ]);

        return redirect()->back()->with('success', 'Status penelitian berhasil diperbarui.');
    }
}
