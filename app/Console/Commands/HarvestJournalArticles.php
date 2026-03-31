<?php

namespace App\Console\Commands;

use App\Models\Journal;
use App\Services\OAIPMHHarvester;
use Illuminate\Console\Command;

class HarvestJournalArticles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'journals:harvest-articles 
                            {journal_id? : The ID of a specific journal to harvest}
                            {--all : Harvest all journals with OAI-PMH URLs}
                            {--from= : Start date for harvesting (YYYY-MM-DD format)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Harvest articles from journal OAI-PMH endpoints';

    /**
     * Execute the console command.
     */
    public function handle(OAIPMHHarvester $harvester)
    {
        $fromDate = $this->option('from');

        // Determine which journals to harvest
        if ($this->option('all')) {
            $this->info('Harvesting articles from all journals with OAI-PMH URLs...');
            $journals = Journal::whereNotNull('oai_urls')
                ->where('is_active', true)
                ->get();

            if ($journals->isEmpty()) {
                $this->warn('No journals found with OAI-PMH URLs configured.');

                return Command::SUCCESS;
            }

            $this->info("Found {$journals->count()} journal(s) to harvest.");
        } elseif ($journalId = $this->argument('journal_id')) {
            $journal = Journal::find($journalId);

            if (! $journal) {
                $this->error("Journal with ID {$journalId} not found.");

                return Command::FAILURE;
            }

            if (empty($journal->oai_urls)) {
                $this->error("Journal '{$journal->title}' does not have OAI-PMH URL configured.");

                return Command::FAILURE;
            }

            $journals = collect([$journal]);
        } else {
            $this->error('Please specify either a journal ID or use --all flag.');
            $this->info('Usage: php artisan journals:harvest-articles {journal_id} or --all');

            return Command::FAILURE;
        }

        // Harvest each journal
        $totalRecordsFound = 0;
        $totalRecordsImported = 0;
        $totalRecordsUpdated = 0;
        $failedJournals = [];

        foreach ($journals as $journal) {
            $this->info("\n📚 Harvesting: {$journal->title}");
            $this->info('    OAI-PMH URLs: '.implode(', ', $journal->oai_urls));

            try {
                $stats = $harvester->harvest($journal, $fromDate);

                $totalRecordsFound += $stats['records_found'];
                $totalRecordsImported += $stats['records_imported'];
                $totalRecordsUpdated += $stats['records_updated'];

                $this->info("   ✓ Found: {$stats['records_found']} records");
                $this->info("   ✓ Imported: {$stats['records_imported']} new articles");
                $this->info("   ✓ Updated: {$stats['records_updated']} existing articles");

                if (! empty($stats['errors'])) {
                    $this->warn('   ⚠ Errors: '.count($stats['errors']).' records had issues');
                    foreach ($stats['errors'] as $error) {
                        $this->line("      - {$error}");
                    }
                }
            } catch (\Exception $e) {
                $this->error("   ✗ Failed: {$e->getMessage()}");
                $failedJournals[] = $journal->title;
            }
        }

        // Summary
        $this->newLine();
        $this->info('═══════════════════════════════════════════');
        $this->info('📊 Harvesting Summary');
        $this->info('═══════════════════════════════════════════');
        $this->info("Journals processed: {$journals->count()}");
        $this->info("Total records found: {$totalRecordsFound}");
        $this->info("New articles imported: {$totalRecordsImported}");
        $this->info("Existing articles updated: {$totalRecordsUpdated}");

        if (! empty($failedJournals)) {
            $this->warn("\nFailed journals (".count($failedJournals).')');
            foreach ($failedJournals as $title) {
                $this->line("  - {$title}");
            }

            return Command::FAILURE;
        }

        $this->info("\n✅ Harvesting completed successfully!");

        return Command::SUCCESS;
    }
}
