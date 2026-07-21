<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditorialDecisionRequest;
use App\Models\EditorialDecision;
use App\Models\JournalAssessment;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
                'in:Accept_For_Review,Desk_Reject,submitted,administrasi_valid,ditolak',
            ],
            'rejection_reason' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $submission->update([
            'status' => $validated['decision'],
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
            'rejection_reason' => $validated['decision'] === 'Desk_Reject' || $validated['decision'] === 'ditolak'
                    ? $validated['rejection_reason']
                    : null,
        ]);

        $message = ($validated['decision'] === 'Accept_For_Review' || $validated['decision'] === 'administrasi_valid')
            ? 'Submission berhasil diterima untuk review.'
            : 'Submission ditolak.';

        return redirect()
            ->back()
            ->with('success', $message);
    }

    /**
     * Handle final editorial decision (Accept / Reject).
     */
    public function finalDecision(
        EditorialDecisionRequest $request,
        JournalAssessment $assessment
    ): RedirectResponse {
        $validated = $request->validated();

        DB::beginTransaction();

        try {
            $payload = [
                'assessment_id' => $assessment->id,
                'decision'      => $validated['decision'],
                'notes'         => $validated['notes'],
            ];

            EditorialDecision::create($payload);

            DB::commit();

            return back()->with(
                'success',
                'Final editorial decision has been validated.'
            );
        } catch (\Throwable $e) {
            DB::rollBack();

            report($e);

            return back()->with(
                'error',
                'Failed to process the editorial decision.'
            );
        }
    }

    public function history($submissionId)
    {
        $history = EditorialDecision::with('editor')
            ->where('submission_id', $submissionId)
            ->orderBy('decided_at', 'desc')
            ->get();

        return response()->json($history);
    }
}
