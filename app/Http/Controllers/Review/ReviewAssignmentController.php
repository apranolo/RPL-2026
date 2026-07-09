<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReviewerAssignment;
use Illuminate\Support\Facades\Auth;

/**
 * Class ReviewAssignmentController
 * 
 * Mengelola penerimaan dan penolakan undangan review oleh reviewer.
 */
class ReviewAssignmentController extends Controller
{
    /**
     * Reviewer menerima undangan review
     */
    public function accept($id)
    {
        // mencari assignment berdasarkan ID
        $assignment = ReviewerAssignment::findOrFail($id);

        if ($assignment->reviewer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // ubah status menjadi accepted
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
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        // mencari assignment berdasarkan ID
        $assignment = ReviewerAssignment::findOrFail($id);

        if ($assignment->reviewer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // ubah status menjadi declined
        $assignment->status = 'declined';
        $assignment->reason = $request->reason;
        $assignment->responded_at = now();
        $assignment->save();

        return redirect()
            ->back()
            ->with('success', 'Undangan review berhasil ditolak.');
    }
}