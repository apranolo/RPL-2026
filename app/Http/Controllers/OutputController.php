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
            'outputs' => $output,
        ]);
    }

    public function update(Request $request, ResearchOutput $output)
    {
        $this->authorize('update', $output);

        $validated = $request->validate([
            'proposal_id' => 'nullable|integer|exists:proposals,id',
            'kategori'    => 'required|string|max:255',
            'judul'       => 'required|string|max:255',
            'keterangan'  => 'nullable|string',
            'file_path'   => 'nullable|string|max:255',
            'status'      => 'required|in:draft,submitted,approved,rejected,published,patented',
            // Kolom spesifik produk/prototipe
            'tkt_level'   => 'nullable|integer|min:1|max:9',
            'version'     => 'nullable|string|max:50',
            'year'        => 'nullable|integer|min:2000|max:' . (date('Y') + 1),
            'url'         => 'nullable|url',
        ]);

        // user_id TIDAK diambil dari input — selalu diikat ke pemilik record (RBAC)
        $output->update($validated);

        return redirect()->route('user.outputs.index')->with('message', 'Output updated successfully');
    }

    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

        $output->delete();

        return redirect()->route('user.outputs.index')->with('message', 'Output deleted successfully');
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
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'tkt_level'   => 'required|integer|min:1|max:9',
            'version'     => 'nullable|string|max:50',
            'year'        => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'url'         => 'nullable|url',
            'status'      => 'required|in:draft,published,patented',
            'category'    => 'required|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'document'    => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        // ── Simpan data ke DB — user_id selalu diikat ke user yang sedang login (RBAC) ──
        $product = ResearchOutput::create([
            'proposal_id' => $validated['proposal_id'] ?? null,
            'user_id'     => Auth::id(),   // ← RBAC: selalu dari sesi login, bukan dari input
            'kategori'    => 'produk',
            'judul'       => $validated['title'],
            'keterangan'  => $validated['description'],
            'tkt_level'   => $validated['tkt_level'],
            'version'     => $validated['version'] ?? null,
            'year'        => $validated['year'],
            'url'         => $validated['url'] ?? null,
            'status'      => $validated['status'],
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
            $safeName     = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
            $timestamp    = now()->format('YmdHis');

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
