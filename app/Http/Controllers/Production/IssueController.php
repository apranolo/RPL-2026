<?php

namespace App\Http\Controllers\Production;
use App\Http\Controllers\Controller;
use App\Models\Issue;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class IssueController extends Controller
{
    /**
     * Preview Issue sebelum dipublish.
     */
    public function preview($journalId, $volume, $issue)
{
    $issueModel = Issue::with([
        'journal',
        'galleys' => function ($query) {
            $query->with('submission.author')
                ->orderBy('sequence');
        },
    ])
        ->where('journal_id', $journalId)
        ->where('volume', $volume)
        ->where('number', $issue)
        ->firstOrFail();

    // Pastikan user berhak mengelola journal ini.
    $this->authorize('update', $issueModel->journal);

    // Susun data artikel beserta Galley
    // agar sesuai dengan kebutuhan ArticleSequencer.
    $articles = $issueModel->galleys
        ->filter(function ($galley) {
            return $galley->submission !== null;
        })
        ->map(function ($galley) {
            return [
                'id' => $galley->submission->id,
                'title' => $galley->submission->title,
                'status' => $galley->submission->status,
                'author' => $galley->submission->author
                    ? [
                        'id' => $galley->submission->author->id,
                        'name' => $galley->submission->author->name,
                    ]
                    : null,

                'galley' => [
                    'id' => $galley->id,
                    'id_submission' => $galley->submission_id,
                    'id_issue' => $galley->issue_id,
                    'file_path' => $galley->file_path,
                    'file_extension' => $galley->file_extension,
                    'doi' => $galley->doi,
                    'pages' => $galley->pages,
                    'sequence' => $galley->sequence,
                    'file_url' => $galley->file_url,
                ],
            ];
        })
        ->values();

    // Checklist kesiapan publish.
    $publishReadiness = [
        'metadataComplete' => ! empty($issueModel->volume)
            && ! empty($issueModel->number)
            && ! empty($issueModel->year)
            && ! empty($issueModel->title),

        'hasArticles' => $articles->isNotEmpty(),

        'tocComplete' => $articles->isNotEmpty()
            && $articles->every(function ($article) {
                return ! empty($article['title']);
            }),
    ];

    return Inertia::render('Production/Issue/Preview', [
        'issue' => $issueModel,
        'articles' => $articles,
        'publishReadiness' => $publishReadiness,
    ]);
}

    /**
     * Publish Issue beserta seluruh artikel di dalamnya.
     */
    public function publish($journalId, $volume, $issue)
    {
        try {
            // Cari Issue berdasarkan journal, volume, dan nomor.
            $issueModel = Issue::with('journal')
                ->where('journal_id', $journalId)
                ->where('volume', $volume)
                ->where('number', $issue)
                ->firstOrFail();

            // Pastikan user berhak mengelola journal ini.
            $this->authorize('update', $issueModel->journal);

            DB::transaction(function () use ($issueModel, $journalId) {
                // Lock Issue untuk mencegah publish bersamaan.
                $issueModel = Issue::with('galleys.submission')
                    ->whereKey($issueModel->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                // Cegah Issue yang sudah terbit dipublish ulang.
                if ($issueModel->status === 'Published') {
                    throw new \RuntimeException(
                        'Issue ini sudah pernah dipublish.'
                    );
                }

                // Ambil seluruh Submission yang terhubung ke Issue.
                $submissions = $issueModel->galleys
                    ->pluck('submission')
                    ->filter()
                    ->unique('id');

                // Issue harus memiliki minimal satu artikel.
                if ($submissions->isEmpty()) {
                    throw new \RuntimeException(
                        'Issue tidak dapat dipublish karena belum memiliki artikel.'
                    );
                }

                // Publish seluruh Submission dalam Issue.
                foreach ($submissions as $submission) {
                    // Validasi multi-tenancy.
                    if ((int) $submission->journal_id !== (int) $journalId) {
                        throw new \RuntimeException(
                            'Terdapat artikel yang tidak sesuai dengan jurnal.'
                        );
                    }

                    $submission->update([
                        'status' => 'Published',
                    ]);
                }

                // Publish Issue.
                $issueModel->update([
                    'status' => 'Published',
                    'publication_date' => now(),
                ]);
            });

            return redirect()
                ->back()
                ->with(
                    'success',
                    'Edisi jurnal dan seluruh artikel berhasil diterbitkan ke publik!'
                );

        } catch (\RuntimeException $e) {
            return redirect()
                ->back()
                ->with('error', $e->getMessage());

        } catch (\Throwable $e) {
            report($e);

            return redirect()
                ->back()
                ->with(
                    'error',
                    'Gagal menerbitkan issue. Silakan coba kembali.'
                );
        }
    }

    /**
     * Menampilkan daftar Back Issues
     * atau arsip Issue yang telah dipublish.
     */
    public function backIssues($journalId)
    {
        $issues = Issue::with('journal')
            ->where('journal_id', $journalId)
            ->where('status', 'Published')
            ->orderByDesc('publication_date')
            ->get();

        // Pastikan user memiliki akses ke journal.
        if ($issues->isNotEmpty()) {
            $this->authorize('view', $issues->first()->journal);
        }

        return Inertia::render('Production/Issue/BackIssues', [
            'issues' => $issues,
        ]);
    }
}