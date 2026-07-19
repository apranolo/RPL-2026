<?php

namespace App\Http\Controllers;

use App\Models\BookOutput;
use App\Models\HkiOutput;
use App\Models\JournalOutput;
use App\Models\Proposal;
use App\Models\ResearchOutput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class OutputController extends Controller
{
    /**
     * Display a listing of the user's research outputs.
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
     */
    public function create(): Response
    {
        $user = Auth::user();

        // Get the user's proposals for linking
        $proposals = Proposal::where('user_id', $user->id)
            ->select('id', 'judul')
            ->orderBy('judul')
            ->get();

        return Inertia::render('Output/Create', [
            'kategoriOptions' => ResearchOutput::KATEGORI,
            'proposals' => $proposals,
        ]);
    }

    /**
     * Store a newly created journal publication output.
     *
     * Handles the submission of the Publikasi Jurnal Ilmiah sub-form,
     * including optional DOI-based metadata and file upload.
     */
    public function storeJournal(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'proposal_id' => 'required|exists:proposals,id',
            'judul' => 'required|string|max:255',
            'nama_jurnal' => 'required|string|max:255',
            'doi' => 'nullable|string|max:255',
            'volume' => 'nullable|string|max:50',
            'nomor' => 'nullable|string|max:50',
            'halaman' => 'nullable|string|max:50',
            'penulis' => 'required|string|max:500',
            'url_publikasi' => 'nullable|url|max:500',
            'file_path' => 'nullable|file|mimes:pdf|max:5120',
            'tahun_capaian' => 'nullable|integer',
        ], [
            'proposal_id.required' => 'Proposal wajib dipilih.',
            'proposal_id.exists' => 'Proposal yang dipilih tidak valid.',
            'judul.required' => 'Judul publikasi jurnal wajib diisi.',
            'nama_jurnal.required' => 'Nama jurnal wajib diisi.',
            'penulis.required' => 'Penulis jurnal wajib diisi.',
            'url_publikasi.url' => 'URL publikasi harus berupa URL yang valid.',
            'file_path.mimes' => 'File harus berupa PDF.',
            'file_path.max' => 'Ukuran file maksimal 5MB.',
        ]);

        try {
            // Handle file upload
            $filePath = null;
            if ($request->hasFile('file_path')) {
                $filePath = $request->file('file_path')->store('luaran/jurnal', 'public');
            }

            // Create Journal-specific metadata in JournalOutput table
            $journalOutput = JournalOutput::create([
                'journal_name' => $validated['nama_jurnal'],
                'doi' => $validated['doi'] ?? null,
                'volume' => $validated['volume'] ?? null,
                'number' => $validated['nomor'] ?? null,
                'url' => $validated['url_publikasi'] ?? null,
            ]);

            // Save polymorphic parent ResearchOutput
            $journalOutput->researchOutput()->create([
                'contract_id' => $validated['proposal_id'],
                'user_id' => Auth::id(),
                'jenis_luaran' => 'Jurnal',
                'judul_luaran' => $validated['judul'],
                'tahun_capaian' => $validated['tahun_capaian'] ?? date('Y'),
                'file_sertifikat_atau_cover' => $filePath,
                'status_verifikasi' => 'Menunggu_Verifikasi',
                'penulis_atau_pencipta' => $validated['penulis'],
                'tautan_publikasi' => $validated['url_publikasi'] ?? null,
                'keterangan' => !empty($validated['halaman']) ? 'Halaman: ' . $validated['halaman'] : null,
            ]);

            return redirect()
                ->route('outputs.index')
                ->with('success', 'Luaran publikasi jurnal berhasil disimpan.');
        } catch (\Exception $e) {
            Log::error('Error storing Journal Output: ' . $e->getMessage());

            // Cleanup uploaded file on failure
            if (isset($filePath) && $filePath) {
                Storage::disk('public')->delete($filePath);
            }

            return back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan saat menyimpan data jurnal: ' . $e->getMessage());
        }
    }

    /**
     * Store a newly created HKI/Patent output in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeHKI(Request $request)
    {
        $validated = $request->validate([
            'proposal_id' => 'nullable',
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:' . (date('Y') + 5),
            'penulis_atau_pencipta' => 'required|string',
            'nomor_paten' => 'required|string|max:100',
            'tautan_publikasi' => 'nullable|url',
            'file_sertifikat_atau_cover' => 'required|file|mimes:pdf,jpg,png,jpeg|max:5120',
        ], [
            'judul_luaran.required' => 'Judul luaran wajib diisi.',
            'tahun_capaian.required' => 'Tahun capaian wajib diisi.',
            'penulis_atau_pencipta.required' => 'Penulis atau pencipta wajib diisi.',
            'nomor_paten.required' => 'Nomor paten wajib diisi.',
            'file_sertifikat_atau_cover.required' => 'File sertifikat atau cover wajib diunggah.',
            'file_sertifikat_atau_cover.mimes' => 'File sertifikat atau cover harus berupa PDF, JPG, PNG, atau JPEG.',
            'file_sertifikat_atau_cover.max' => 'Ukuran file sertifikat atau cover maksimal 5MB.',
            'tautan_publikasi.url' => 'Tautan publikasi harus berupa URL yang valid.',
        ]);

        try {
            $filePath = null;
            if ($request->hasFile('file_sertifikat_atau_cover')) {
                $filePath = $request->file('file_sertifikat_atau_cover')->store('luaran/hki', 'public');
            }

            // Create HKI-specific metadata
            $hkiOutput = HkiOutput::create([
                'patent_number' => $validated['nomor_paten'],
            ]);

            // Save polymorphic parent ResearchOutput
            $hkiOutput->researchOutput()->create([
                'contract_id' => $validated['proposal_id'] ?? null,
                'user_id' => Auth::id(),
                'jenis_luaran' => 'HKI',
                'judul_luaran' => $validated['judul_luaran'],
                'tahun_capaian' => $validated['tahun_capaian'],
                'file_sertifikat_atau_cover' => $filePath,
                'status_verifikasi' => 'Menunggu_Verifikasi',
                'penulis_atau_pencipta' => $validated['penulis_atau_pencipta'],
                'tautan_publikasi' => $validated['tautan_publikasi'] ?? null,
            ]);

            return redirect()->back()->with([
                'success' => 'Data HKI berhasil disimpan.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing HKI: ' . $e->getMessage());
            
            if (isset($filePath) && $filePath) {
                Storage::disk('public')->delete($filePath);
            }
            
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
        $validated = $request->validate([
            'proposal_id' => 'nullable',
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:' . (date('Y') + 5),
            'penulis_atau_pencipta' => 'required|string',
            'isbn' => 'required|string|max:50',
            'tipe_buku' => 'nullable|string|max:100',
            'tautan_publikasi' => 'nullable|url',
            'file_sertifikat_atau_cover' => 'required|file|mimes:pdf,jpg,png,jpeg|max:5120',
        ], [
            'judul_luaran.required' => 'Judul luaran wajib diisi.',
            'tahun_capaian.required' => 'Tahun capaian wajib diisi.',
            'penulis_atau_pencipta.required' => 'Penulis atau pencipta wajib diisi.',
            'isbn.required' => 'ISBN wajib diisi.',
            'file_sertifikat_atau_cover.required' => 'File sertifikat atau cover wajib diunggah.',
            'file_sertifikat_atau_cover.mimes' => 'File sertifikat atau cover harus berupa PDF, JPG, PNG, atau JPEG.',
            'file_sertifikat_atau_cover.max' => 'Ukuran file sertifikat atau cover maksimal 5MB.',
            'tautan_publikasi.url' => 'Tautan publikasi harus berupa URL yang valid.',
        ]);

        try {
            $filePath = null;
            if ($request->hasFile('file_sertifikat_atau_cover')) {
                $filePath = $request->file('file_sertifikat_atau_cover')->store('luaran/buku', 'public');
            }

            // Create Book-specific metadata
            $bookOutput = BookOutput::create([
                'isbn' => $validated['isbn'],
                'tipe_buku' => $validated['tipe_buku'] ?? null,
            ]);

            // Save polymorphic parent ResearchOutput
            $bookOutput->researchOutput()->create([
                'contract_id' => $validated['proposal_id'] ?? null,
                'user_id' => Auth::id(),
                'jenis_luaran' => 'Buku',
                'judul_luaran' => $validated['judul_luaran'],
                'tahun_capaian' => $validated['tahun_capaian'],
                'file_sertifikat_atau_cover' => $filePath,
                'status_verifikasi' => 'Menunggu_Verifikasi',
                'penulis_atau_pencipta' => $validated['penulis_atau_pencipta'],
                'tautan_publikasi' => $validated['tautan_publikasi'] ?? null,
            ]);

            return redirect()->back()->with([
                'success' => 'Data Buku berhasil disimpan.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing Book: ' . $e->getMessage());
            
            if (isset($filePath) && $filePath) {
                Storage::disk('public')->delete($filePath);
            }
            
            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan data Buku: ' . $e->getMessage());
        }
    }

    /**
     * Show the form for editing an existing output.
     */
    public function edit(ResearchOutput $output): Response
    {
        $this->authorize('update', $output);

        return Inertia::render('Output/Edit', [
            'outputs' => $output,
        ]);
    }

    /**
     * Update the specified output in storage.
     */
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

        return redirect()->route('outputs.index')->with('message', 'Output updated successfully');
    }

    /**
     * Remove the specified output from storage.
     */
    public function destroy(ResearchOutput $output): RedirectResponse
    {
        $this->authorize('delete', $output);

        // Delete associated file if exists
        if ($output->file_sertifikat_atau_cover) {
            Storage::disk('public')->delete($output->file_sertifikat_atau_cover);
        }

        // Delete specific output polymorphic relation (will trigger cascading delete if db configured, but good practice to clean up here if needed)
        if ($output->outputable) {
            $output->outputable->delete();
        }

        $output->delete();

        return redirect()->route('outputs.index')->with('message', 'Output deleted successfully');
    }
}
