<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\PembinaanRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DecisionController extends Controller
{
    /**
     * Proses keputusan Desk Review: AcceptForReview atau DeskReject.
     *
     * POST /editorial/desk/{registration}/desk-review
     */
    public function deskReview(Request $request, PembinaanRegistration $registration): RedirectResponse
    {
        // Validasi
        $validated = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            // Catatan wajib diisi jika keputusannya reject
            'rejection_reason' => [
                'nullable',
                'string',
                'max:1000',
                $request->decision === 'rejected' ? 'required' : 'nullable',
            ],
        ], [
            'decision.required'          => 'Keputusan desk review wajib dipilih.',
            'decision.in'                => 'Keputusan tidak valid.',
            'rejection_reason.required'  => 'Catatan penolakan wajib diisi jika submission ditolak.',
            'rejection_reason.max'       => 'Catatan penolakan maksimal 1000 karakter.',
        ]);

        // Pastikan registration masih berstatus pending
        if ($registration->status !== 'pending') {
            return redirect()
                ->back()
                ->with('error', 'Submission ini sudah diproses sebelumnya.');
        }

        // Update status registration
        $registration->update([
            'status'           => $validated['decision'],
            'reviewed_at'      => now(),
            'reviewed_by'      => auth()->id(),
            'rejection_reason' => $validated['decision'] === 'rejected'
                ? $validated['rejection_reason']
                : null,
            'updated_by'       => auth()->id(),
        ]);

        $message = $validated['decision'] === 'approved'
            ? 'Submission berhasil diterima untuk review.'
            : 'Submission ditolak.';

        return redirect()
            ->back()
            ->with('success', $message);
    }
}