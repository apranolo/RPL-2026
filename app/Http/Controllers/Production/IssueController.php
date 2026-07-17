<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIssueRequest;
use App\Models\Issue;
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
    public function store(StoreIssueRequest $request)
    {
        $validated = $request->validated();

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
                'status' => 'Draft',
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
}
