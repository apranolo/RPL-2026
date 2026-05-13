<?php

namespace App\Console\Commands;

use App\Services\PublicHomeService;
use Illuminate\Console\Command;

class RefreshFeaturedJournalsCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'journals:refresh-featured';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Refresh the cache for featured journals on the welcome page';

    /**
     * Execute the console command.
     */
    public function handle(PublicHomeService $homeService)
    {
        $this->info('Refreshing featured journals cache...');

        $homeService->refreshFeaturedJournalsCache();

        $this->info('Featured journals cache refreshed successfully!');
    }
}
