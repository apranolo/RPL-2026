<?php

namespace App\Http\Controllers;

use App\Models\ResearchOutput;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

    public function edit(ResearchOutput $output)
    {
        $this->authorize('update', $output);

        return Inertia::render('Output/Edit', [
            'output' => $output,
        ]);
    }

    public function update(Request $request, ResearchOutput $output)
    {
        $this->authorize('update', $output);

        $validated = $request->validate([
            'kategori' => 'required|string|max:255',
            'judul' => 'required|string|max:255',
            'link_url' => 'nullable|url|max:500',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'status' => 'required|string|max:100',
            'keterangan' => 'nullable|string',
        ]);

        $metadataRules = $this->getMetadataRules($request->kategori);
        $metadataValidated = $request->validate($metadataRules);

        $validated['metadata'] = $metadataValidated['metadata'] ?? [];

        if ($request->hasFile('file')) {
            $uploadedFile = $request->file('file');
            $path = $uploadedFile->store('outputs/' . Auth::id(), 'public');
            $validated['file_path'] = $path;
            $validated['file_name'] = $uploadedFile->getClientOriginalName();
        }

        $output->update($validated);

        return redirect()->route('user.outputs.index')
            ->with('message', 'Output berhasil diperbarui');
    }

    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

        if ($output->file_path) {
            Storage::disk('public')->delete($output->file_path);
        }

        $output->delete();

        return redirect()->route('user.outputs.index')
            ->with('message', 'Output berhasil dihapus');
    }

    private function getMetadataRules(string $kategori): array
    {
        return match ($kategori) {
            'jurnal' => [
                'metadata' => 'nullable|array',
                'metadata.doi' => 'nullable|string|max:255',
                'metadata.nama_jurnal' => 'nullable|string|max:255',
                'metadata.volume' => 'nullable|string|max:100',
                'metadata.halaman' => 'nullable|string|max:50',
            ],
            'hki' => [
                'metadata' => 'nullable|array',
                'metadata.nomor_paten' => 'nullable|string|max:255',
                'metadata.tahun_paten' => 'nullable|string|max:10',
                'metadata.pemegang_paten' => 'nullable|string|max:255',
            ],
            'buku' => [
                'metadata' => 'nullable|array',
                'metadata.isbn' => 'nullable|string|max:255',
                'metadata.penerbit' => 'nullable|string|max:255',
                'metadata.tahun_terbit' => 'nullable|string|max:10',
                'metadata.penulis' => 'nullable|string|max:255',
            ],
            'produk' => [
                'metadata' => 'nullable|array',
                'metadata.nama_prototipe' => 'nullable|string|max:255',
                'metadata.deskripsi_produk' => 'nullable|string|max:5000',
            ],
            'prosiding' => [
                'metadata' => 'nullable|array',
                'metadata.link_prosiding' => 'nullable|string|max:255',
                'metadata.nama_konferensi' => 'nullable|string|max:255',
                'metadata.tahun_pelaksanaan' => 'nullable|string|max:10',
            ],
            default => [
                'metadata' => 'nullable|array',
            ],
        };
    }
}
