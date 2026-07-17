<?php

namespace App\Jobs;

use App\Models\Citation;
use App\Models\Journal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\DomCrawler\Crawler;
use Throwable;

class SyncCitationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 3600;

    public int $tries = 1;

    const CACHE_KEY = 'citation_sync:status';

    public function handle(): void
    {
        $journals = Journal::all();
        $total = $journals->count();
        $citationsSaved = 0;

        $this->progress('running', 'Starting sync...', 0, $total, 0);

        foreach ($journals as $i => $journal) {
            $this->progress('running', "Fetching issues: {$journal->title}", $i, $total, $citationsSaved);

            $issues = $this->fetchIssues($journal->url);

            foreach ($issues as $issue) {
                $articles = $this->fetchArticles($issue);

                foreach ($articles as $article) {
                    $citations = $this->fetchCitations($article);

                    foreach ($citations as $citationText) {
                        preg_match('/https?:\/\/doi\.org\/[^\s<]+/', $citationText, $matches);
                        $doi = isset($matches[0]) ? rtrim($matches[0], '.,)') : null;

                        if ($doi && Citation::where('doi', $doi)->exists()) {
                            continue;
                        }

                        Citation::create([
                            'title'            => $citationText,
                            'author'           => 'TODOL: Parse author from citation text',
                            'publication_year' => 9999, // TODO: Parse year from citation text
                            'journal'          => $journal->title,
                            'volume'           => 'TODO: Parse volume from citation text',
                            'issue'            => 'TODO: Parse issue from citation text',
                            'pages'            => 'TODO: Parse pages from citation text',
                            'doi'              => $doi,
                        ]);

                        $citationsSaved++;
                    }
                }
            }
        }

        $this->progress('done', 'Sync complete.', $total, $total, $citationsSaved);
        Log::info("[Sync] Done. {$citationsSaved} citations saved.");
    }

    public function failed(Throwable $e): void
    {
        Cache::put(self::CACHE_KEY, [
            'status'           => 'failed',
            'message'          => $e->getMessage(),
            'processed'        => 0,
            'total'            => 0,
            'citations_saved'  => 0,
            'updated_at'       => now()->toISOString(),
        ], now()->addHour());
    }

    private function progress(string $status, string $message, int $processed, int $total, int $citationsSaved): void
    {
        Cache::put(self::CACHE_KEY, [
            'status'          => $status,
            'message'         => $message,
            'processed'       => $processed,
            'total'           => $total,
            'citations_saved' => $citationsSaved,
            'updated_at'      => now()->toISOString(),
        ], now()->addHour());
    }

    private function fetchIssues(string $url): array
    {
        $html = @file_get_contents($url . '/issue/archive');
        if ($html === false) {
            Log::warning("[Sync] Failed to fetch issues from: {$url}");
            return [];
        }

        return (new Crawler($html))
            ->filter('ul.issues_archive .obj_issue_summary h2 a.title')
            ->each(fn(Crawler $node) => trim($node->attr('href')));
    }

    private function fetchArticles(string $issueUrl): array
    {
        $html = @file_get_contents($issueUrl);
        if ($html === false) {
            Log::warning("[Sync] Failed to fetch articles from: {$issueUrl}");
            return [];
        }

        return (new Crawler($html))
            ->filter('ul.cmp_article_list .obj_article_summary .title a')
            ->each(fn(Crawler $node) => trim($node->attr('href')));
    }

    private function fetchCitations(string $articleUrl): array
    {
        $html = @file_get_contents($articleUrl);
        if ($html === false) {
            $error = error_get_last()['message'] ?? 'Unknown error';
            Log::warning("[Sync] Failed to fetch citations from: {$articleUrl} — {$error}");
            return [];
        }

        return (new Crawler($html))
            ->filter('section.references div.value p')
            ->each(fn(Crawler $node) => $node->text());
    }
}