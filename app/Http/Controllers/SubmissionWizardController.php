<?php

namespace App\Http\Controllers;

use App\Http\Requests\FinalSubmitRequest;
use App\Models\Submission;
use App\Models\SubmissionContributor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubmissionWizardController extends Controller
{
    /**
     * Display the Wizard Step 5 — Confirm & Review page.
     *
     * Loads the submission data collected in steps 1-4 so the user
     * can review everything before final submission.
     *
     * @route GET /user/submission-wizard/{submission}/confirm
     */
    public function confirm(Request $request, Submission $submission)
    {
        // Ensure the submission belongs to the current user
        if ($submission->author_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only draft submissions can go through the wizard
        if ($submission->status !== 'Draft') {
            return redirect()->route('user.profil.index')
                ->withErrors(['error' => 'Submission yang sudah dikirim tidak dapat diubah.']);
        }

        // Eager-load relationships needed for confirmation summary
        $submission->load(['journal', 'contributors', 'files']);

        return Inertia::render('Submission/Wizard/Step5Confirm', [
            'submission' => $submission,
        ]);
    }

    /**
     * Handle the final submission from Wizard Step 5.
     *
     * Validates completion and marks the submission as Submitted.
     *
     * @route POST /user/submission-wizard/{submission}/final-submit
     */
    public function finalSubmit(FinalSubmitRequest $request, Submission $submission)
    {
        // Ensure the submission belongs to the current user
        if ($submission->author_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only draft submissions can be submitted
        if ($submission->status !== 'Draft') {
            return redirect()->route('user.profil.index')
                ->withErrors(['error' => 'Submission yang sudah dikirim tidak dapat diubah.']);
        }

        $submission->update([
            'status' => 'Submitted'
        ]);

        return redirect()->route('user.profil.index')
            ->with('success', 'Naskah ilmiah berhasil diajukan dan sedang mengantre di meja editor!');
    }
}
