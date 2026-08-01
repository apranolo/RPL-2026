<?php

namespace App\Http\Controllers\Admin;

use App\Exports\ResearchReportExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Tampilkan halaman Custom Report Generator.
     */
    public function generator()
    {
        $years = \App\Models\Proposal::select('tahun_pelaksanaan')
            ->whereNotNull('tahun_pelaksanaan')
            ->distinct()
            ->orderBy('tahun_pelaksanaan', 'desc')
            ->pluck('tahun_pelaksanaan')
            ->toArray();

        $statuses = \App\Models\Proposal::select('status_proposal')
            ->whereNotNull('status_proposal')
            ->distinct()
            ->pluck('status_proposal')
            ->toArray();

        return Inertia::render('Admin/Report/Generator', [
            'filterOptions' => [
                'tahun' => $years,
                'status' => $statuses,
            ],
        ]);
    }

    /**
     * Trigger Export Excel.
     */
    public function exportExcel(Request $request)
    {
        $request->validate([
            'filters' => 'nullable|array',
            'filters.tahun' => 'nullable|array',
            'filters.status' => 'nullable|array',
        ]);

        $filters = $request->input('filters', []);

        // Return file download via browser
        return Excel::download(new ResearchReportExport($filters), 'rekap_penelitian_'.date('Ymd_His').'.xlsx');
    }
}
