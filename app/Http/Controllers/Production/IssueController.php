<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\ProductionIssue;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IssueController extends Controller
{
    /**
     * Show the form for creating a new production issue.
     */
    public function create()
    {
        return Inertia::render('Production/Issue/Create');
    }

    /**
     * Store a newly created production issue in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'volume' => 'required|string|max:50',
            'nomor' => 'required|string|max:50',
            'tahun' => 'required|integer|min:1900|max:2100',
            'judul_tematik' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string|max:2000',
        ]);

        try {
            // Get the user's first journal as default context
            $journal = $request->user()->journals()->first();

            if (! $journal) {
                return back()->withErrors([
                    'journal_id' => 'Anda belum memiliki jurnal. Silakan buat jurnal terlebih dahulu.',
                ]);
            }

            ProductionIssue::create([
                ...$validated,
                'journal_id' => $journal->id,
                'status' => 'draft',
            ]);

            return redirect()
                ->route('production.issue.create')
                ->with('success', 'Issue berhasil dibuat');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Gagal membuat issue: '.$e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified production issue.
     */
    public function edit(ProductionIssue $issue)
    {
        // Verifikasi kepemilikan: issue harus milik jurnal user yang login
        $journal = request()->user()->journals()->first();
        abort_if(! $journal || $issue->journal_id !== $journal->id, 403, 'Unauthorized action.');
        abort_if($issue->status !== 'draft', 403, 'Only draft issues can be edited.');

        return Inertia::render('Production/Issue/Edit', [
            'issue' => [
                'id' => $issue->id,
                'volume' => $issue->volume,
                'nomor' => $issue->nomor,
                'tahun' => $issue->tahun,
                'judul_tematik' => $issue->judul_tematik,
                'deskripsi' => $issue->deskripsi,
                'status' => $issue->status,
            ],
        ]);
    }

    /**
     * Update the specified production issue in storage.
     */
    public function update(Request $request, ProductionIssue $issue)
    {
        // Verifikasi kepemilikan
        $journal = $request->user()->journals()->first();
        abort_if(! $journal || $issue->journal_id !== $journal->id, 403, 'Unauthorized action.');
        abort_if($issue->status !== 'draft', 403, 'Only draft issues can be edited.');

        $validated = $request->validate([
            'volume' => 'required|string|max:50',
            'nomor' => 'required|string|max:50',
            'tahun' => 'required|integer|min:1900|max:2100',
            'judul_tematik' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string|max:2000',
        ]);

        $issue->update($validated);

        return redirect()
            ->route('production.issue.edit', $issue)
            ->with('success', 'Issue berhasil diperbarui');
    }
}
