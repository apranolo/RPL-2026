<?php

namespace App\Http\Controllers;

use App\Models\PembinaanReview;
use App\Models\ProgressReport;
use App\Models\Review;
use App\Models\ReviewerAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EvaluationController extends Controller
{
    /**
     * Task 10 - index(): Menampilkan daftar laporan kemajuan
     * yang perlu dievaluasi oleh reviewer yang sedang login.
     * Hanya laporan dari proposal yang ditugaskan ke reviewer ini.
     */
    public function assignmentIndex()
    {
        $assignments = ReviewerAssignment::with([
            'registration.journal.university',
            'registration.pembinaan',
        ])
            ->where('reviewer_id', Auth::id())
            ->latest()
            ->paginate(10); // Using paginate or get based on frontend expectation. Based on earlier look, user's frontend used assignments.data which implies pagination.

        return Inertia::render('Reviewer/Evaluation/AssignmentIndex', [
            'assignments' => $assignments,
        ]);
    }

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

    /**
     * Show evaluation note input form.
     */
    public function note(ReviewerAssignment $assignment)
    {
        abort_if($assignment->reviewer_id !== Auth::id(), 403);

        $assignment->load([
            'registration.journal.university',
            'registration.journal.scientificField',
            'registration.pembinaan',
            'registration.reviewerAssignments.reviewer',
        ]);

        $existingReview = PembinaanReview::where('registration_id', $assignment->registration_id)
            ->where('reviewer_id', Auth::id())
            ->first();

        return Inertia::render('Reviewer/Evaluation/Note', [
            'assignment' => $assignment,
            'existingReview' => $existingReview,
        ]);
    }

    /**
     * Submit/save evaluation note.
     */
    public function storeNote(Request $request, ReviewerAssignment $assignment)
    {
        abort_if($assignment->reviewer_id !== Auth::id(), 403);

        $validated = $request->validate([
            'score' => 'nullable|numeric|min:0|max:100',
            'feedback' => 'required|string|max:2000',
            'recommendation' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($assignment, $validated) {
            PembinaanReview::updateOrCreate(
                [
                    'registration_id' => $assignment->registration_id,
                    'reviewer_id' => Auth::id(),
                ],
                [
                    'score' => $validated['score'] ?? null,
                    'feedback' => $validated['feedback'],
                    'recommendation' => $validated['recommendation'] ?? null,
                    'reviewed_at' => now(),
                ]
            );

            // Update assignment status to completed
            $assignment->status = 'completed';
            $assignment->save();

            // Update registration review_status to review_selesai
            $registration = $assignment->registration;
            if ($registration) {
                $registration->review_status = 'review_selesai';
                $registration->save();
            }
        });

        return redirect()
            ->route('reviewer.evaluations.note', $assignment->id)
            ->with('success', 'Catatan evaluasi berhasil disimpan.');
    }

    /**
     * Update status Monev.
     */
    public function updateStatus(Request $request, ReviewerAssignment $assignment)
    {
        abort_if($assignment->reviewer_id !== Auth::id(), 403);

        $validated = $request->validate([
            'review_status' => 'required|in:menunggu_reviewer,sedang_direview,review_selesai,ditolak',
        ]);

        DB::transaction(function () use ($assignment, $validated) {
            $registration = $assignment->registration;
            if ($registration) {
                $registration->review_status = $validated['review_status'];
                $registration->save();
            }

            // Sync assignment status
            if ($validated['review_status'] === 'sedang_direview') {
                $assignment->status = 'in_progress';
            } elseif ($validated['review_status'] === 'menunggu_reviewer') {
                $assignment->status = 'assigned';
            } elseif (in_array($validated['review_status'], ['review_selesai', 'ditolak'])) {
                $assignment->status = 'completed';
            }
            $assignment->save();
        });

        return redirect()
            ->route('reviewer.evaluations.note', $assignment->id)
            ->with('success', 'Status Monev berhasil diperbarui.');
    }
}
