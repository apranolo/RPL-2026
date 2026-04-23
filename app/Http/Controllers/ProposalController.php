<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Proposal;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $proposal = Proposal::findOrFail($id);

        return Inertia::render('Proposal/Edit', [
            'proposal' => $proposal
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $proposal = Proposal::findOrFail($id);

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
