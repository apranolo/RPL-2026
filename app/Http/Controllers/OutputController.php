<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJournalOutputRequest;
use App\Models\Journal;
use App\Models\Output;
use Illuminate\Http\RedirectResponse;
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

            // Handle file upload
            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('outputs/publications', 'public');
                $outputData['file_path'] = $path;
            }

            Output::create($outputData);

            return redirect()
                ->route('user.outputs.create')
                ->with('success', 'Luaran publikasi jurnal berhasil ditambahkan.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan saat menyimpan luaran. Silakan coba lagi.');
        }
    }
}
