<?php

namespace App\Http\Controllers;

use App\Models\BookOutput;
use App\Models\HkiOutput;
use App\Models\ResearchOutput;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OutputController extends Controller
{
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
}
