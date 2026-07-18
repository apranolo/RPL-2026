<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
    }

    public function edit(ResearchOutput $output)
    {
        $this->authorize('update', $output);

        $output->load(['outputable', 'contract']);

        $contracts = Contract::where('created_by', Auth::id())
            ->orWhereHas('proposal', fn ($q) => $q->where('user_id', Auth::id()))
            ->get(['id', 'contract_number', 'title']);

        return Inertia::render('Output/Edit', [
            'output' => $output,
            'contracts' => $contracts,
            'kategoriOptions' => ResearchOutput::KATEGORI,
            'statusOptions' => ResearchOutput::STATUS,
        ]);
    }

    /**
     * Store a newly created Book/Module output in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeBook(Request $request)
    {
        $this->authorize('update', $output);

        $validated = $request->validate([
            'contract_id' => 'required|exists:contracts,id',
            'jenis_luaran' => 'required|string|in:' . implode(',', array_keys(ResearchOutput::KATEGORI)),
            'judul_luaran' => 'required|string|max:255',
            'tahun_capaian' => 'required|integer|min:1900|max:' . (date('Y') + 1),
            'penulis_atau_pencipta' => 'required|string|max:255',
            'file_sertifikat_atau_cover' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'status_verifikasi' => 'required|string|in:' . implode(',', array_keys(ResearchOutput::STATUS)),
            'keterangan' => 'nullable|string',
            'tautan_publikasi' => 'nullable|url|max:255',
            'outputable' => 'nullable|array',
            'outputable.doi' => 'nullable|string|max:255',
            'outputable.journal_name' => 'nullable|string|max:255',
            'outputable.volume' => 'nullable|string|max:50',
            'outputable.number' => 'nullable|string|max:50',
            'outputable.url' => 'nullable|url|max:255',
            'outputable.isbn' => 'nullable|string|max:50',
            'outputable.publisher' => 'nullable|string|max:255',
            'outputable.pages' => 'nullable|string|max:50',
            'outputable.tipe_buku' => 'nullable|string|max:100',
            'outputable.patent_number' => 'nullable|string|max:100',
            'outputable.patent_type' => 'nullable|string|max:100',
            'outputable.inventors' => 'nullable|string|max:255',
            'outputable.partner_institution' => 'nullable|string|max:255',
            'outputable.benefits_description' => 'nullable|string',
        ]);

        if ($request->hasFile('file_sertifikat_atau_cover')) {
            if ($output->file_sertifikat_atau_cover) {
                Storage::disk('public')->delete($output->file_sertifikat_atau_cover);
            }
            $validated['file_sertifikat_atau_cover'] = $request->file('file_sertifikat_atau_cover')->store('outputs', 'public');
        }

        $output->update(array_diff_key($validated, ['outputable' => '']));

        $this->syncOutputable($output, $request->input('outputable', []));

        return redirect()->route('user.outputs.index')->with('message', 'Luaran penelitian berhasil diperbarui');
    }

    private function syncOutputable(ResearchOutput $output, array $outputableData): void
    {
        $outputable = $output->outputable;

        if ($outputable) {
            $outputable->update($outputableData);
        } elseif (!empty(array_filter($outputableData))) {
            $outputableClass = match ($output->jenis_luaran) {
                'Jurnal' => \App\Models\JournalOutput::class,
                'Buku' => \App\Models\BookOutput::class,
                'HKI' => \App\Models\HkiOutput::class,
                'Produk' => \App\Models\ProductOutput::class,
            };
            $output->outputable()->create($outputableData);
        }
    }

    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

        if ($output->file_sertifikat_atau_cover) {
            Storage::disk('public')->delete($output->file_sertifikat_atau_cover);
        }

        if ($output->outputable) {
            $output->outputable->delete();
        }

        $output->delete();

        return redirect()->route('user.outputs.index')->with('message', 'Luaran penelitian berhasil dihapus');
    }
}
