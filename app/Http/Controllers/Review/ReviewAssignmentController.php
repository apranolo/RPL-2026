<?php

namespace App\Http\Controllers\Review;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReviewerAssignment;
use Illuminate\Support\Facades\Auth;

/**
 * Class ReviewAssignmentController
 * 
 * Mengelola penerimaan dan penolakan undangan review oleh reviewer.
 */
class ReviewAssignmentController extends Controller
{
    /**
     * Reviewer menerima undangan review
     */
    public function accept($id)
    {
        // mencari assignment berdasarkan ID
        $assignment = ReviewerAssignment::findOrFail($id);

        if ($assignment->reviewer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // ubah status menjadi accepted
        $assignment->status = 'accepted';
        $assignment->responded_at = now();
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
        $assignment = ReviewerAssignment::findOrFail($id);

        if ($assignment->reviewer_id !== Auth::id()) {
            abort(403, 'Unauthorized access.');
        }

        // ubah status menjadi declined
        $assignment->status = 'declined';
        $assignment->reason = $request->reason;
        $assignment->responded_at = now();
        $assignment->save();

        return redirect()
            ->back()
            ->with('success', 'Undangan review berhasil ditolak.');
use App\Models\ReviewAssignment;
use Illuminate\Http\Request;

class ReviewAssignmentController extends Controller
{
    /**
     * Memproses pengiriman undangan ke Reviewer.
     */
    public function invite(Request $request)
    {
        // PERBAIKAN 5: Pengecekan Otorisasi (Hanya Editor yang boleh)
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
        // PERBAIKAN 4: Ganti 'Invited' menjadi 'Pending' agar tidak SQL Crash
        ReviewAssignment::create([
            'submission_id' => $validated['submission_id'],
            'reviewer_id'   => $validated['reviewer_id'],
            'round'         => 1,
            'status'        => 'Pending', // <--- SUDAH DIPERBAIKI
            'due_date'      => now()->addDays(7), 
        ]);

        // Catatan: Email notifikasi akan di-handle oleh Event/Observer dari Modul 7.

        // 4. Berikan flash message ke Inertia (Frontend React)
        return back()->with('success', 'Undangan berhasil dikirimkan ke Reviewer.');
    }
}