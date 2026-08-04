<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin\ProposalController — Super Admin
 *
 * Mengelola verifikasi administrasi proposal penelitian untuk peran Super Admin.
 * Super Admin dapat melihat semua proposal, menyetujui (Administrasi_Valid),
 * dan menolak (Ditolak) proposal yang berstatus Submitted.
 *
 * @route GET  /admin/proposals                     → index
 * @route POST /admin/proposals/{proposal}/approve  → approve
 * @route POST /admin/proposals/{proposal}/reject   → reject
 */
class ProposalController extends Controller
{
    /**
     * Tampilkan daftar semua proposal penelitian.
     *
     * @route GET /admin/proposals
     *
     * @features List semua proposal, search by title, filter by status, pagination
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Proposal::class);

        $query = Proposal::query()
            ->with([
                'user:id,name,email,university_id',
                'researchSchema:id,name',
                'reviews.reviewer:id,name',
            ]);

        if ($request->user()->isAdminKampus()) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('university_id', $request->user()->university_id);
            });
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        if ($request->filled('status')) {
            $query->where('status_proposal', $request->status);
        }

        $proposals = $query
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($proposal) => [
                'id' => $proposal->id,
                'title' => $proposal->title,
                'description' => $proposal->description,
                'status_proposal' => $proposal->status_proposal,
                'rejection_reason' => $proposal->rejection_reason,
                'file_dokumen_proposal' => $proposal->file_dokumen_proposal,
                'has_reviewer' => $proposal->reviews->isNotEmpty(),
                'reviews' => $proposal->reviews->map(fn ($r) => [
                    'id' => $r->id,
                    'reviewer_id' => $r->reviewer_id,
                    'reviewer_name' => $r->reviewer?->name,
                ])->values(),
                'reviewers' => $proposal->reviews->map(fn ($r) => [
                    'id' => $r->reviewer?->id,
                    'name' => $r->reviewer?->name,
                ])->filter(fn ($r) => ! empty($r['name']))->values(),
                'user' => $proposal->user ? [
                    'id' => $proposal->user->id,
                    'name' => $proposal->user->name,
                    'email' => $proposal->user->email,
                ] : null,
                'research_schema' => $proposal->researchSchema ? [
                    'id' => $proposal->researchSchema->id,
                    'name' => $proposal->researchSchema->name,
                ] : null,
                'created_at' => $proposal->created_at->format('Y-m-d'),
            ]);

        $statusOptions = collect([
            ['value' => Proposal::STATUS_DRAFT,              'label' => 'Draft'],
            ['value' => Proposal::STATUS_SUBMITTED,          'label' => 'Submitted'],
            ['value' => Proposal::STATUS_ADMINISTRASI_VALID, 'label' => 'Valid Administrasi'],
            ['value' => Proposal::STATUS_DITOLAK,            'label' => 'Ditolak'],
        ]);

        return Inertia::render('Admin/Proposal/Index', [
            'proposals' => $proposals,
            'filters' => $request->only(['search', 'status']),
            'statusOptions' => $statusOptions,
        ]);
    }

    /**
     * Tampilkan detail proposal penelitian (Show/Detail view).
     *
     * @route GET /admin/proposals/{proposal}
     */
    public function show(Proposal $proposal): Response
    {
        $this->authorize('view', $proposal);

        $proposal->load([
            'user:id,name,email,university_id',
            'user.university:id,name',
            'researchSchema:id,name,description,max_funding',
            'reviews.reviewer:id,name,email',
            'documents',
        ]);

        $reviewerRole = \App\Models\Role::where('name', \App\Models\Role::REVIEWER)->first();

        $reviewersQuery = \App\Models\User::query();
        if ($reviewerRole) {
            $reviewersQuery->where(function ($q) use ($reviewerRole) {
                $q->where('role_id', $reviewerRole->id)
                    ->orWhereHas('roles', fn ($r) => $r->where('name', \App\Models\Role::REVIEWER));
            });
        }
        $availableReviewers = $reviewersQuery->select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Proposal/Show', [
            'proposal' => [
                'id' => $proposal->id,
                'title' => $proposal->title,
                'description' => $proposal->description,
                'status_proposal' => $proposal->status_proposal,
                'rejection_reason' => $proposal->rejection_reason,
                'file_dokumen_proposal' => $proposal->file_dokumen_proposal,
                'created_at' => $proposal->created_at->format('Y-m-d H:i'),
                'updated_at' => $proposal->updated_at->format('Y-m-d H:i'),
                'user' => $proposal->user ? [
                    'id' => $proposal->user->id,
                    'name' => $proposal->user->name,
                    'email' => $proposal->user->email,
                    'university' => $proposal->user->university?->name,
                ] : null,
                'research_schema' => $proposal->researchSchema ? [
                    'id' => $proposal->researchSchema->id,
                    'name' => $proposal->researchSchema->name,
                    'description' => $proposal->researchSchema->description,
                    'max_funding' => $proposal->researchSchema->max_funding,
                ] : null,
                'documents' => $proposal->documents ?? [],
                'reviews' => $proposal->reviews->map(fn ($r) => [
                    'id' => $r->id,
                    'proposal_id' => $r->proposal_id,
                    'reviewer_id' => $r->reviewer_id,
                    'reviewed_at' => $r->reviewed_at?->format('Y-m-d H:i'),
                    'score' => $r->score,
                    'feedback' => $r->feedback,
                    'reviewer' => $r->reviewer ? [
                        'id' => $r->reviewer->id,
                        'name' => $r->reviewer->name,
                        'email' => $r->reviewer->email,
                    ] : null,
                ])->values(),
            ],
            'availableReviewers' => $availableReviewers,
        ]);
    }

    /**
     * Setujui proposal (validasi administrasi).
     *
     * @route POST /admin/proposals/{proposal}/approve
     */
    public function approve(Request $request, Proposal $proposal): RedirectResponse
    {
        $this->authorize('approve', $proposal);

        $proposal->update([
            'status_proposal' => Proposal::STATUS_ADMINISTRASI_VALID,
            'rejection_reason' => null,
        ]);

        return redirect()
            ->route('admin.proposals.index')
            ->with('success', "Proposal \"{$proposal->title}\" berhasil divalidasi.");
    }

    /**
     * Tolak proposal dengan alasan penolakan.
     *
     * @route POST /admin/proposals/{proposal}/reject
     */
    public function reject(Request $request, Proposal $proposal): RedirectResponse
    {
        $this->authorize('reject', $proposal);

        $request->validate([
            'rejection_reason' => ['required', 'string', 'min:10', 'max:500'],
        ], [
            'rejection_reason.required' => 'Alasan penolakan harus diisi.',
            'rejection_reason.min' => 'Alasan penolakan minimal 10 karakter.',
            'rejection_reason.max' => 'Alasan penolakan maksimal 500 karakter.',
        ]);

        $proposal->update([
            'status_proposal' => Proposal::STATUS_DITOLAK,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return redirect()
            ->route('admin.proposals.index')
            ->with('success', "Proposal \"{$proposal->title}\" telah ditolak.");
    }
}
