<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ShowHarvestingLogs extends Command
{
    protected $signature = 'oai:logs {journal_id?}';

    protected $description = 'Show OAI-PMH harvesting logs';

    public function handle()
    {
        $journalId = $this->argument('journal_id');

        $query = DB::table('oai_harvesting_logs')
            ->join('journals', 'oai_harvesting_logs.journal_id', '=', 'journals.id')
            ->select(
                'oai_harvesting_logs.*',
                'journals.title as journal_title'
            )
            ->orderBy('oai_harvesting_logs.harvested_at', 'desc');

        if ($journalId) {
            $query->where('oai_harvesting_logs.journal_id', $journalId);
        }

        $logs = $query->limit(10)->get();

        $this->info('📊 OAI-PMH Harvesting Logs (Last 10)');
        $this->newLine();

        foreach ($logs as $log) {
            $statusIcon = match ($log->status) {
                'success' => '✅',
                'partial' => '⚠️',
                'failed' => '❌',
                default => '❓'
            };

            $this->line("<fg=cyan>$statusIcon {$log->journal_title}</> (ID: {$log->journal_id})");
            $this->line("   Harvested: {$log->harvested_at}");
            $this->line("   Found: <fg=yellow>{$log->records_found}</> | Imported: <fg=green>{$log->records_imported}</>");
            $this->line('   Status: <fg='.($log->status === 'success' ? 'green' : 'red').">{$log->status}</>");

            if ($log->error_message) {
                $errors = explode('; ', $log->error_message);
                $errorCount = count($errors);
                $this->line("   Errors: <fg=red>{$errorCount} issues</>");
                if ($errorCount <= 3) {
                    foreach ($errors as $error) {
                        $this->line('     • '.substr($error, 0, 80));
                    }
                } else {
                    $this->line('     • '.substr($errors[0], 0, 80));
                    $this->line('     • ... and '.($errorCount - 1).' more');
                }
            }

            $this->newLine();
        }

        // Show summary stats
        $stats = DB::table('oai_harvesting_logs')
            ->select(
                DB::raw('SUM(records_found) as total_found'),
                DB::raw('SUM(records_imported) as total_imported'),
                DB::raw('COUNT(*) as total_runs')
            )
            ->first();

        $this->info('=== Overall Statistics ===');
        $this->line("Total harvesting runs: <fg=cyan>{$stats->total_runs}</>");
        $this->line("Total records found: <fg=yellow>{$stats->total_found}</>");
        $this->line("Total records imported: <fg=green>{$stats->total_imported}</>");

        return 0;
    }
}
