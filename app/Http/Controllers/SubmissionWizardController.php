<?php

/**
 * @file SubmissionWizardController.php
 * @description Controller untuk menangani alur multi-step submission wizard naskah jurnal.
 * @author Haryansyah Dwi Nugroho <@Haryansyah15>
 */

namespace App\Http\Controllers;

use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SubmissionWizardController extends Controller
{
    // ==========================================
    // STEP 1 - VIEW & STORE (Draft DB & License)
    // ==========================================
    
    public function step1()
    {
        return Inertia::render('Submission/Wizard/Step1Start', [
            'journals' => [
                ['id' => 1, 'title' => 'Jurnal Teknologi Informasi (JTI)'],
                ['id' => 2, 'title' => 'Jurnal Rekayasa Perangkat Lunak (RPL)'],
            ],
        ]);
    }

    public function storeStep1(Request $request)
    {
        $validated = $request->validate([
            'journal_id' => 'required|integer',
            'agreement1' => 'required|accepted',
            'agreement2' => 'required|accepted',
            'agreement3' => 'required|accepted',
            'agreement4' => 'required|accepted',
        ], [
            'journal_id.required' => 'Silakan pilih jurnal tujuan terlebih dahulu.',
            'agreement1.accepted' => 'Anda harus menyetujui komitmen ke-1.',
            'agreement2.accepted' => 'Anda harus menyetujui komitmen ke-2.',
            'agreement3.accepted' => 'Anda harus menyetujui komitmen ke-3.',
            'agreement4.accepted' => 'Anda harus menyetujui komitmen ke-4.',
        ]);

        $submission = Submission::updateOrCreate(
            [
                'id' => session('submission_id'),
                'author_id' => Auth::id(),
            ],
            [
                'journal_id' => $validated['journal_id'],
                'title' => 'Draft Submission',
                'status' => 'Draft',
            ]
        );

        session(['submission_id' => $submission->id]);

        return redirect()->route('submission.step2')
            ->with('success', 'Draft submission berhasil disimpan.');
    }

    // ==========================================
    // STEP 2 - VIEW & UPLOAD (Manuscript File)
    // ==========================================

    public function step2()
    {
        $submissionId = session('submission_id');
        if (!$submissionId) {
            return redirect()->route('submission.step1')
                ->with('error', 'Silakan isi Step 1 terlebih dahulu.');
        }

        return Inertia::render('Submission/Wizard/Step2Upload');
    }

    public function step2Upload(Request $request)
    {
        $request->validate([
            'manuscript' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'supplementary_files.*' => 'nullable|file|max:5120',
        ]);

        $submissionId = session('submission_id');
        if (!$submissionId) {
            return redirect()->route('submission.step1')->withErrors(['wizard' => 'Sesi draf tidak ditemukan.']);
        }

        $submission = Submission::find($submissionId);
        if (!$submission) {
            return redirect()->route('submission.step1')->withErrors(['wizard' => 'Draf submission tidak ditemukan.']);
        }

        if ($request->hasFile('manuscript')) {
            $path = $request->file('manuscript')->store('submissions/manuscripts', 'public');
            
            $submission->update([
                'manuscript_path' => $path,
            ]);

            if ($request->hasFile('supplementary_files')) {
                foreach ($request->file('supplementary_files') as $file) {
                    $file->store('submissions/supplementary', 'public');
                }
            }

            return redirect('/submissions/wizard/' . $submission->id . '/step3')
                ->with('success', 'File manuskrip berhasil diunggah.');
        }

        return back()->withErrors(['manuscript' => 'Upload file gagal.']);
    }

    // ==========================================
    // STEP 4 - CONTRIBUTORS
    // ==========================================

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