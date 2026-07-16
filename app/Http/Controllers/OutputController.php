<?php

namespace App\Http\Controllers;

use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class OutputController extends Controller
{
    /**
     * Show the form for creating a new output.
     *
     * Displays the main output creation page where users can select
     * the type of scientific output they want to add.
     *
     * @route GET /user/outputs/create
     */
    public function create(): Response
    {
        $user = Auth::user();

        // Get the user's journals for linking
        $journals = Journal::where('user_id', $user->id)
            ->select('id', 'title', 'issn', 'e_issn')
            ->orderBy('title')
            ->get();

        return Inertia::render('Output/Create', [
            'outputTypes' => Output::getTypeOptions(),
            'journals' => $journals,
        ]);
    }

    /**
     * Store a newly created journal publication output.
     *
     * Handles the submission of the Publikasi Jurnal Ilmiah sub-form,
     * including optional DOI-based metadata and file upload.
     *
     * @route POST /user/outputs/store-journal
     */
    public function storeJournal(StoreJournalOutputRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $validated = $request->validated();

        try {
            $outputData = [
                'user_id' => $user->id,
                'type' => Output::TYPE_PUBLIKASI_JURNAL,
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
                'journal_id' => $validated['journal_id'] ?? null,
                'status' => Output::STATUS_DRAFT,
            ];

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

    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

            Output::create($outputData);

        return redirect()->route('user.outputs.index')->with('message', 'Output deleted successfully');
    }
}

