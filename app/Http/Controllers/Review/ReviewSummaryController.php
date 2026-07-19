<?php

/**
 * MOCK LOKAL - hapus setelah controller resmi Review Summary multi-reviewer di-merge.
 *
 * Controller untuk menampilkan rekapitulasi review multi-reviewer pada Proposal.
 * Mengembalikan halaman Inertia Review/Summary dengan data penugasan reviewer
 * beserta keputusan review (score, recommendation, comment) per assignment.
 *
 * Authorization: Hanya SuperAdmin, AdminKampus, dan PengelolaJurnal yang dapat mengakses.
 *
 * @package App\Http\Controllers\Review
 */

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use App\Models\ReviewerAssignment;
use Inertia\Inertia;
use Inertia\Response;

class ReviewSummaryController extends Controller
{
    /**
     * Display review summary for a given proposal.
     *
     * Mengambil seluruh penugasan reviewer beserta keputusan review
     * dan mengirimkan ke halaman Inertia Review/Summary.
     *
     * @param Proposal $proposal Proposal yang diminta rekap review-nya.
     * @return Response
     */
    public function index(Proposal $proposal): Response
    {
        $this->authorize('viewSummary', $proposal);

        $assignments = ReviewerAssignment::query()
            ->where('proposal_id', $proposal->id)
            ->with(['reviewer', 'reviewDecisions'])
            ->get();

        $assignmentsPayload = $assignments->map(static function (ReviewerAssignment $assignment): array {
            $decision = $assignment->reviewDecisions->first();

            return [
                'id'              => $assignment->id,
                'reviewer_name'   => $assignment->reviewer?->name,
                'due_date'        => optional($assignment->due_date)->format('Y-m-d'),
                'status'          => $assignment->status,
                'score'           => $decision?->score,
                'recommendation'  => $decision?->recommendation,
                'comment'         => $decision?->comment,
            ];
        })->values()->all();

        return Inertia::render('Review/Summary', [
            'proposal' => [
                'id'        => $proposal->id,
                'judul'     => $proposal->judul,
                'deskripsi' => $proposal->deskripsi,
            ],
            'assignments' => $assignmentsPayload,
        ]);
    }
}
