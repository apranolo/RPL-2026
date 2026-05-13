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
            'proposal_id' => 'required',
            'user_id'     => 'required',
            'kategori'    => 'required|string|max:255',
            'judul'       => 'required|string|max:255',
            'file_path'   => 'nullable|string|max:255',
            'status'      => 'required|string|max:100',
            'keterangan'  => 'nullable|string',
        ]);

        $output->update($validated);

        return redirect()->route('outputs.index')->with('message', 'Output updated successfully');
    }

    public function destroy(ResearchOutput $output)
    {
        $this->authorize('delete', $output);

        $output->delete();

        return redirect()->route('outputs.index')->with('message', 'Output deleted successfully');
    }

    /**
     * Handle the submission of the Produk/Prototipe output form.
     */
    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
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

        // Simpan ke database — user_id diambil dari sesi login (RBAC).
        // Aktifkan baris berikut ketika migrasi DB sudah siap:
        // $product = ResearchOutput::create([
        //     ...$validated,
        //     'user_id' => Auth::id(),   // << selalu ikat ke user yang login
        // ]);

        // Handling file uploads — path disimpan ke kolom model setelah DB aktif
        if ($request->hasFile('cover_image')) {
            $coverPath = $request->file('cover_image')->store('outputs/products/covers', 'public');
            // $product->update(['cover_image' => $coverPath]);
        }

        if ($request->hasFile('document')) {
            $docPath = $request->file('document')->store('outputs/products/documents', 'public');
            // $product->update(['document' => $docPath]);
        }

        return redirect()->back()->with('success', 'Data luaran Produk/Prototipe berhasil disimpan.');
    }
}
