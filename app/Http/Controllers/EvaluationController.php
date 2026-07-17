<?php

namespace App\Http\Controllers;

use App\Models\ProgressReport;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    /**
     * Task 10 - index(): Menampilkan daftar laporan kemajuan
     * yang perlu dievaluasi oleh reviewer yang sedang login.
     * Hanya laporan dari proposal yang ditugaskan ke reviewer ini.
     */
    public function index()
    {
        $reviewerId = Auth::id();

        // Ambil proposal_id yang ditugaskan ke reviewer ini
        $assignedProposalIds = Review::where('reviewer_id', $reviewerId)
            ->pluck('proposal_id');

        $pendingEvaluations = ProgressReport::with(['proposal.user'])
            ->where('status', 'submitted')
            ->whereIn('proposal_id', $assignedProposalIds)
            ->whereDoesntHave('evaluations', function ($q) use ($reviewerId) {
                $q->where('reviewer_id', $reviewerId);
            })
            ->latest()
            ->get()
            ->map(function ($report) {
                return [
                    'id_report' => $report->id,
                    'id_contract' => $report->contract_id,
                    'judul_penelitian' => $report->proposal->judul ?? '-',
                    'nama_dosen' => $report->proposal->user->name ?? '-',
                    'last_reported_at' => $report->report_date,
                    'last_percentage' => $report->progress_percentage,
                ];
            });

        return Inertia::render('Reviewer/Evaluation/Index', [
            'pendingEvaluations' => $pendingEvaluations,
        ]);
    }

    /**
     * Task 12 - showProgress(): Menampilkan detail laporan kemajuan dosen.
     * Hanya reviewer yang ditugaskan ke proposal tersebut yang bisa akses.
     */
    public function showProgress(ProgressReport $report)
    {
        $reviewerId = Auth::id();

        // Otorisasi: pastikan reviewer ditugaskan ke proposal ini
        $isAssigned = Review::where('reviewer_id', $reviewerId)
            ->where('proposal_id', $report->proposal_id)
            ->exists();

        if (! $isAssigned) {
            abort(403, 'Anda tidak memiliki akses ke laporan ini.');
        }

        $report->load(['proposal.user', 'contract', 'evaluations.reviewer']);

        $allReports = ProgressReport::where('proposal_id', $report->proposal_id)
            ->orderBy('report_date')
            ->get(['id', 'report_date', 'progress_percentage', 'report_type']);

        return Inertia::render('Reviewer/Evaluation/Show', [
            'report' => $report,
            'allReports' => $allReports,
        ]);
    }
}
