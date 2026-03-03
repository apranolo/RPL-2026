<?php

namespace App\Jobs;

use App\Models\Journal;
use App\Services\OAIPMHHarvester;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Throwable;

class HarvestJournalArticlesJob implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 180;

    /**
     * The unique ID of the job — prevents duplicate harvest jobs for the same journal.
     * Laravel will silently discard a new dispatch if a job with this ID is already queued.
     */
    public function uniqueId(): string
    {
        return 'harvest-journal-'.$this->journal->id;
    }

    /**
     * The number of seconds the unique lock should be held.
     * After 10 minutes the lock is released even if the job hasn't run.
     */
    public function uniqueFor(): int
    {
        return 600;
    }

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly Journal $journal,
        public readonly ?string $fromDate = null,
    ) {}

    /**
     * Execute the job.
     */
    public function handle(OAIPMHHarvester $harvester): void
    {
        $harvester->harvest($this->journal, $this->fromDate);
    }

    /**
     * Handle a job failure.
     * Log the failure to oai_harvesting_logs so the UI can surface it.
     */
    public function failed(Throwable $exception): void
    {
        DB::table('oai_harvesting_logs')->insert([
            'journal_id' => $this->journal->id,
            'harvested_at' => now(),
            'records_found' => 0,
            'records_imported' => 0,
            'status' => 'failed',
            'error_message' => 'Job failed after '.$this->tries.' attempts: '.$exception->getMessage(),
        ]);
    }

    /**
     * Get the tags that should be assigned to the job.
     * Used for monitoring with Laravel Horizon.
     */
    public function tags(): array
    {
        return ['oai-harvest', 'journal:'.$this->journal->id];
    }
}
