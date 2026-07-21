<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PembinaanReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AssignController extends Controller
{
    public function assign(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if (! $user->isSuperAdmin() && ! $user->isAdminKampus()) {
            abort(403);
        }

        $validated = $request->validate([
            'proposal_id' => 'required|integer',
            'reviewer_id' => 'required|integer',
        ]);

        PembinaanReview::create([
            'proposal_id' => $validated['proposal_id'],
            'reviewer_id' => $validated['reviewer_id'],
        ]);

        return back()->with(
            'success',
            'Reviewer berhasil ditugaskan.'
        );
    }

    public function unassign(int $id): RedirectResponse
    {
        $user = auth()->user();

        if (! $user->isSuperAdmin() && ! $user->isAdminKampus()) {
            abort(403);
        }

        $review = PembinaanReview::findOrFail($id);

        $review->delete();

        return back()->with(
            'success',
            'Penunjukan reviewer berhasil dihapus.'
        );
    }
}
