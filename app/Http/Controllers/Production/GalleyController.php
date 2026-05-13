<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Galley; // Pastikan model ini sudah dibuat
use App\Models\Article; // Digunakan di assignToIssue
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleyController extends Controller
{
    /**
     * TUGAS 1: Upload Galley file (PDF / HTML / XML) per artikel
     * Sesuai PRD Modul 5 & 6
     */
    public function store(Request $request, $articleId)
    {
        // 1. Validasi sesuai PRD: PDF/HTML/XML, Max 10MB
        $request->validate([
            'label' => 'required|string|max:255',
            'file' => 'required|mimes:pdf,html,xml|max:10240', 
        ]);

        try {
            // 2. Ambil file dan buat nama unik
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // 3. Simpan ke storage (folder: storage/app/public/galleys/{articleId})
            $path = $file->storeAs('galleys/' . $articleId, $filename, 'public');

            // 4. Simpan metadata ke database jurnal_mu
            Galley::create([
                'article_id' => $articleId,
                'label' => $request->label,
                'file_path' => $path,
                'file_type' => $file->getClientOriginalExtension(),
            ]);

            return back()->with('success', 'File Galley berhasil diunggah.');
            
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal upload: ' . $e->getMessage());
        }
    }

    /**
     * TUGAS 2: Jadwalkan artikel ke sebuah Issue
     */
    public function assignToIssue(Request $request, $articleId)
    {
        $request->validate([
            'issue_id' => 'required|exists:issues,id',
        ]);

        $article = Article::findOrFail($articleId);
        $article->update([
            'issue_id' => $request->issue_id,
            'status' => 'Scheduled' // Status berubah untuk dashboard Modul 6
        ]);

        return back()->with('success', 'Artikel berhasil dijadwalkan.');
    }
}