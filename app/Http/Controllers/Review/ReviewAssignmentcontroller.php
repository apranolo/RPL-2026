<?php

// Tambahkan method ini ke dalam class ReviewAssignmentController
// Path: app/Http/Controllers/Review/ReviewAssignmentController.php

// Pastikan import ini ada di bagian atas file:
// use Illuminate\Http\RedirectResponse;
// use Illuminate\Http\Request;

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use App\Models\ReviewerAssignment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewAssignmentController extends Controller
{
    /**
     * Cancel a review assignment invitation.
     */
    public function cancel(Request $request, ReviewerAssignment $assignment): RedirectResponse
{
    $this->authorize('cancel', $assignment);

    $validated = $request->validate([
        'reason' => 'nullable|string|max:500',
    ]);

    // Pastikan assignment masih bisa dibatalkan (hanya jika status pending/invited)
    if (! in_array($assignment->status, ['pending', 'invited'])) {
        return back()->with('error', 'Assignment cannot be cancelled at this stage.');
    }

    $assignment->update([
        'status'      => 'cancelled',
        'cancelled_at' => now(),
        'cancel_reason' => $validated['reason'] ?? null,
    ]);

    // TODO: Send notification to reviewer

    return redirect()
        ->back()
        ->with('success', 'Review assignment has been cancelled.');
}

}