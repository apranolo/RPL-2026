<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJournalOutputRequest;
use App\Models\Journal;
use App\Models\JournalOutput;
use App\Models\ResearchOutput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OutputController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $outputs = ResearchOutput::with(['user', 'outputable'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Output/Index', [
            'outputs' => $outputs,
        ]);
    }

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
            // Removed Output::getTypeOptions() because it's undefined in ResearchOutput, 
            // but we can pass constant from ResearchOutput
            'outputTypes' => ResearchOutput::KATEGORI,
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
            DB::beginTransaction();

            // 1. Create the specific JournalOutput
            $journalOutput = JournalOutput::create([
                'doi' => $validated['doi'] ?? null,
                'journal_name' => $validated['journal_name'],
                'volume' => $validated['volume'] ?? null,
                'number' => $validated['issue'] ?? null,
                'url' => $validated['url'] ?? null,
            ]);

            // Handle file upload
            $filePath = null;
            if ($request->hasFile('file')) {
                $filePath = $request->file('file')->store('outputs/publications', 'public');
            }

            // Fetch a contract for the user to satisfy the foreign key constraint
            $contract = \App\Models\Contract::where('user_id', $user->id)->first();

            // 2. Create the parent ResearchOutput
            $researchOutput = new ResearchOutput([
                'contract_id' => $contract ? $contract->id : 1,
                'user_id' => $user->id,
                'jenis_luaran' => 'Jurnal',
                'judul_luaran' => $validated['title'],
                'tahun_capaian' => $validated['year'],
                'file_sertifikat_atau_cover' => $filePath,
                'status_verifikasi' => 'Draft',
                // other fields like authors, issn, publisher could be saved to keterangan as JSON or string
                'keterangan' => json_encode([
                    'authors' => $validated['authors'],
                    'pages' => $validated['pages'] ?? null,
                    'issn' => $validated['issn'] ?? null,
                    'e_issn' => $validated['e_issn'] ?? null,
                    'publisher' => $validated['publisher'] ?? null,
                    'journal_id' => $validated['journal_id'] ?? null,
                ]),
            ]);

            $journalOutput->researchOutput()->save($researchOutput);

            DB::commit();

            return redirect()
                ->route('user.outputs.create')
                ->with('success', 'Luaran publikasi jurnal berhasil ditambahkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan saat menyimpan luaran: ' . $e->getMessage());
        }
    }

    public function edit(ResearchOutput $output)
    {
        $this->authorize('update', $output);

        return Inertia::render('Output/Edit', [
            'outputs' => $output,
        ]);
    }

    public function update(Request $request, ResearchOutput $output)
    {
        $this->authorize('update', $output);

        // Simple validation matching the current schema (adjust as needed)
        $validated = $request->validate([
            'contract_id' => 'nullable|exists:contracts,id',
            'jenis_luaran' => 'required|string|max:255',
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer',
            'file_sertifikat_atau_cover' => 'nullable|string|max:255',
            'status_verifikasi' => 'required|string|max:100',
            'keterangan' => 'nullable|string',
        ]);

        $output->update($validated);

        return redirect()->route('user.outputs.index')->with('message', 'Output updated successfully');
    }

    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

        $output->delete();

        return redirect()->route('user.outputs.index')->with('message', 'Output deleted successfully');
    }
}
