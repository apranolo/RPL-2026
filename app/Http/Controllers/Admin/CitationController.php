<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\SyncCitationsJob;
use App\Models\Citation;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Symfony\Component\DomCrawler\Crawler;

class CitationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Citations/Index', [
            'citations' => Citation::paginate(20),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Citation $citation)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Citation $citation)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Citation $citation)
    {
        //
    }

    private function fetchIssues(string $url)
    {
        $issuesLinks = $url . '/issue/archive';

        $html = @file_get_contents($issuesLinks);
        if ($html === false) {
            Log::warning("[Sync] Failed to fetch issues from: {$issuesLinks}");
            return [];
        }

        // Get the issues from the page content using DomCrawler
        $crawler = new Crawler($html);

        $issues = $crawler->filter('ul.issues_archive .obj_issue_summary h2 a.title')
            ->each(fn(Crawler $node) => trim($node->attr('href')));

        return $issues;
    }

    private function fetchArticles(string $issueUrl)
    {
        $html = @file_get_contents($issueUrl);
        if ($html === false) {
            Log::warning("[Sync] Failed to fetch articles from: {$issueUrl}");
            return [];
        }

        // Get the articles from the page content using DomCrawler
        $crawler = new Crawler($html);

        $articles = $crawler->filter('ul.cmp_article_list .obj_article_summary .title a')
            ->each(fn(Crawler $node) => trim($node->attr('href')));

        return $articles;
    }

    private function fetchCitations(string $articleUrl)
    {
        $html = @file_get_contents($articleUrl);
        if ($html === false) {
            $error = error_get_last()['message'] ?? 'Unknown error';
            Log::warning("[Sync] Failed to fetch citations from: {$articleUrl} — {$error}");
            return [];
        }

        // Get the citations from the page content using DomCrawler
        $crawler = new Crawler($html);

        $citations = $crawler->filter('section.references div.value p')
            ->each(function (Crawler $node) {
                return $node->text();
            });

        return $citations;
    }

    public function dispatchSync()
    {
        $status = Cache::get(SyncCitationsJob::CACHE_KEY);
        if (($status['status'] ?? null) === 'running') {
            return response()->json(['message' => 'Sync already running.'], 409);
        }

        SyncCitationsJob::dispatch();

        return response()->json(['message' => 'Sync started.']);
    }

    public function syncStatus()
    {
        return response()->json(
            Cache::get(SyncCitationsJob::CACHE_KEY, ['status' => 'idle'])
        );
    }

    public function sync()
    {
        // Get all journal urls
        $journals = Journal::all();

        foreach ($journals as $journal) {
            Log::info("[Sync] Fetching issues from: {$journal->url}");
            $issues = $this->fetchIssues($journal->url);
            Log::info("[Sync] Found " . \count($issues) . " issues");

            foreach ($issues as $issue) {
                Log::info("[Sync] Fetching articles from: {$issue}");
                $articles = $this->fetchArticles($issue);
                Log::info("[Sync] Found " . \count($articles) . " articles");

                foreach ($articles as $article) {
                    Log::info("[Sync] Fetching citations from: {$article}");
                    $citations = $this->fetchCitations($article);
                    Log::info("[Sync] Found " . \count($citations) . " citations");

                    // Save citations to database
                    // Citation example :
                    // <p>Astanto, T. J., Suyanto, S.-, Santoso, H. W., &amp; Salim, R. (2022). Technical inefficiency in nine clusters of Indonesian manufacturing firms and its determinants: Stochastic Frontier analysis. Jurnal Ekonomi Pembangunan: Kajian Masalah Ekonomi dan Pembangunan, 23(2), 241–253. <a href="https://doi.org/10.23917/jep.v23i2.18113">https://doi.org/10.23917/jep.v23i2.18113</a></p>
                    foreach ($citations as $citationText) {
                        // Extract DOI from citation text
                        preg_match('/https?:\/\/doi\.org\/[^\s]+/', $citationText, $matches);
                        $doi = $matches[0] ?? null;

                        // Skip if DOI is already in the database
                        if ($doi && Citation::where('doi', $doi)->exists()) {
                            Log::info("[Sync] Citation with DOI {$doi} already exists, skipping.");
                            continue;
                        }

                        Citation::create([
                            'title' => $citationText,
                            'author' => 'TODO: Implement',
                            'publication_year' => 9999,
                            'journal' => $journal->title,
                            'volume' => 'TODO: Implement',
                            'issue' => 'TODO: Implement',
                            'pages' => 'TODO: Implement',
                            'doi' => $doi,
                        ]);
                    }
                }
            }
        }
    }
}
