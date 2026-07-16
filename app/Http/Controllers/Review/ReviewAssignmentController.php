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
     *
     * Route is restricted to the `Pengelola Jurnal` role via middleware
     * (see routes/web.php). Fine-grained per-journal authorization
     * (via a ReviewAssignmentPolicy) is intentionally NOT implemented here
     * since no such policy exists upstream yet; the role-middleware check
     * is considered sufficient for now. If a ReviewAssignmentPolicy is
     * added later by the team, re-add:
     *   $this->authorize('cancel', $assignment);
     *
     * @param  Request  $request  Must include an optional `reason` string.
     * @param  ReviewAssignment  $assignment  The invitation to cancel.
     * @return RedirectResponse  Redirects back with a success/error flash message.
     */
    public function cancel(Request $request, ReviewAssignment $assignment): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        // Undangan hanya bisa dibatalkan selama masih berstatus 'Pending'
        // (belum direspon reviewer / belum masuk tahap review).
        // Status enum per migration 2026_05_14_010000: Pending, Accepted,
        // Declined, Completed, Cancelled.
        if ($assignment->status !== 'Pending') {
            return back()->with('error', 'Assignment cannot be cancelled at this stage.');
        }

        $assignment->update([
            'status' => 'Cancelled',
            // Tabel review_assignments tidak punya kolom cancel_reason
            // tersendiri, jadi alasan pembatalan disimpan di kolom
            // decline_reason yang sudah ada (lihat migration).
            'decline_reason' => $validated['reason'] ?? null,
        ]);

        // TODO: Send notification to reviewer

        return redirect()
            ->back()
            ->with('success', 'Review assignment has been cancelled.');
    }
}