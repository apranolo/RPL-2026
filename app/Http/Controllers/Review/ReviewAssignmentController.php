<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReviewAssignment;
use App\Models\ReviewerAssignment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;

/**
 * Class ReviewAssignmentController
 *
 * Mengelola penerimaan dan penolakan undangan review oleh reviewer,
 * serta pengiriman undangan ke reviewer oleh editor.
 * Menggunakan model ReviewAssignment yang terhubung ke Submission (naskah ilmiah).
 */
class ReviewAssignmentController extends Controller
{
    /**
     * Reviewer menerima undangan review
     */
    public function accept($id)
    {
        // mencari assignment berdasarkan ID
        $assignment = ReviewAssignment::findOrFail($id);

        if ($assignment->reviewer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // ubah status menjadi accepted
        $assignment->status = 'Accepted';
        $assignment->save();

        return redirect()
            ->back()
            ->with('success', 'Undangan review berhasil diterima.');
    }

    /**
     * Reviewer menolak undangan review
     */
    public function decline(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        // mencari assignment berdasarkan ID
        $assignment = ReviewAssignment::findOrFail($id);

        if ($assignment->reviewer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // ubah status menjadi declined
        $assignment->status = 'Declined';
        $assignment->decline_reason = $request->reason;
        $assignment->save();

        return redirect()
            ->back()
            ->with('success', 'Undangan review berhasil ditolak.');
    }

    /**
     * Memproses pengiriman undangan ke Reviewer.
     */
    public function invite(Request $request)
    {
        // Pengecekan Otorisasi (Hanya Editor yang boleh)
        if (!auth()->user()->hasRole('Editor')) {
            abort(403, 'Akses ditolak: Hanya Editor yang berhak mengundang Reviewer.');
        }

        // 1. Validasi Input Keamanan
        $validated = $request->validate([
            'submission_id' => 'required|exists:submissions,id',
            'reviewer_id'   => 'required|exists:users,id',
        ]);

        // 2. Pencegahan Duplikasi Undangan
        $isAlreadyInvited = ReviewAssignment::where('submission_id', $validated['submission_id'])
            ->where('reviewer_id', $validated['reviewer_id'])
            ->where('round', 1) // Default saat ini adalah ronde 1
            ->exists();

        if ($isAlreadyInvited) {
            // Jika sudah diundang, batalkan dan beri tahu Editor
            return back()->withErrors(['message' => 'Reviewer tersebut sudah diundang untuk naskah ini pada ronde yang sama.']);
        }

        // 3. Simpan Data (SLA 7 Hari)
        ReviewAssignment::create([
            'submission_id' => $validated['submission_id'],
            'reviewer_id'   => $validated['reviewer_id'],
            'round'         => 1,
            'status'        => 'Pending',
            'due_date'      => now()->addDays(7),
        ]);

        // Catatan: Email notifikasi akan di-handle oleh Event/Observer dari Modul 7.

        // 4. Berikan flash message ke Inertia (Frontend React)
        return back()->with('success', 'Undangan berhasil dikirimkan ke Reviewer.');
    }

    /**
     * Extend due date for a reviewer assignment.
     *
     * Memvalidasi input dan memperbarui kolom due_date pada
     * reviewer_assignments untuk assignment yang diberikan.
     *
     * @param  Request             $request
     * @param  ReviewerAssignment  $reviewerAssignment
     * @return RedirectResponse
     */
    public function extendDue(Request $request, ReviewerAssignment $reviewerAssignment): RedirectResponse
    {
        $this->authorize('extendDueDate', $reviewerAssignment->proposal);

        $validated = $request->validate([
            'due_date' => ['required', 'date', 'after:today'],
        ]);

        $reviewerAssignment->update([
            'due_date' => $validated['due_date'],
        ]);

        return redirect()->back()->with('success', 'Due date berhasil diperpanjang.');
    }
}