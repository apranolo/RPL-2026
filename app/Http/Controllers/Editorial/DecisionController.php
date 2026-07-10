<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditorialDecisionRequest;
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
            /*
            |--------------------------------------------------------------------------
            | Editorial Workflow Scaffold
            |--------------------------------------------------------------------------
            |
            | Waiting for Submission module (Modul 2 Kelas G) to be merged into
            | development. After the Submission model becomes available, this
            | workflow will:
            |
            | - Save final editorial decision
            | - Save editorial notes
            | - Update submission status
            | - Store decision history
            | - Dispatch notifications
            |
            */

            // Keep validated payload available for future implementation.
            $payload = [
                'assessment_id' => $assessment->id,
                'decision'      => $validated['decision'],
                'notes'         => $validated['notes'],
            ];

            // Placeholder to indicate payload has been prepared.
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
}
