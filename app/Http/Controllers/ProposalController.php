<?php

namespace App\Http\Controllers;

use App\Models\Proposal;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * ProposalController (User-facing)
 *
 * Mengelola aksi CRUD proposal untuk peran User (Dosen).
 * Aksi verifikasi (approve/reject) ditangani oleh Admin\ProposalController.
 */
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
    public function edit(Proposal $proposal)
    {
        $this->authorize('update', $proposal);

        return Inertia::render('Proposal/Edit', [
            'proposal' => $proposal,
        ]);
    }

    /**
     * Update the specified resource in storage.
     * Kolom diselaraskan dengan migrasi: title & description.
     */
    public function update(Request $request, Proposal $proposal)
    {
        $this->authorize('update', $proposal);

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
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
