<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProposalRequest;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProposalController extends Controller
{
    /**
     * Display a listing of the resource for authenticated Dosen.
     */
    public function index(Request $request): Response
    {
        $query = Proposal::query()
            ->with(['researchSchema:id,name', 'user:id,name,email'])
            ->where('user_id', auth()->id());

        if ($request->filled('search')) {
            $query->where('title', 'like', '%'.$request->search.'%');
        }

        if ($request->filled('status')) {
            $query->where('status_proposal', $request->status);
        }

        $proposals = $query
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Proposal/Index', [
            'proposals' => $proposals,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $schemas = ResearchSchema::select('id', 'name', 'description')->get();

        return Inertia::render('Proposal/Create', [
            'schemas' => $schemas,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProposalRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $action = $request->input('action', 'submit');

        $filePath = null;
        if ($request->hasFile('file_dokumen_proposal')) {
            $file = $request->file('file_dokumen_proposal');
            $fileName = time().'_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
            $filePath = $file->storeAs('proposal_documents', $fileName, 'public');
        }

        $status = ($action === 'draft') ? Proposal::STATUS_DRAFT : Proposal::STATUS_SUBMITTED;

        $proposal = Proposal::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'user_id' => auth()->id(),
            'research_schema_id' => $validated['research_schema_id'],
            'status_proposal' => $status,
            'file_dokumen_proposal' => $filePath,
        ]);

        $message = ($action === 'draft')
            ? 'Proposal berhasil disimpan sebagai draf.'
            : 'Proposal berhasil diajukan dan menunggu verifikasi admin.';

        return redirect()->route('proposal.index')
            ->with('success', $message);
    }

    /**
     * Display the specified resource.
     */
    public function show(Proposal $proposal): Response
    {
        $this->authorize('view', $proposal);

        $proposal->load(['user:id,name,email', 'researchSchema:id,name,description', 'documents']);

        return Inertia::render('Proposal/Show', [
            'proposal' => $proposal,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Proposal $proposal): Response
    {
        $this->authorize('update', $proposal);

        $schemas = ResearchSchema::select('id', 'name', 'description')->get();

        return Inertia::render('Proposal/Edit', [
            'proposal' => $proposal,
            'schemas' => $schemas,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Proposal $proposal): RedirectResponse
    {
        $this->authorize('update', $proposal);

        $action = $request->input('action', 'submit');
        $isSubmit = ($action === 'submit');

        $title = $request->input('title') ?? $request->input('judul');
        $description = $request->input('description') ?? $request->input('deskripsi');

        $rules = [
            'title' => 'required_without:judul|nullable|string|max:255',
            'judul' => 'required_without:title|nullable|string|max:255',
            'description' => 'required_without:deskripsi|nullable|string',
            'deskripsi' => 'required_without:description|nullable|string',
            'research_schema_id' => 'nullable|exists:research_schemas,id',
            'action' => 'nullable|string|in:draft,submit',
            'file_dokumen_proposal' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ];

        if ($isSubmit && ! $proposal->file_dokumen_proposal) {
            $rules['file_dokumen_proposal'] = 'required|file|mimes:pdf,doc,docx|max:10240';
        }

        $request->validate($rules, [
            'file_dokumen_proposal.required' => 'Dokumen proposal wajib diunggah saat mengajukan proposal.',
        ]);

        $filePath = $proposal->file_dokumen_proposal;
        if ($request->hasFile('file_dokumen_proposal')) {
            if ($proposal->file_dokumen_proposal) {
                Storage::disk('public')->delete($proposal->file_dokumen_proposal);
            }
            $file = $request->file('file_dokumen_proposal');
            $fileName = time().'_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
            $filePath = $file->storeAs('proposal_documents', $fileName, 'public');
        }

        $status = ($action === 'draft') ? Proposal::STATUS_DRAFT : Proposal::STATUS_SUBMITTED;

        $proposal->update([
            'title' => $title,
            'description' => $description,
            'research_schema_id' => $request->input('research_schema_id', $proposal->research_schema_id),
            'status_proposal' => $status,
            'file_dokumen_proposal' => $filePath,
        ]);

        $message = ($action === 'draft')
            ? 'Proposal berhasil disimpan sebagai draf.'
            : 'Proposal berhasil diajukan dan menunggu verifikasi admin.';

        return redirect()->route('proposal.index')
            ->with('success', $message);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Proposal $proposal): RedirectResponse
    {
        $this->authorize('delete', $proposal);

        if ($proposal->file_dokumen_proposal) {
            Storage::disk('public')->delete($proposal->file_dokumen_proposal);
        }

        $proposal->delete();

        return redirect()->route('proposal.index')
            ->with('success', 'Proposal berhasil dihapus');
    }

    /**
     * Download the specified proposal document.
     */
    public function downloadDocument($id)
    {
        $proposal = Proposal::find($id);
        $filePath = null;

        if (! $proposal) {
            $document = \App\Models\ProposalDocument::findOrFail($id);
            $proposal = $document->proposal;
            $filePath = $document->file_path;
        } else {
            $filePath = $proposal->file_dokumen_proposal;
        }

        $this->authorize('view', $proposal);

        if (! $filePath || ! Storage::disk('public')->exists($filePath)) {
            abort(404, 'Dokumen proposal tidak ditemukan.');
        }

        return Storage::disk('public')->download($filePath);
    }
}
