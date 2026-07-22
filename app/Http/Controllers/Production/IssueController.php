<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Models\Galley;
use App\Models\Issue;
use App\Models\Journal;
use App\Models\ProductionIssue;
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
        if (! $journalId) {
            $journal = $request->user()->journals()->first();
            if (! $journal) {
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

        // Fetch submissions via galleys of this issue
        $articles = Galley::with(['submission.contributors', 'submission.author'])
            ->where('issue_id', $issueModel->id)
            ->orderBy('sequence')
            ->get()
            ->map(function ($galley) {
                $submission = $galley->submission;
                $authors = $submission->contributors->pluck('name')->toArray();
                if (empty($authors) && $submission->author) {
                    $authors = [$submission->author->name];
                }

                return [
                    'id' => $submission->id,
                    'title' => $submission->title,
                    'authors' => $authors,
                    'pages' => $galley->pages,
                    'doi' => $galley->doi,
                    'article_url' => $galley->file_url,
                ];
            });

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

            return redirect()->back()->with('success', "Issue Vol {$volume} No {$issue} berhasil dipublish.");
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Gagal publish issue: '.$e->getMessage());
        }
    }

    /**
     * Menampilkan daftar Back Issues (arsip issue yang telah dipublish).
     */
    public function backIssues($journalId)
    {
        return redirect()->route('user.production.issue.index', [
            'journal' => $journalId,
            'status' => 'Published',
        ]);
    }

    /**
     * Show the form for creating a new production issue.
     */
    public function create()
    {
        return Inertia::render('Production/Issue/Create');
    }

    /**
     * Store a newly created production issue in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'volume' => 'required|string|max:50',
            'nomor' => 'required|string|max:50',
            'tahun' => 'required|integer|min:1900|max:2100',
            'judul_tematik' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string|max:2000',
        ]);

        try {
            // Get the user's first journal as default context
            $journal = $request->user()->journals()->first();

            if (! $journal) {
                return back()->withErrors([
                    'journal_id' => 'Anda belum memiliki jurnal. Silakan buat jurnal terlebih dahulu.',
                ]);
            }

            ProductionIssue::create([
                ...$validated,
                'journal_id' => $journal->id,
                'status' => 'draft',
            ]);

            return redirect()
                ->route('production.issue.create')
                ->with('success', 'Issue berhasil dibuat');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->with('error', 'Gagal membuat issue: '.$e->getMessage());
        }
    }

    /**
     * Show the form for editing the specified production issue.
     */
    public function edit(ProductionIssue $issue)
    {
        // Verifikasi kepemilikan: issue harus milik jurnal user yang login
        $journal = request()->user()->journals()->first();
        abort_if(! $journal || $issue->journal_id !== $journal->id, 403, 'Unauthorized action.');
        abort_if($issue->status !== 'draft', 403, 'Only draft issues can be edited.');

        return Inertia::render('Production/Issue/Edit', [
            'issue' => [
                'id' => $issue->id,
                'volume' => $issue->volume,
                'number' => $issue->nomor,       // petakan nomor ke number untuk frontend
                'year' => $issue->tahun,          // petakan tahun ke year untuk frontend
                'judul_tematik' => $issue->judul_tematik,
                'deskripsi' => $issue->deskripsi,
                'status' => $issue->status,
            ],
        ]);
    }

    /**
     * Update the specified production issue in storage.
     */
    public function update(Request $request, ProductionIssue $issue)
    {
        // Verifikasi kepemilikan
        $journal = $request->user()->journals()->first();
        abort_if(! $journal || $issue->journal_id !== $journal->id, 403, 'Unauthorized action.');
        abort_if($issue->status !== 'draft', 403, 'Only draft issues can be edited.');

        $validated = $request->validate([
            'volume' => 'required|string|max:50',
            'number' => 'required|string|max:50',  // frontend mengirim 'number'
            'year' => 'required|integer|min:1900|max:2100',  // frontend mengirim 'year'
            'judul_tematik' => 'nullable|string|max:255',
            'deskripsi' => 'nullable|string|max:2000',
        ]);

        // Petakan kembali field frontend ke kolom database
        $issue->update([
            'volume' => $validated['volume'],
            'nomor' => $validated['number'],
            'tahun' => $validated['year'],
            'judul_tematik' => $validated['judul_tematik'] ?? null,
            'deskripsi' => $validated['deskripsi'] ?? null,
        ]);

        return redirect()
            ->route('production.issue.edit', $issue)
            ->with('success', 'Issue berhasil diperbarui');
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

    /**
     * Hapus Issue Draft (hanya jika belum ada artikel).
     */
    public function destroy(Request $request, $id)
    {
        $issue = Issue::findOrFail($id);

        if ($issue->status !== 'Draft') {
            return back()->with('error', 'Hanya issue berstatus Draft yang dapat dihapus.');
        }

        $issue->delete();

        return back()->with('success', 'Issue Draft berhasil dihapus.');
    }
}
