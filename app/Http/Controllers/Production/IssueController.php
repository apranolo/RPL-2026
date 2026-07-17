<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

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
            'volume' => 'required|integer|min:1',
            'number' => 'required|integer|min:1',
            'year' => 'required|integer|min:1900|max:2100',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        try {
            // Get the user's first journal as default context
            $journal = $request->user()->journals()->first();

            if (! $journal) {
                return back()->withErrors([
                    'journal_id' => 'Anda belum memiliki jurnal. Silakan buat jurnal terlebih dahulu.',
                ]);
            }

            // Validasi keunikan kombinasi [volume, number, year]
            $exists = Issue::where('journal_id', $journal->id)
                ->where('volume', $validated['volume'])
                ->where('number', $validated['number'])
                ->where('year', $validated['year'])
                ->exists();

            if ($exists) {
                return back()->withErrors([
                    'number' => 'Kombinasi Volume, Nomor, dan Tahun sudah digunakan.',
                ])->withInput();
            }

            Issue::create([
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
    public function edit(Issue $issue)
    {
        // Verifikasi kepemilikan: issue harus milik jurnal user yang login
        $journal = request()->user()->journals()->first();
        abort_if(! $journal || $issue->journal_id !== $journal->id, 403, 'Unauthorized action.');
        abort_if($issue->status !== 'draft', 403, 'Only draft issues can be edited.');

        return Inertia::render('Production/Issue/Edit', [
            'issue' => [
                'id' => $issue->id,
                'volume' => $issue->volume,
                'number' => $issue->number,
                'year' => $issue->year,
                'title' => $issue->title,
                'description' => $issue->description,
                'status' => $issue->status,
            ],
        ]);
    }

    /**
     * Update the specified production issue in storage.
     */
    public function update(Request $request, Issue $issue)
    {
        // Verifikasi kepemilikan
        $journal = $request->user()->journals()->first();
        abort_if(! $journal || $issue->journal_id !== $journal->id, 403, 'Unauthorized action.');
        abort_if($issue->status !== 'draft', 403, 'Only draft issues can be edited.');

        $validated = $request->validate([
            'volume' => 'required|integer|min:1',
            'number' => 'required|integer|min:1',
            'year' => 'required|integer|min:1900|max:2100',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        // Validasi keunikan kombinasi [volume, number, year]
        $exists = Issue::where('journal_id', $journal->id)
            ->where('volume', $validated['volume'])
            ->where('number', $validated['number'])
            ->where('year', $validated['year'])
            ->where('id', '!=', $issue->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'number' => 'Kombinasi Volume, Nomor, dan Tahun sudah digunakan.',
            ])->withInput();
        }

        $issue->update($validated);

        return redirect()
            ->route('production.issue.edit', $issue)
            ->with('success', 'Issue berhasil diperbarui');
    }
}
