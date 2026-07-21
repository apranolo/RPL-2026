<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJournalOutputRequest;
use App\Models\Journal;
use App\Models\JournalOutput;
use App\Models\Proposal;
use App\Models\ResearchOutput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OutputController extends Controller
{
    public function index(): Response
    {
        $outputs = ResearchOutput::with(['user', 'proposal', 'outputable'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Output/Index', [
            'outputs' => $outputs,
        ]);
    }

    public function create(): Response
    {
        $user = Auth::user();

        $proposals = Proposal::query()
            ->where('user_id', $user->id)
            ->select('id', 'title')
            ->orderBy('title')
            ->get();

        $journals = Journal::query()
            ->where('user_id', $user->id)
            ->select('id', 'title', 'issn', 'e_issn')
            ->orderBy('title')
            ->get();

        return Inertia::render('Output/Create', [
            'outputTypes' => ResearchOutput::KATEGORI,
            'proposals' => $proposals,
            'journals' => $journals,
        ]);
    }

    public function storeJournal(StoreJournalOutputRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($request, $validated) {
            $journalOutput = JournalOutput::create([
                'journal_id' => $validated['journal_id'] ?? null,
                'title' => $validated['title'],
                'authors' => $validated['authors'],
                'year' => $validated['year'],
                'doi' => $validated['doi'] ?? null,
                'url' => $validated['url'] ?? null,
                'journal_name' => $validated['journal_name'],
                'volume' => $validated['volume'] ?? null,
                'issue' => $validated['issue'] ?? null,
                'pages' => $validated['pages'] ?? null,
                'issn' => $validated['issn'] ?? null,
                'e_issn' => $validated['e_issn'] ?? null,
                'publisher' => $validated['publisher'] ?? null,
            ]);

            $filePath = $request->hasFile('file')
                ? $request->file('file')->store('outputs/journals', 'public')
                : null;

            ResearchOutput::create([
                'proposal_id' => $validated['proposal_id'],
                'user_id' => Auth::id(),
                'kategori' => 'jurnal',
                'judul' => $validated['title'],
                'file_path' => $filePath,
                'status' => 'draft',
                'keterangan' => $validated['keterangan'] ?? null,
                'outputable_id' => $journalOutput->id,
                'outputable_type' => JournalOutput::class,
            ]);
        });

        return redirect()
            ->route('user.outputs.index')
            ->with('success', 'Luaran publikasi jurnal berhasil ditambahkan.');
    }

    public function edit(ResearchOutput $output): Response
    {

        $this->authorize('update', $output);

        return Inertia::render('Output/Edit', [
            'outputs' => $output,
        ]);
    }

    public function update(Request $request, ResearchOutput $output): RedirectResponse
    {

        $this->authorize('update', $output);

        $validated = $request->validate([
            'proposal_id' => 'required',
            'user_id' => 'required',
            'kategori' => 'required|string|max:255',
            'judul' => 'required|string|max:255',
            'file_path' => 'nullable|string|max:255',
            'status' => 'required|string|max:100',
            'keterangan' => 'nullable|string',
        ]);

        $output->update($validated);

        return redirect()->route('user.outputs.index')->with('message', 'Output updated successfully');
    }

    public function destroy(ResearchOutput $output): RedirectResponse
    {
        $this->authorize('delete', $output);

        $output->delete();

        return redirect()->route('user.outputs.index')->with('message', 'Output deleted successfully');
    }
}
