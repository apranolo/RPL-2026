<?php

namespace App\Http\Controllers\Editorial;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePlagiarismCheckRequest;
use App\Models\PlagiarismCheck;

class PlagiarismController extends Controller
{
    public function store(StorePlagiarismCheckRequest $request)
    {
        $this->authorize('create', PlagiarismCheck::class);

        $validated = $request->validated();

        $reportPath = $request->file('report_file')->store('plagiarism-reports', 'public');

        PlagiarismCheck::create([
            'submission_id' => $validated['submission_id'],
            'similarity_score' => $validated['similarity_score'],
            'checked_at' => now(),
            'report_file_path' => $reportPath,
            'source_breakdown' => $validated['source_breakdown'] ?? null,
            'status' => 'completed',
        ]);

        return back()->with('success', 'Laporan cek plagiasi berhasil diupload.');
    }
}