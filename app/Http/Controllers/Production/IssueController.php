<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Issue;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IssueController extends Controller
{
    /**
     * Display a listing of the issues (Draft and Published) for a journal.
     */
    public function index(Request $request, $journalId = null)
    {
        if (!$journalId) {
            $journal = $request->user()->journals()->first();
            if (!$journal) {
                return redirect()->route('dashboard')->with('error', 'Anda belum memiliki jurnal.');
            }
            $journalId = $journal->id;
        } else {
            $journal = Journal::findOrFail($journalId);
            $this->authorizeJournal($journal, $request->user());
        }

        $query = Issue::with('journal')
            ->withCount('galleys')
            ->where('journal_id', $journalId);

        if ($status = $request->query('status')) {
            if (in_array($status, ['Draft', 'Published'])) {
                $query->where('status', $status);
            }
        }

        $issues = $query->orderByDesc('year')
            ->orderByDesc('volume')
            ->orderByDesc('number')
            ->get();

        return Inertia::render('Production/Issue/Index', [
            'journal' => $journal,
            'issues' => $issues,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Preview Issue
     */
    public function preview(Request $request, $journalId, $volume, $issue)
    {
        $issueModel = Issue::with('journal')
            ->where('journal_id', $journalId)
            ->where('volume', $volume)
            ->where('number', $issue)
            ->firstOrFail();

        $this->authorizeJournal($issueModel->journal, $request->user());

        $articles = Article::where('journal_id', $journalId)
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
    public function publish(Request $request, $journalId, $volume, $issue)
    {
        $issueModel = Issue::with('journal')
            ->where('journal_id', $journalId)
            ->where('volume', $volume)
            ->where('number', $issue)
            ->firstOrFail();

        $this->authorizeJournal($issueModel->journal, $request->user());

        DB::beginTransaction();

        try {
            $issueModel->update([
                'status' => 'Published',
                'publication_date' => now(),
            ]);

            DB::commit();

            return response()->json([
                'message' => "Issue Vol {$volume} No {$issue} berhasil dipublish.",
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
        $issues = Issue::with('journal')
            ->where('journal_id', $journalId)
            ->where('status', 'Published')
            ->orderByDesc('publication_date')
            ->get();

        return Inertia::render('Production/Issue/BackIssues', [
            'issues' => $issues,
        ]);
    }

    /**
     * Authorize that the user owns or can manage the journal.
     */
    private function authorizeJournal(Journal $journal, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        if ($user->isAdminKampus()) {
            if ($journal->university_id !== $user->university_id) {
                abort(403, 'Anda tidak memiliki akses ke jurnal ini.');
            }
            return;
        }

        if ($user->isUser()) {
            if ($journal->user_id !== $user->id) {
                abort(403, 'Anda tidak memiliki akses ke jurnal ini.');
            }
            return;
        }

        abort(403, 'Akses tidak sah.');
    }
}