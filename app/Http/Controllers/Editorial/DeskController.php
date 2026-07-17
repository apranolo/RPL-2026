<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Http\Requests\Editorial\AssignEditorRequest;
use App\Models\EditorialAssignment;
use App\Models\Role;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * DeskController
 *
 * Mengelola tampilan dan penugasan Section Editor
 * pada tahap Desk Review naskah ilmiah.
 */
class DeskController extends Controller
{
    /**
     * Tampilkan halaman Desk Review beserta data submission dan daftar editor.
     *
     * GET /editorial/desk/{submission}/review
     */
    public function show(Submission $submission): Response
{
    $editors = User::select('id', 'name', 'email')
        ->where('is_reviewer', true)
        ->whereNull('deleted_at')
        ->get();

    return Inertia::render('Editorial/Desk/DeskReview', [
        'submission' => $submission->load('journal', 'author'),
        'editors'    => $editors,
    ]);
}
    /**
     * Tugaskan Section Editor ke submission.
     *
     * POST /editorial/desk/{submission}/assign-editor
     */
    public function assignEditor(AssignEditorRequest $request, Submission $submission): RedirectResponse
    {
        //$this->authorize('update', $submission);

        $alreadyAssigned = EditorialAssignment::where('submission_id', $submission->id)
            ->where('editor_id', $request->editor_id)
            ->exists();

        if ($alreadyAssigned) {
            return redirect()
                ->back()
                ->withErrors(['editor_id' => 'Section Editor ini sudah ditugaskan ke submission tersebut.']);
        }

        EditorialAssignment::create([
            'editor_id'     => $request->editor_id,
            'submission_id' => $submission->id,
            'assigned_by'   => auth()->id(),
            'assigned_at'   => now(),
            'status'        => 'assigned',
        ]);

        return redirect()
            ->back()
            ->with('success', 'Section Editor berhasil ditugaskan.');
    }
}