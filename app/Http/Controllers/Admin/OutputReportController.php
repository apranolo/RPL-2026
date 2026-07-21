<?php

namespace App\Http\Controllers\Admin;

use App\Exports\OutputsExport;
use App\Http\Controllers\Controller;
use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OutputReportController extends Controller
{
    /**
     * Render the printable Rekap Luaran report page.
     *
     * Passes to the Inertia view:
     *  - outputs         : flat list of verified outputs (with relations)
     *  - statsByType     : total per output type
     *  - statsByYear     : total per output year
     *  - filters         : active filter values echoed back
     *  - generatedAt     : current UTC timestamp (ISO-8601)
     *
     * Supports optional query-string filters:
     *  - type  : 'Jurnal' | 'Buku' | 'HKI' | 'Produk'
     *  - year  : e.g. '2025'
     *
     * @route GET /admin/output/report
     *
     * @name  admin.output.report
     */
    public function index(Request $request): Response
    {
        $type = $request->input('type');
        $year = $request->input('year');
        $user = Auth::user();

        /* ── 1. Main outputs list ───────────────────────────────────────── */
        $outputsQuery = ResearchOutput::with(['user.university'])
            ->where('status', 'verified')
            ->when($type, fn ($q) => $q->where('type', $type))
            ->when($year, fn ($q) => $q->where('year', $year));

        // Multi-tenancy filters
        if ($user->isAdminKampus()) {
            $outputsQuery->whereHas('user', function ($uq) use ($user) {
                $uq->where('university_id', $user->university_id);
            });
        } elseif (! $user->isSuperAdmin()) {
            $outputsQuery->where('user_id', $user->id);
        }

        $outputs = $outputsQuery->orderBy('created_at', 'desc')->get();

        /* ── 2. Stats by type (honours active filters) ──────────────────── */
        $statsRowsQuery = DB::table('outputs as o')
            ->whereNull('o.deleted_at')
            ->where('o.status', 'verified')
            ->when($type, fn ($q) => $q->where('o.type', $type))
            ->when($year, fn ($q) => $q->where('o.year', $year));

        // Multi-tenancy for stats by type
        if ($user->isAdminKampus()) {
            $statsRowsQuery->join('users as u', 'u.id', '=', 'o.user_id')
                ->where('u.university_id', $user->university_id);
        } elseif (! $user->isSuperAdmin()) {
            $statsRowsQuery->where('o.user_id', $user->id);
        }

        $statsRows = $statsRowsQuery->select('o.type', DB::raw('COUNT(o.id) as total'))
            ->groupBy('o.type')
            ->orderBy('o.type')
            ->get();

        $typeLabels = [
            'Jurnal' => 'Jurnal',
            'Buku' => 'Buku',
            'HKI' => 'HKI',
            'Produk' => 'Produk',
        ];
        $knownTypes = array_keys($typeLabels);

        $statsByType = collect($typeLabels)
            ->map(fn (string $label, string $t) => [
                'category' => $t,
                'label' => $label,
                'total' => (int) ($statsRows->firstWhere('type', $t)?->total ?? 0),
            ])
            ->values()
            ->concat(
                $statsRows
                    ->filter(fn ($r) => ! in_array($r->type, $knownTypes))
                    ->map(fn ($r) => [
                        'category' => $r->type,
                        'label' => ucfirst($r->type),
                        'total' => (int) $r->total,
                    ])
            )
            ->values();

        /* ── 3. Stats by year (honours active filters) ──────────────────── */
        $yearRowsQuery = DB::table('outputs as o')
            ->whereNull('o.deleted_at')
            ->where('o.status', 'verified')
            ->when($type, fn ($q) => $q->where('o.type', $type))
            ->when($year, fn ($q) => $q->where('o.year', $year));

        // Multi-tenancy for stats by year
        if ($user->isAdminKampus()) {
            $yearRowsQuery->join('users as u', 'u.id', '=', 'o.user_id')
                ->where('u.university_id', $user->university_id);
        } elseif (! $user->isSuperAdmin()) {
            $yearRowsQuery->where('o.user_id', $user->id);
        }

        $yearRows = $yearRowsQuery->select('o.year', DB::raw('COUNT(o.id) as total'))
            ->groupBy('o.year')
            ->orderBy('o.year')
            ->get();

        $statsByYear = $yearRows->map(fn ($r) => [
            'year' => (int) $r->year,
            'total' => (int) $r->total,
        ])->values();

        /* ── 4. Render ──────────────────────────────────────────────────── */
        return Inertia::render('Admin/Output/Report', [
            'outputs' => $outputs,
            'statsByType' => $statsByType,
            'statsByYear' => $statsByYear,
            'filters' => [
                'type' => $type,
                'year' => $year,
            ],
            'generatedAt' => now()->toISOString(),
        ]);
    }

    /**
     * Stream a styled Excel workbook of verified luaran.
     *
     * Supports the same optional query-string filters as index():
     *  - type         : 'Jurnal' | 'Buku' | 'HKI' | 'Produk'
     *  - year         : e.g. '2025'
     *  - university_id: filter to a single university (Admin Kampus restricted)
     *
     * @route GET /admin/output/export
     *
     * @name  admin.output.export
     */
    public function export(Request $request): BinaryFileResponse
    {
        $type = $request->input('type');
        $year = $request->input('year');
        $universityId = $request->integer('university_id') ?: null;
        $user = Auth::user();

        $userId = null;
        if ($user->isAdminKampus()) {
            $universityId = $user->university_id;
        } elseif (! $user->isSuperAdmin()) {
            $userId = $user->id;
        }

        // Build a descriptive filename: luaran_jurnal_2025.xlsx
        $parts = ['luaran'];
        if ($type) {
            $parts[] = strtolower($type);
        }
        if ($year) {
            $parts[] = $year;
        }
        if ($universityId) {
            $parts[] = 'univ'.$universityId;
        }
        $filename = implode('_', $parts).'.xlsx';

        return Excel::download(
            new OutputsExport($type, $year, $universityId, $userId),
            $filename,
            \Maatwebsite\Excel\Excel::XLSX,
        );
    }
}
