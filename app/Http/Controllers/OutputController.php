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
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeHKI(Request $request)
    {
        abort_if(!auth()->check(), 403, 'Anda harus login untuk menyimpan data HKI.');

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

        try {
            $filePath = null;
            if ($request->hasFile('file_sertifikat_atau_cover')) {
                $filePath = $request->file('file_sertifikat_atau_cover')->store('luaran/hki', 'public');
            }

            // 1. Save specific data to HkiOutput (patent_number, patent_type)
            $hkiOutput = HkiOutput::create([
                'patent_number' => $validated['nomor_paten'],
                'patent_type' => $validated['jenis_hki'],
            ]);

            // 2. Build keterangan from extra fields not in DB schema
            $keteranganParts = [];
            $keteranganParts[] = 'Penulis/Pencipta: ' . $validated['penulis_atau_pencipta'];
            if (!empty($validated['tautan_publikasi'])) {
                $keteranganParts[] = 'Tautan: ' . $validated['tautan_publikasi'];
            }
            if (!empty($validated['deskripsi'])) {
                $keteranganParts[] = 'Deskripsi: ' . $validated['deskripsi'];
            }

            // 3. Save the rest to ResearchOutput via polymorphic relation
            $hkiOutput->researchOutput()->create([
                'user_id' => auth()->id(),
                'contract_id' => $request->input('contract_id', 1),
                'jenis_luaran' => 'HKI',
                'judul_luaran' => $validated['judul_luaran'],
                'tahun_capaian' => $validated['tahun_capaian'],
                'file_sertifikat_atau_cover' => $filePath,
                'status_verifikasi' => 'Draft',
                'keterangan' => implode(' | ', $keteranganParts),
            ]);

            return redirect()->back()->with([
                'success' => 'Data HKI berhasil disimpan.',
                'data' => array_merge($validated, ['file_path' => $filePath])
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing HKI: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan data HKI: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created Book/Module output in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeBook(Request $request)
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

        try {
            $filePath = null;
            if ($request->hasFile('file_sertifikat_atau_cover')) {
                $filePath = $request->file('file_sertifikat_atau_cover')->store('luaran/buku', 'public');
            }

            // 2. Save specific data to BookOutput (isbn only; tipe_buku stored in keterangan)
            $bookOutput = BookOutput::create([
                'isbn' => $validated['isbn'],
            ]);

            // Build keterangan from extra fields not in DB schema
            $keteranganParts = [];
            $keteranganParts[] = 'Penulis/Pencipta: ' . $validated['penulis_atau_pencipta'];
            $keteranganParts[] = 'Tipe Buku: ' . $validated['tipe_buku'];
            if (!empty($validated['tautan_publikasi'])) {
                $keteranganParts[] = 'Tautan: ' . $validated['tautan_publikasi'];
            }
            if (!empty($validated['deskripsi'])) {
                $keteranganParts[] = 'Deskripsi: ' . $validated['deskripsi'];
            }

        $output->delete();

            return redirect()->back()->with([
                'success' => 'Data Buku berhasil disimpan.',
                'data' => array_merge($validated, ['file_path' => $filePath])
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing Book: ' . $e->getMessage());
            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan data Buku: ' . $e->getMessage());
        }
    }
}
