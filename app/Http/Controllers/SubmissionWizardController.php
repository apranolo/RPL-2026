<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SubmissionWizardController extends Controller
{
    /**
     * Display Step 4 (Contributors) of the submission wizard.
     */
    public function step4($id)
    {
        $submission = Submission::with('contributors')->findOrFail($id);

        if ($submission->author_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Submission/Wizard/Step4Contributors', [
            'submission' => $submission,
        ]);
    }

    /**
     * Save the contributors data and proceed to the next step.
     */
    public function saveStep4(Request $request, $id)
    {
        $submission = Submission::findOrFail($id);

        if ($submission->author_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'contributors' => 'nullable|array',
            'contributors.*.name' => 'required|string|max:255',
            'contributors.*.email' => 'required|email|max:255',
            'contributors.*.affiliation' => 'required|string|max:255',
            'contributors.*.is_corresponding' => 'required|boolean',
        ]);

        DB::transaction(function () use ($submission, $validated) {
            $submission->contributors()->delete();

            if (! empty($validated['contributors'])) {
                foreach ($validated['contributors'] as $contributorData) {
                    $submission->contributors()->create([
                        'name' => $contributorData['name'],
                        'email' => $contributorData['email'],
                        'affiliation' => $contributorData['affiliation'],
                        'is_corresponding' => $contributorData['is_corresponding'],
                    ]);
                }
            }
        });

        if ($request->input('action') === 'draft') {
            return redirect()->back()->with('success', 'Draft saved successfully.');
        }

        return redirect('/submissions/wizard/'.$submission->id.'/step5');
    }
}
