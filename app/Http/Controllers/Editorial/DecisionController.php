<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DecisionController extends Controller
{
    /**
     * Proses keputusan Desk Review.
     *
     * POST /editorial/desk/{submission}/desk-review
     */
    public function deskReview(
        Request $request,
        Submission $submission
    ): RedirectResponse {
        $validated = $request->validate([
            'decision' => [
                'required',
                'in:Accept_For_Review,Desk_Reject',
            ],
            'rejection_reason' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        // Submission hanya boleh diproses sekali
        if ($submission->status !== 'pending') {
            return redirect()
                ->back()
                ->with(
                    'error',
                    'Submission ini sudah diproses sebelumnya.'
                );
        }

        $submission->update([
            'status' => $validated['decision'],
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'rejection_reason' => $validated['decision'] === 'Desk_Reject'
                    ? $validated['rejection_reason']
                    : null,
        ]);

        $message =
            $validated['decision'] === 'Accept_For_Review'
                ? 'Submission berhasil diterima untuk review.'
                : 'Submission ditolak.';

        return redirect()
            ->back()
            ->with('success', $message);
    }
}
