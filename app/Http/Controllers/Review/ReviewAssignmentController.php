<?php

/**
 * Controller untuk perpanjangan due date reviewer assignment pada Proposal.
 *
 * Authorization: Hanya SuperAdmin, AdminKampus, dan PengelolaJurnal
 * yang dapat memperpanjang due date via ProposalPolicy::extendDueDate.
 */

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewerAssignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewAssignmentController extends Controller
{
    /**
     * Extend due date for a reviewer assignment.
     *
     * Memvalidasi input dan memperbarui kolom due_date pada
     * reviewer_assignments untuk assignment yang diberikan.
     */
    public function extendDue(Request $request, ReviewerAssignment $reviewerAssignment): RedirectResponse
    {
        $this->authorize('extendDueDate', $reviewerAssignment->proposal);

        $validated = $request->validate([
            'due_date' => ['required', 'date', 'after:today'],
        ]);

        $reviewerAssignment->update([
            'due_date' => $validated['due_date'],
        ]);

        return redirect()->back()->with('success', 'Due date berhasil diperpanjang.');
    }
}
