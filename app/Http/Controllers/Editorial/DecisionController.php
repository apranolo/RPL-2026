<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Http\Requests\EditorialDecisionRequest;
use App\Models\EditorialDecision;
use App\Models\Submission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class DecisionController extends Controller
{
    /**
     * Handle final editorial decision.
     */
        public function finalDecision(EditorialDecisionRequest $request, Submission $submission): RedirectResponse 
        {
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

            $payload = [
                'submission_id' => $submission->id,
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