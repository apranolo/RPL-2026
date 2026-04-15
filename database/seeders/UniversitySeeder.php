<?php

namespace Database\Seeders;

use App\Models\University;
use Illuminate\Database\Seeder;

class UniversitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Loads university data from database/PTMA.json file.
     * Uses updateOrCreate to handle re-seeding gracefully.
     */
    public function run(): void
    {
        // Load universities from JSON file
        $jsonPath = database_path('PTMA.json');

        if (! file_exists($jsonPath)) {
            $this->command->error('PTMA.json file not found at: '.$jsonPath);

            return;
        }

        $jsonContent = file_get_contents($jsonPath);
        $universities = json_decode($jsonContent, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            $this->command->error('Error parsing PTMA.json: '.json_last_error_msg());

            return;
        }

        if (empty($universities) || ! is_array($universities)) {
            $this->command->error('No valid university data found in PTMA.json');

            return;
        }

        $this->command->info('Loading '.count($universities).' universities from PTMA.json...');
        $this->command->newLine();

        $successCount = 0;
        $skippedCount = 0;
        $skippedUniversities = [];

        // Define code mappings for universities with codes > 20 characters
        $codeMappings = [
            'POLTEKKES_MUH_MAKASSAR' => 'POLKES_MUH_MKS',
            'STIKES_MUH_LHOKSEUMAWE' => 'STIKES_MUH_LSM',
            'STIKES_MUH_BOJONEGORO' => 'STIKES_MUH_BJN',
            'STIT_INTERNASIONAL_BATAM' => 'STIT_INTL_BATAM',
            'ISTK_AISYIYAH_KENDARI' => 'ISTK_ASY_KENDARI',
            'POLTEKKES_AISYIYAH_BANTEN' => 'POLKES_ASY_BANTEN',
            'POLTEK_AISYIYAH_PONTIANAK' => 'POLTEK_ASY_PTK',
            'STIKES_AISYIYAH_PALEMBANG' => 'STIKES_ASY_PLG',
        ];

        // Process each university with progress bar
        $this->command->withProgressBar($universities, function ($data) use (&$successCount, &$skippedCount, &$skippedUniversities, $codeMappings) {
            // Validate required fields
            if (empty($data['code']) || empty($data['name'])) {
                $skippedCount++;
                $skippedUniversities[] = $data['name'] ?? $data['code'] ?? 'Unknown';

                return;
            }

            try {
                // Fix codes that exceed 20 characters
                if (isset($codeMappings[$data['code']])) {
                    $data['code'] = $codeMappings[$data['code']];
                }

                // Ensure is_active has a boolean value (fix null values)
                if (! isset($data['is_active']) || $data['is_active'] === null) {
                    $data['is_active'] = true;
                }

                // Add timestamps to the data
                $data['created_at'] = now();
                $data['updated_at'] = now();

                // Use updateOrCreate to handle duplicates gracefully
                University::updateOrCreate(
                    ['code' => $data['code']], // Unique identifier
                    $data // All university data
                );

                $successCount++;
            } catch (\Exception $e) {
                $skippedCount++;
                $skippedUniversities[] = $data['name'].' ('.$data['code'].')';
                $this->command->newLine();
                $this->command->warn('Skipped: '.$data['name'].' - '.$e->getMessage());
            }
        });

        $this->command->newLine(2);

        // Display summary
        $this->command->info("✅ Successfully seeded {$successCount} universities.");

        if ($skippedCount > 0) {
            $this->command->warn("⚠️  Skipped {$skippedCount} universities due to validation errors or duplicates:");
            foreach ($skippedUniversities as $skipped) {
                $this->command->line("   - {$skipped}");
            }
        }

        // Display data quality notice
        $nullFieldCount = University::whereNull('address')
            ->orWhereNull('city')
            ->orWhereNull('website')
            ->count();

        if ($nullFieldCount > 0) {
            $this->command->newLine();
            $this->command->comment("ℹ️  Note: {$nullFieldCount} universities have incomplete data (missing address, city, or website).");
            $this->command->comment('   These can be updated later by LPPM admins or via data migration.');
        }
    }
}
