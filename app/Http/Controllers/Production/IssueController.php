<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IssueController extends Controller
{
    /**
     * Preview Issue
     */
    public function preview($journalId, $volume, $issue)
{
    $issueModel = Issue::with('journal')
        ->where('journal_id', $journalId)
        ->where('volume', $volume)
        ->where('number', $issue)
        ->firstOrFail();

    $articles = \App\Models\Article::where('journal_id', $journalId)
        ->where('volume', $volume)
        ->where('issue', $issue)
        ->orderBy('publication_date')
        ->get();

    return Inertia::render('Production/Issue/Preview', [
        'issue' => $issueModel,
        'articles' => $articles,
    ]);
}

    /**
     * Publish Issue
     */
    public function publish($journalId, $volume, $issue)
    {
        DB::beginTransaction();

        try {
            $issueModel = Issue::where('journal_id', $journalId)
                ->where('volume', $volume)
                ->where('number', $issue)
                ->firstOrFail();

            $issueModel->update([
                'status' => 'Published',
                'publication_date' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => "Issue Vol {$volume} No {$issue} berhasil dipublish",
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Gagal publish issue.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Menampilkan daftar Back Issues (arsip issue yang telah dipublish).
     */
    public function backIssues($journalId)
    {
        $issues = \App\Models\Issue::with('journal')
            ->where('journal_id', $journalId)
            ->where('status', 'Published')
            ->orderByDesc('publication_date')
            ->get();

        return Inertia::render('Production/Issue/BackIssues', [
            'issues' => $issues,
        ]);
    }
}