<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewAssignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewAssignmentController extends Controller
{
    /**
     * Cancel a review assignment invitation.
     */
    public function cancel(Request $request, ReviewAssignment $assignment): RedirectResponse
    {
        $this->authorize('cancel', $assignment);

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        // Undangan hanya bisa dibatalkan selama masih berstatus 'Invited'
        // (belum direspon reviewer / belum masuk tahap review).
        if ($assignment->status !== 'Invited') {
            return back()->with('error', 'Assignment cannot be cancelled at this stage.');
        }

        $assignment->update([
            'status' => 'Cancelled',
            // Tabel review_assignments belum punya kolom cancel_reason tersendiri,
            // jadi alasan pembatalan disimpan di kolom declined_reason yang sudah ada.
            // TODO: koordinasi dengan Agnes (2300018407) kalau memang perlu kolom
            // cancel_reason terpisah dari declined_reason.
            'declined_reason' => $validated['reason'] ?? null,
        ]);

        // TODO: Send notification to reviewer

        return redirect()
            ->back()
            ->with('success', 'Review assignment has been cancelled.');
    }
}
