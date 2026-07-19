<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class OutputController extends Controller
{
    /**
     * Display a listing of the user's research outputs.
     */
    public function index(): Response
    {
        $outputs = ResearchOutput::with('user')
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
            'penulis' => 'nullable|string|max:500',
            'url_publikasi' => 'nullable|url|max:500',
            'file_path' => 'nullable|file|mimes:pdf|max:5120',
        ], [
            'proposal_id.required' => 'Proposal wajib dipilih.',
            'proposal_id.exists' => 'Proposal yang dipilih tidak valid.',
            'judul.required' => 'Judul publikasi jurnal wajib diisi.',
            'nama_jurnal.required' => 'Nama jurnal wajib diisi.',
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

            // Build keterangan from journal-specific metadata
            $keteranganParts = [];
            if (!empty($validated['nama_jurnal'])) {
                $keteranganParts[] = 'Jurnal: ' . $validated['nama_jurnal'];
            }
            if (!empty($validated['doi'])) {
                $keteranganParts[] = 'DOI: ' . $validated['doi'];
            }
            if (!empty($validated['volume'])) {
                $keteranganParts[] = 'Vol: ' . $validated['volume'];
            }
            if (!empty($validated['nomor'])) {
                $keteranganParts[] = 'No: ' . $validated['nomor'];
            }
            if (!empty($validated['halaman'])) {
                $keteranganParts[] = 'Hal: ' . $validated['halaman'];
            }
            if (!empty($validated['penulis'])) {
                $keteranganParts[] = 'Penulis: ' . $validated['penulis'];
            }
            if (!empty($validated['url_publikasi'])) {
                $keteranganParts[] = 'URL: ' . $validated['url_publikasi'];
            }

            ResearchOutput::create([
                'proposal_id' => $validated['proposal_id'],
                'user_id' => Auth::id(),
                'kategori' => 'jurnal',
                'judul' => $validated['judul'],
                'file_path' => $filePath,
                'status' => 'draft',
                'keterangan' => !empty($keteranganParts) ? implode(' | ', $keteranganParts) : null,
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
        abort_if(!auth()->check(), 403, 'Anda harus login untuk menyimpan data HKI.');

        $validated = $request->validate([
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:' . (date('Y') + 5),
            'penulis_atau_pencipta' => 'required|string',
            'nomor_paten' => 'required|string|max:100',
            'jenis_hki' => 'required|string|in:paten,hak_cipta,merek,desain_industri,rahasia_dagang',
            'deskripsi' => 'nullable|string|max:1000',
            'tautan_publikasi' => 'nullable|url',
            'file_sertifikat_atau_cover' => 'required|file|mimes:pdf,jpg,png,jpeg|max:5120',
        ], [
            'judul_luaran.required' => 'Judul luaran wajib diisi.',
            'tahun_capaian.required' => 'Tahun capaian wajib diisi.',
            'penulis_atau_pencipta.required' => 'Penulis atau pencipta wajib diisi.',
            'nomor_paten.required' => 'Nomor paten wajib diisi.',
            'jenis_hki.required' => 'Jenis HKI wajib dipilih.',
            'jenis_hki.in' => 'Jenis HKI yang dipilih tidak valid.',
            'deskripsi.max' => 'Deskripsi maksimal 1000 karakter.',
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
        abort_if(!auth()->check(), 403, 'Anda harus login untuk menyimpan data Buku.');

        $validated = $request->validate([
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:' . (date('Y') + 5),
            'penulis_atau_pencipta' => 'required|string',
            'isbn' => 'required|string|max:50',
            'tipe_buku' => 'required|string|in:monograf,referensi,modul_ajar,book_chapter',
            'deskripsi' => 'nullable|string|max:1000',
            'tautan_publikasi' => 'nullable|url',
            'file_sertifikat_atau_cover' => 'required|file|mimes:pdf,jpg,png,jpeg|max:5120',
        ], [
            'judul_luaran.required' => 'Judul luaran wajib diisi.',
            'tahun_capaian.required' => 'Tahun capaian wajib diisi.',
            'penulis_atau_pencipta.required' => 'Penulis atau pencipta wajib diisi.',
            'isbn.required' => 'ISBN wajib diisi.',
            'tipe_buku.required' => 'Tipe buku wajib dipilih.',
            'tipe_buku.in' => 'Tipe buku yang dipilih tidak valid.',
            'deskripsi.max' => 'Deskripsi maksimal 1000 karakter.',
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

            // 3. Save the rest to ResearchOutput via polymorphic relation
            $bookOutput->researchOutput()->create([
                'user_id' => auth()->id(),
                'contract_id' => $request->input('contract_id', 1),
                'jenis_luaran' => 'Buku',
                'judul_luaran' => $validated['judul_luaran'],
                'tahun_capaian' => $validated['tahun_capaian'],
                'file_sertifikat_atau_cover' => $filePath,
                'status_verifikasi' => 'Draft',
                'keterangan' => implode(' | ', $keteranganParts),
            ]);

            return redirect()->back()->with([
                'success' => 'Data Buku berhasil disimpan.',
                'data' => array_merge($validated, ['file_path' => $filePath])
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing Book: ' . $e->getMessage());
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
        if ($output->file_path) {
            Storage::disk('public')->delete($output->file_path);
        }

        $output->delete();

        return redirect()->route('outputs.index')->with('message', 'Output deleted successfully');
    }
}
