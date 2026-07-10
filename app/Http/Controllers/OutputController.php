<?php

/**
 * OutputController
 *
 * Controller untuk mengelola CRUD luaran penelitian (Research Output).
 * Menggunakan relasi polymorphic outputable untuk menyimpan detail spesifik
 * per jenis luaran (Jurnal, Buku, HKI, Produk).
 *
 * @package App\Http\Controllers
 */

namespace App\Http\Controllers;

use App\Models\BookOutput;
use App\Models\HkiOutput;
use App\Models\JournalOutput;
use App\Models\ProductOutput;
use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class OutputController extends Controller
{
    /**
     * Tampilkan form edit luaran penelitian.
     */
    public function edit(ResearchOutput $output)
    {
        $this->authorize('update', $output);

        // Load relasi outputable untuk mengirim data detail ke frontend
        $output->load('outputable');

        return Inertia::render('Output/Edit', [
            'output' => $output,
        ]);
    }

    /**
     * Perbarui luaran penelitian beserta detail polymorphic-nya.
     */
    public function update(Request $request, ResearchOutput $output)
    {
        $this->authorize('update', $output);

        $validated = $request->validate([
            'kategori' => 'required|string|in:Jurnal,Buku,HKI,Produk',
            'judul' => 'required|string|max:255',
            'link_url' => 'nullable|url|max:500',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'status' => 'required|string|max:100',
            'keterangan' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // 1. Update data pada model utama (ResearchOutput)
        $output->update([
            'jenis_luaran' => $validated['kategori'],
            'judul_luaran' => $validated['judul'],
            'status_verifikasi' => $validated['status'],
            'keterangan' => $validated['keterangan'] ?? null,
        ]);

        // 2. Update berkas fisik jika ada
        if ($request->hasFile('file')) {
            if ($output->file_sertifikat_atau_cover) {
                Storage::disk('public')->delete($output->file_sertifikat_atau_cover);
            }
            $uploadedFile = $request->file('file');
            $path = $uploadedFile->store('outputs/' . Auth::id(), 'public');
            $output->update(['file_sertifikat_atau_cover' => $path]);
        }

        // 3. Update data pada model polymorphic spesifik (outputable)
        if ($output->outputable) {
            $metadata = $request->input('metadata', []);

            match ($validated['kategori']) {
                'Jurnal' => $output->outputable->update([
                    'doi' => $metadata['doi'] ?? null,
                    'journal_name' => $metadata['nama_jurnal'] ?? null,
                    'volume' => $metadata['volume'] ?? null,
                    'number' => $metadata['halaman'] ?? null,
                    'url' => $validated['link_url'] ?? null,
                ]),
                'Buku' => $output->outputable->update([
                    'isbn' => $metadata['isbn'] ?? null,
                    'publisher' => $metadata['penerbit'] ?? null,
                    'pages' => isset($metadata['halaman']) ? (int) $metadata['halaman'] : null,
                ]),
                'HKI' => $output->outputable->update([
                    'patent_number' => $metadata['nomor_paten'] ?? null,
                    'patent_type' => $metadata['jenis_paten'] ?? null,
                ]),
                'Produk' => $output->outputable->update([
                    'partner_institution' => $metadata['nama_prototipe'] ?? null,
                    'benefits_description' => $metadata['deskripsi_produk'] ?? null,
                ]),
                default => null,
            };
        }

        return redirect()->route('user.outputs.index')
            ->with('message', 'Output berhasil diperbarui');
    }

    /**
     * Hapus luaran penelitian beserta berkas dan relasi polymorphic-nya.
     */
    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

        // Hapus berkas fisik jika ada
        if ($output->file_sertifikat_atau_cover) {
            Storage::disk('public')->delete($output->file_sertifikat_atau_cover);
        }

        // Hapus relasi polymorphic outputable (akan terhapus otomatis via cascade jika di-setup di migrasi)
        if ($output->outputable) {
            $output->outputable->delete();
        }

        $output->delete();

        return redirect()->route('user.outputs.index')
            ->with('message', 'Output berhasil dihapus');
    }
}