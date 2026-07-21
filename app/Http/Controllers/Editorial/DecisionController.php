<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditorialDecisionRequest;
use App\Models\EditorialDecision;
use App\Models\JournalAssessment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class DecisionController extends Controller
{
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

            unset($payload);

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
