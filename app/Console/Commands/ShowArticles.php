<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ShowArticles extends Command
{
    protected $signature = 'articles:show {journal_id?}';

    protected $description = 'Show imported articles';

    public function handle()
    {
        $journalId = $this->argument('journal_id');

        $total = DB::table('articles')->count();
        $this->info("📚 Total articles in database: $total");
        $this->newLine();

        if ($journalId) {
            $count = DB::table('articles')->where('journal_id', $journalId)->count();
            $this->info("Articles for journal ID $journalId: $count");
            $this->newLine();

            $articles = DB::table('articles')
                ->where('journal_id', $journalId)
                ->orderBy('publication_date', 'desc')
                ->limit(5)
                ->get();

            $this->info('=== Sample Articles ===');
            $this->newLine();

            foreach ($articles as $article) {
                $this->line("<fg=cyan>• {$article->title}</>");
                $this->line("  📅 Published: {$article->publication_date}");
                if ($article->doi) {
                    $this->line("  🔗 DOI: {$article->doi}");
                }
                if ($article->article_url) {
                    $this->line("  🌐 URL: {$article->article_url}");
                }

                // Show authors
                $authors = json_decode($article->authors);
                if ($authors && is_array($authors)) {
                    $this->line('  ✍️  Authors: '.implode(', ', array_slice($authors, 0, 3)));
                }

                $this->newLine();
            }
        } else {
            // Show stats by journal
            $stats = DB::table('articles')
                ->join('journals', 'articles.journal_id', '=', 'journals.id')
                ->select('journals.id', 'journals.title', DB::raw('COUNT(*) as article_count'))
                ->groupBy('journals.id', 'journals.title')
                ->get();

            $this->info('=== Articles by Journal ===');
            $this->newLine();

            foreach ($stats as $stat) {
                $this->line("<fg=green>Journal {$stat->id}:</> {$stat->title}");
                $this->line("  Articles: <fg=yellow>{$stat->article_count}</>");
                $this->newLine();
            }

            $this->info('💡 Tip: Run with journal ID to see article details');
            $this->line('   Example: php artisan articles:show 1');
        }

        return 0;
    }
}
