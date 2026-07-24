<?php

namespace App\Http\Controllers;

use App\Models\BookOutput;
use App\Models\HkiOutput;
use App\Models\JournalOutput;
use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OutputController extends Controller
{
    public function index()
    {
        $outputs = ResearchOutput::with('user')
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Output/Index', [
            'outputs' => $outputs,
        ]);
    }

    public function create()
    {
        abort_if(! auth()->check(), 403, 'Anda harus login untuk mengakses halaman ini.');

        $outputTypes = [
            'Jurnal' => 'Jurnal / Publikasi Ilmiah',
            'HKI' => 'Hak Kekayaan Intelektual (HKI)',
            'Buku' => 'Buku / Modul Ajar',
            'Produk' => 'Produk / Prototipe',
        ];

        $journals = [];
        if (class_exists(\App\Models\Journal::class)) {
            $journals = \App\Models\Journal::select('id', 'title', 'issn', 'e_issn')->get()->toArray();
        }

        return Inertia::render('Output/Create', [
            'outputTypes' => $outputTypes,
            'journals' => $journals,
        ]);
    }

    public function storeJournal(Request $request)
    {
        abort_if(! auth()->check(), 403, 'Anda harus login untuk menyimpan data Jurnal.');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'authors' => 'required|string|max:255',
            'journal_name' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 5),
            'volume' => 'nullable|string|max:50',
            'issue' => 'nullable|string|max:50',
            'pages' => 'nullable|string|max:50',
            'doi' => 'nullable|string|max:100',
            'url' => 'nullable|url',
            'issn' => 'nullable|string|max:50',
            'e_issn' => 'nullable|string|max:50',
            'publisher' => 'nullable|string|max:255',
            'journal_id' => 'nullable|integer',
            'file' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        try {
            $filePath = null;
            if ($request->hasFile('file')) {
                $filePath = $request->file('file')->store('luaran/jurnal', 'public');
            }

            $journalOutput = JournalOutput::create([
                'doi' => $validated['doi'] ?? null,
                'journal_name' => $validated['journal_name'],
                'volume' => $validated['volume'] ?? null,
                'number' => $validated['issue'] ?? null,
                'url' => $validated['url'] ?? null,
            ]);

            $keteranganParts = [];
            if (! empty($validated['issn'])) {
                $keteranganParts[] = 'ISSN: '.$validated['issn'];
            }
            if (! empty($validated['e_issn'])) {
                $keteranganParts[] = 'E-ISSN: '.$validated['e_issn'];
            }
            if (! empty($validated['publisher'])) {
                $keteranganParts[] = 'Penerbit: '.$validated['publisher'];
            }
            if (! empty($validated['pages'])) {
                $keteranganParts[] = 'Halaman: '.$validated['pages'];
            }

            $journalOutput->researchOutput()->create([
                'user_id' => auth()->id(),
                'contract_id' => $request->input('contract_id', 1),
                'jenis_luaran' => 'Jurnal',
                'judul_luaran' => $validated['title'],
                'tahun_capaian' => $validated['year'],
                'penulis_atau_pencipta' => $validated['authors'],
                'tautan_publikasi' => $validated['url'] ?? null,
                'file_sertifikat_atau_cover' => $filePath,
                'status_verifikasi' => 'Draft',
                'keterangan' => implode(' | ', $keteranganParts),
            ]);

            return redirect()->route('user.outputs.index')->with('success', 'Data Luaran Jurnal berhasil disimpan.');
        } catch (\Exception $e) {
            Log::error('Error storing Journal Output: '.$e->getMessage());

            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan data Jurnal: '.$e->getMessage());
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
        // ── Otorisasi: hanya pemilik atau Super Admin yang boleh update (RBAC) ──
        $this->authorize('update', $output);

        $request->validate([
            'proposal_id' => 'nullable|integer|exists:proposals,id',
            'kategori' => 'nullable|string|max:255',
            'jenis_luaran' => 'nullable|string|max:255',
            'judul' => 'nullable|string|max:255',
            'judul_luaran' => 'nullable|string|max:255',
            'keterangan' => 'nullable|string',
            'file_path' => 'nullable|string|max:255',
            'status' => 'nullable|string',
            'tkt_level' => 'nullable|integer|min:1|max:9',
            'version' => 'nullable|string|max:50',
            'year' => 'nullable|integer|min:2000|max:'.(date('Y') + 1),
            'url' => 'nullable|url',
        ]);

        $output->update([
            'jenis_luaran' => $request->input('jenis_luaran', $request->input('kategori', $output->jenis_luaran)),
            'judul_luaran' => $request->input('judul_luaran', $request->input('judul', $output->judul_luaran)),
            'tahun_capaian' => $request->input('tahun_capaian', $output->tahun_capaian),
            'keterangan' => $request->input('keterangan', $output->keterangan),
        ]);

        return redirect()->route('user.outputs.index')->with('message', 'Output berhasil diperbarui.');
    }

    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

        // Hapus file terkait jika ada
        if ($output->cover_image) {
            Storage::disk('public')->delete($output->cover_image);
        }

        if ($output->document) {
            Storage::disk('public')->delete($output->document);
        }

        $output->delete();

        return redirect()->route('user.outputs.index')->with('message', 'Output deleted successfully');
    }

    /**
     * Store a newly created HKI/Patent output in storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeHKI(Request $request)
    {
        abort_if(! auth()->check(), 403, 'Anda harus login untuk menyimpan data HKI.');

        $validated = $request->validate([
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:'.(date('Y') + 5),
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
            $keteranganParts[] = 'Penulis/Pencipta: '.$validated['penulis_atau_pencipta'];
            if (! empty($validated['tautan_publikasi'])) {
                $keteranganParts[] = 'Tautan: '.$validated['tautan_publikasi'];
            }
            if (! empty($validated['deskripsi'])) {
                $keteranganParts[] = 'Deskripsi: '.$validated['deskripsi'];
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
                'data' => array_merge(\Illuminate\Support\Arr::except($validated, ['file_sertifikat_atau_cover', 'file_cover_atau_halaman_hak_cipta']), ['file_path' => $filePath]),
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing HKI: '.$e->getMessage());

            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan data HKI: '.$e->getMessage());
        }
    }

    /**
     * Store a newly created Book/Module output in storage.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeBook(Request $request)
    {
        abort_if(! auth()->check(), 403, 'Anda harus login untuk menyimpan data Buku.');

        $validated = $request->validate([
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:'.(date('Y') + 5),
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
            $keteranganParts[] = 'Penulis/Pencipta: '.$validated['penulis_atau_pencipta'];
            $keteranganParts[] = 'Tipe Buku: '.$validated['tipe_buku'];
            if (! empty($validated['tautan_publikasi'])) {
                $keteranganParts[] = 'Tautan: '.$validated['tautan_publikasi'];
            }
            if (! empty($validated['deskripsi'])) {
                $keteranganParts[] = 'Deskripsi: '.$validated['deskripsi'];
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
                'data' => array_merge(\Illuminate\Support\Arr::except($validated, ['file_sertifikat_atau_cover', 'file_cover_atau_halaman_hak_cipta']), ['file_path' => $filePath]),
            ]);
        } catch (\Exception $e) {
            Log::error('Error storing Book: '.$e->getMessage());

            return back()->withInput()->with('error', 'Terjadi kesalahan saat menyimpan data Buku: '.$e->getMessage());
        }
    }

    /**
     * Handle the submission of the Produk/Prototipe output form.
     *
     * Logika:
     *  1. Validasi input.
     *  2. Buat record ResearchOutput — user_id SELALU dari Auth::id() (RBAC).
     *  3. Simpan file cover/dokumen (jika ada) lalu update path ke record yang sama.
     */
    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'proposal_id' => 'nullable|integer|exists:proposals,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'tkt_level' => 'required|integer|min:1|max:9',
            'version' => 'nullable|string|max:50',
            'year' => 'required|integer|min:2000|max:'.(date('Y') + 1),
            'url' => 'nullable|url',
            'status' => 'required|in:draft,published,patented',
            'category' => 'required|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'document' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // ── Otorisasi: pastikan user yang login boleh membuat luaran baru ──
        // Policy: ResearchOutputPolicy@create — hanya role 'User' yang aktif & approved.
        $this->authorize('create', ResearchOutput::class);

        // ── Simpan data ke DB — user_id selalu diikat ke user yang sedang login (RBAC) ──
        $product = ResearchOutput::create([
            'proposal_id' => $validated['proposal_id'] ?? null,
            'user_id' => Auth::id(),   // ← RBAC: selalu dari sesi login, bukan dari input
            'kategori' => 'produk',
            'judul' => $validated['title'],
            'keterangan' => $validated['description'],
            'tkt_level' => $validated['tkt_level'],
            'version' => $validated['version'] ?? null,
            'year' => $validated['year'],
            'url' => $validated['url'] ?? null,
            'status' => $validated['status'],
        ]);

        // ── Upload cover image (jika ada) & simpan path ke record ──
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')
                ->store("outputs/products/covers/{$product->id}", 'public');
            $product->update(['cover_image' => $coverPath]);
        }

        // ── Upload dokumen bukti (jika ada) & simpan path ke record ──
        if ($request->hasFile('document')) {
            $originalName = $request->file('document')->getClientOriginalName();
            $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
            $timestamp = now()->format('YmdHis');

            $docPath = $request->file('document')
                ->storeAs(
                    "outputs/products/documents/{$product->id}",
                    "{$timestamp}_{$safeName}",
                    'public'
                );
            $product->update(['document' => $docPath]);
        }

        return redirect()->route('user.outputs.index')
            ->with('success', 'Data luaran Produk/Prototipe berhasil disimpan.');
    }
}
