<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Http\Requests\Editorial\DeskReviewRequest;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;

/**
 * DecisionController
 *
 * Mengelola keputusan Desk Review: Accept_For_Review atau Desk_Reject
 * pada naskah ilmiah yang masuk ke sistem editorial.
 */
class DecisionController extends Controller
{
    /**
     * Proses keputusan Desk Review.
     *
     * POST /editorial/desk/{submission}/desk-review
     */
    public function deskReview(DeskReviewRequest $request, Submission $submission): RedirectResponse
    {
        $this->authorize('update', $submission);

        if (! $submission->isPending()) {
            return redirect()
                ->back()
                ->with('error', 'Submission ini sudah diproses sebelumnya.');
        }

        $submission->update([
            'status'           => $request->decision,
            'reviewed_at'      => now(),
            'reviewed_by'      => auth()->id(),
            'rejection_reason' => $request->decision === 'Desk_Reject'
                ? $request->rejection_reason
                : null,
            'updated_by'       => auth()->id(),
        ]);

        $message = $request->decision === 'Accept_For_Review'
            ? 'Submission berhasil diterima untuk review.'
            : 'Submission ditolak.';

        return redirect()
            ->back()
            ->with('success', $message);
    }
}
