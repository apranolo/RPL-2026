<?php

namespace App\Http\Controllers\Admin;

use App\Exports\OutputsExport;
use App\Http\Controllers\Controller;
use App\Models\PembinaanRegistration;
use Illuminate\Http\Request;
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
     *  - registrations   : flat list of approved registrations (with relations)
     *  - statsByCategory : total per pembinaan category
     *  - statsByYear     : total per registration year
     *  - filters         : active filter values echoed back
     *  - generatedAt     : current UTC timestamp (ISO-8601)
     *
     * Supports optional query-string filters:
     *  - category  : 'akreditasi' | 'indeksasi'
     *  - year      : e.g. '2025'
     *
     * @route GET /admin/output/report
     * @name  admin.output.report
     */
    public function index(Request $request): Response
    {
        $category = $request->input('category');
        $year     = $request->input('year');

        /* ── 1. Main registrations list ─────────────────────────────────── */
        $registrations = PembinaanRegistration::with([
                'journal:id,title,issn,e_issn,sinta_rank,sinta_rank_label,university_id',
                'journal.university:id,name,short_name',
                'pembinaan:id,name,category',
            ])
            ->whereNull('pembinaan_registrations.deleted_at')
            ->where('pembinaan_registrations.status', 'approved')
            ->whereHas('pembinaan', function ($q) use ($category, $year) {
                $q->whereNull('deleted_at');
                if ($category) {
                    $q->where('category', $category);
                }
            })
            ->when($year, fn ($q) => $q->whereYear('registered_at', $year))
            ->orderBy('registered_at', 'desc')
            ->get([
                'id',
                'pembinaan_id',
                'journal_id',
                'status',
                'registered_at',
            ]);

        /* ── 2. Stats by category (honours active filters) ──────────────── */
        $statsRows = DB::table('pembinaan_registrations as pr')
            ->join('pembinaan as p', 'p.id', '=', 'pr.pembinaan_id')
            ->whereNull('pr.deleted_at')
            ->whereNull('p.deleted_at')
            ->where('pr.status', 'approved')
            ->when($category, fn ($q) => $q->where('p.category', $category))
            ->when($year, fn ($q) => $q->whereYear('pr.registered_at', $year))
            ->select('p.category', DB::raw('COUNT(pr.id) as total'))
            ->groupBy('p.category')
            ->orderBy('p.category')
            ->get();

        $categoryLabels = ['akreditasi' => 'Akreditasi', 'indeksasi' => 'Indeksasi'];
        $knownCategories = array_keys($categoryLabels);

        // Ensure every known category appears (zero-fill if empty)
        $statsByCategory = collect($categoryLabels)
            ->map(fn (string $label, string $cat) => [
                'category' => $cat,
                'label'    => $label,
                'total'    => (int) ($statsRows->firstWhere('category', $cat)?->total ?? 0),
            ])
            ->values()
            ->concat(
                $statsRows
                    ->filter(fn ($r) => ! in_array($r->category, $knownCategories))
                    ->map(fn ($r) => [
                        'category' => $r->category,
                        'label'    => ucfirst($r->category),
                        'total'    => (int) $r->total,
                    ])
            )
            ->values();

        /* ── 3. Stats by year (honours active filters) ───────────────────── */
        $yearRows = DB::table('pembinaan_registrations as pr')
            ->join('pembinaan as p', 'p.id', '=', 'pr.pembinaan_id')
            ->whereNull('pr.deleted_at')
            ->whereNull('p.deleted_at')
            ->where('pr.status', 'approved')
            ->when($category, fn ($q) => $q->where('p.category', $category))
            ->when($year, fn ($q) => $q->whereYear('pr.registered_at', $year))
            ->select(
                DB::raw('YEAR(pr.registered_at) as year'),
                DB::raw('COUNT(pr.id) as total')
            )
            ->groupBy(DB::raw('YEAR(pr.registered_at)'))
            ->orderBy(DB::raw('YEAR(pr.registered_at)'))
            ->get();

        $statsByYear = $yearRows->map(fn ($r) => [
            'year'  => (int) $r->year,
            'total' => (int) $r->total,
        ])->values();

        /* ── 4. Render ────────────────────────────────────────────────────── */
        return Inertia::render('Admin/Output/Report', [
            'registrations'   => $registrations,
            'statsByCategory' => $statsByCategory,
            'statsByYear'     => $statsByYear,
            'filters'         => [
                'category' => $category,
                'year'     => $year,
            ],
            'generatedAt' => now()->toISOString(),
        ]);
    }

    /**
     * Stream a styled Excel workbook of approved luaran.
     *
     * Supports the same optional query-string filters as index():
     *  - category     : 'akreditasi' | 'indeksasi'
     *  - year         : e.g. '2025'
     *  - university_id: filter to a single university
     *
     * @route GET /admin/output/export
     * @name  admin.output.export
     */
    public function export(Request $request): BinaryFileResponse
    {
        $category     = $request->input('category');
        $year         = $request->input('year');
        $universityId = $request->integer('university_id') ?: null;

        // Build a descriptive filename: luaran_akreditasi_2025.xlsx
        $parts = ['luaran'];
        if ($category)     { $parts[] = $category; }
        if ($year)         { $parts[] = $year; }
        if ($universityId) { $parts[] = 'univ'.$universityId; }
        $filename = implode('_', $parts) . '.xlsx';

        return Excel::download(
            new OutputsExport($category, $year, $universityId),
            $filename,
            \Maatwebsite\Excel\Excel::XLSX,
        );
    }
}
