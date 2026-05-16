<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReviewAssignment;

class ReviewAssignmentController extends Controller
{
    /**
     * Reviewer menerima undangan review
     */
    public function accept($id)
    {
        // mencari assignment berdasarkan ID
        $assignment = ReviewAssignment::findOrFail($id);

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
    public function decline($id)
    {
        // mencari assignment berdasarkan ID
        $assignment = ReviewAssignment::findOrFail($id);

        // ubah status menjadi declined
        $assignment->status = 'declined';
        $assignment->responded_at = now();
        $assignment->save();

        return redirect()
            ->back()
            ->with('success', 'Undangan review berhasil ditolak.');
    }
}