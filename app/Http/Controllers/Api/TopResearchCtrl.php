<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Penelitian;
use Illuminate\Http\JsonResponse;

class TopResearchCtrl extends Controller
{
    /**
     * Ambil 5 penelitian teraktif berdasarkan jumlah anggota dosen
     * dan aktivitas terbaru (updated_at).
     *
     * GET /api/top-research
     */
    public function getTop(): JsonResponse
    {
        try {
            $topResearch = Penelitian::withCount('dosens')
                ->with([
                    'dosens:id,nama,nidn',
                    'ketua:id,nama,nidn',
                ])
                ->orderByDesc('dosens_count')
                ->orderByDesc('updated_at')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    return [
                        'id'            => $item->id,
                        'judul'         => $item->judul,
                        'tahun'         => $item->tahun,
                        'status'        => $item->status,
                        'total_dana'    => $item->total_dana,
                        'jumlah_dosen'  => $item->dosens_count,
                        'ketua'         => $item->ketua
                            ? ['nama' => $item->ketua->nama, 'nidn' => $item->ketua->nidn]
                            : null,
                        'anggota'       => $item->dosens->map(fn($d) => [
                            'nama' => $d->nama,
                            'nidn' => $d->nidn,
                        ]),
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Berhasil mengambil 5 penelitian teraktif',
                'data'    => $topResearch,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data penelitian',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}