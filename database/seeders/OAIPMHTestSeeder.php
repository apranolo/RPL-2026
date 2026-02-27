<?php

namespace Database\Seeders;

use App\Models\Journal;
use Illuminate\Database\Seeder;

class OAIPMHTestSeeder extends Seeder
{
    /**
     * Seed test data for OAI-PMH harvesting.
     * Adds OAI-PMH URLs to existing journals for testing purposes.
     */
    public function run(): void
    {
        $this->command->info('🔬 Adding OAI-PMH URLs for testing...');

        // Real OAI-PMH endpoints from Indonesian journals
        // Using public and reliably accessible endpoints
        $testUrls = [
            'https://journal1.uad.ac.id/index.php/BAHASTRA/oai', // BAHASTRA - UAD
            'https://journal.ugm.ac.id/v3/BEI/oai', // Berkala Ilmu Kedokteran - UGM
            'https://journal.ugm.ac.id/jurnal-humaniora/oai', // Jurnal Humaniora - UGM
        ];

        $journals = Journal::take(3)->get();

        if ($journals->count() < 3) {
            $this->command->warn('⚠️  Not enough journals in database. Please run DatabaseSeeder first.');

            return;
        }

        foreach ($journals as $index => $journal) {
            if (isset($testUrls[$index])) {
                $journal->update([
                    'oai_pmh_url' => $testUrls[$index],
                ]);
                $this->command->info("  ✓ Updated: {$journal->title}");
                $this->command->info("    OAI-PMH: {$testUrls[$index]}");
            }
        }

        $this->command->info('');
        $this->command->info('✅ OAI-PMH test URLs added successfully!');
        $this->command->info('');
        $this->command->info('📚 Next steps:');
        $this->command->info('   Run: php artisan journals:harvest-articles --all');
        $this->command->info('   Or:  php artisan journals:harvest-articles 1');
    }
}
