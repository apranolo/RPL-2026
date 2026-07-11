<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProposalController extends Controller
{
    /**
     * Display a listing of the resource.
     * TODO: Implement full proposal listing with pagination and filters.
     */
    public function index()
    {
        $proposals = Proposal::where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('Proposal/Index', [
            'proposals' => $proposals,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     * TODO: Implement proposal creation form.
     */
    public function create()
    {
        return Inertia::render('Proposal/Create');
    }

    /**
     * Store a newly created resource in storage.
     * TODO: Implement full validation and file upload handling.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul'     => 'required|string|max:255',
            'deskripsi' => 'required|string',
        ]);

        $validated['user_id'] = auth()->id();

        Proposal::create($validated);

        return redirect()->route('proposal.index')
            ->with('success', 'Proposal berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     * TODO: Implement full proposal detail view.
     */
    public function show(string $id)
    {
        $proposal = Proposal::findOrFail($id);

        $this->authorize('view', $proposal);

        return Inertia::render('Proposal/Show', [
            'proposal' => $proposal,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Proposal $proposal)
    {
        $this->authorize('update', $proposal);

        return Inertia::render('Proposal/Edit', [
            'proposal' => $proposal,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Proposal $proposal)
    {
        $this->authorize('update', $proposal);

        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
        ]);

        $proposal->update($validated);

        return redirect()->route('proposal.index')
            ->with('success', 'Proposal berhasil diupdate');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $proposal = Proposal::findOrFail($id);
        $proposal->delete();

        return redirect()->route('proposal.index')
            ->with('success', 'Proposal berhasil dihapus');
    }
}
