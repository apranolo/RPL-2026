<?php

namespace App\Http\Controllers;

use App\Models\ProgressReport;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    // Task 10 - index(): daftar laporan kemajuan yang perlu dievaluasi
    public function index()
    {
        $pendingEvaluations = ProgressReport::with(['proposal.user'])
            ->where('status', 'submitted')
            ->whereDoesntHave('evaluations', function ($q) {
                $q->where('reviewer_id', Auth::id());
            })
            ->latest()
            ->get()
            ->map(function ($report) {
                return [
                    'id_report'        => $report->id,
                    'id_contract'      => $report->contract_id,
                    'judul_penelitian' => $report->proposal->judul_penelitian ?? '-',
                    'nama_dosen'       => $report->user->name ?? '-',
                    'last_reported_at' => $report->report_date,
                    'last_percentage'  => $report->progress_percentage,
                ];
            });

        return Inertia::render('Reviewer/Evaluation/Index', [
            'pendingEvaluations' => $pendingEvaluations,
        ]);
    }

    // Task 12 - showProgress(): lihat detail laporan kemajuan dosen
    public function showProgress(ProgressReport $report)
    {
        $report->load(['proposal.user', 'contract', 'evaluations.reviewer']);

        $allReports = ProgressReport::where('proposal_id', $report->proposal_id)
            ->orderBy('report_date')
            ->get(['id', 'report_date', 'progress_percentage', 'report_type']);

        return Inertia::render('Reviewer/Evaluation/Show', [
            'report'     => $report,
            'allReports' => $allReports,
        ]);
    }
}