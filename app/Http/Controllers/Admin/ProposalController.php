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
