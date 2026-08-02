<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PembinaanReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AssignController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        if (! $user->isSuperAdmin() && ! $user->isAdminKampus()) {
            abort(403);
        }

        $proposals = \App\Models\Proposal::whereIn('status_proposal', [
            \App\Models\Proposal::STATUS_ADMINISTRASI_VALID,
            \App\Models\Proposal::STATUS_SUBMITTED,
            'Submitted',
            'Administrasi_Valid',
        ])
        ->select('id', 'title')
        ->get();

        $reviewerRole = \App\Models\Role::where('name', \App\Models\Role::REVIEWER)->first();

        $reviewersQuery = \App\Models\User::query();
        if ($reviewerRole) {
            $reviewersQuery->where(function ($q) use ($reviewerRole) {
                $q->where('role_id', $reviewerRole->id)
                  ->orWhereHas('roles', fn ($r) => $r->where('name', \App\Models\Role::REVIEWER));
            });
        }

        $reviewers = $reviewersQuery->select('id', 'name')->get();

        return \Inertia\Inertia::render('Admin/Reviewer/Assign', [
            'proposals' => $proposals,
            'reviewers' => $reviewers,
            'selectedProposalId' => $request->query('proposal_id'),
        ]);
    }

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

        \App\Models\Review::create([
            'proposal_id' => $validated['proposal_id'],
            'reviewer_id' => $validated['reviewer_id'],
        ]);

        return redirect()->route('admin.proposals.index')->with(
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

        $review = \App\Models\Review::findOrFail($id);

        $review->delete();

        return back()->with(
            'success',
            'Penunjukan reviewer berhasil dihapus.'
        );
    }
}
