<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewAssignment;
use Illuminate\Http\Request;

class ReviewAssignmentController extends Controller
{
    /**
     * Reviewer menerima undangan review
     */
    public function accept(Request $request, $id)
    {
        $assignment = ReviewAssignment::findOrFail($id);

        $assignment->status = 'accepted';
        $assignment->responded_at = now();
        $assignment->save();

        return redirect()
            ->back()
            ->with('success', 'Undangan review berhasil diterima.');
    }

    /**
     * Reviewer menolak undangan review
     */
    public function decline(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $assignment = ReviewAssignment::findOrFail($id);

        $assignment->status = 'declined';
        $assignment->responded_at = now();
        $assignment->rejection_reason = $validated['reason'];
        $assignment->save();

        return redirect()
            ->back()
            ->with('success', 'Undangan review berhasil ditolak.');
    }
}
