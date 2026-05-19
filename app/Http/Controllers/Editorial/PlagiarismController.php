<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Models\PlagiarismCheck;
use Illuminate\Http\Request;

class PlagiarismController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'submission_version_id' => 'required|integer',
            'similarity_score' => 'required|numeric|min:0|max:100',
            'report_file' => 'required|file|mimes:pdf|max:5120',
            'source_breakdown' => 'nullable|array',
        ]);

        $reportPath = $request->file('report_file')->store('plagiarism-reports', 'public');

        PlagiarismCheck::create([
            'submission_version_id' => $validated['submission_version_id'],
            'similarity_score' => $validated['similarity_score'],
            'checked_at' => now(),
            'report_file_path' => $reportPath,
            'source_breakdown' => $validated['source_breakdown'] ?? null,
            'status' => 'completed',
        ]);

        return back()->with('success', 'Laporan cek plagiasi berhasil diupload.');
    }
}