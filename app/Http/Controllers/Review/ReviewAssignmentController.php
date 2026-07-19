<?php

/**
 * MOCK LOKAL - hapus setelah controller resmi Review Assignment di-merge.
 *
 * Controller untuk perpanjangan due date reviewer assignment pada Proposal.
 *
 * @package App\Http\Controllers\Review
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

