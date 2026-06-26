<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\EditorialAssignment;
use App\Models\PembinaanRegistration;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DeskController extends Controller
{
    /**
     * Tampilkan halaman Desk Review.
     *
     * GET /editorial/desk/{registration}/review
     */
    public function show(PembinaanRegistration $registration): Response
    {
        return Inertia::render('Editorial/Desk/DeskReview', [
            'registration' => $registration->load('journal', 'user'),
            'editors'      => User::select('id', 'name', 'email')->get(),
        ]);
    }

    /**
     * Assign a Section Editor to a registration (submission).
     *
     * POST /editorial/desk/{registration}/assign-editor
     */
    public function assignEditor(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        $validated = $request->validate([
            'editor_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $alreadyAssigned = EditorialAssignment::where('registration_id', $registration->id)
            ->where('editor_id', $validated['editor_id'])
            ->exists();

        if ($alreadyAssigned) {
            throw ValidationException::withMessages([
                'editor_id' => 'Section Editor ini sudah ditugaskan ke submission tersebut.',
            ]);
        }

        EditorialAssignment::create([
            'editor_id'       => $validated['editor_id'],
            'registration_id' => $registration->id,
            'assigned_by'     => auth()->id(),
            'assigned_at'     => now(),
            'status'          => 'assigned',
        ]);

        return redirect()
            ->back()
            ->with('success', 'Section Editor berhasil ditugaskan.');
    }
}