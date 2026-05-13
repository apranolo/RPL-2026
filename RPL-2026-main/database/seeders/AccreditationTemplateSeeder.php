<?php

namespace Database\Seeders;

use App\Models\AccreditationTemplate;
use Illuminate\Database\Seeder;

/**
 * Seeder for creating default accreditation templates.
 *
 * Creates 2 default templates:
 * 1. BAN-PT 2024 - Akreditasi (active template for Indonesian university accreditation)
 * 2. Scopus 2024 - Indeksasi (inactive template for Scopus indexing criteria)
 *
 * This seeder should run BEFORE DataMigrationSeeder to establish template structure.
 */
class AccreditationTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('📋 Seeding Accreditation Templates...');

        $templates = [
            // Template 1: BAN-PT Akreditasi (Active)
            [
                'name' => 'BAN-PT 2024 - Akreditasi Jurnal Ilmiah',
                'description' => 'Template penilaian akreditasi jurnal ilmiah berdasarkan standar BAN-PT (Badan Akreditasi Nasional Perguruan Tinggi) tahun 2024. Digunakan untuk evaluasi jurnal di Perguruan Tinggi Muhammadiyah se-Indonesia.',
                'version' => '2024.1',
                'type' => 'akreditasi',
                'is_active' => true,
                'effective_date' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // Template 2: Scopus Indeksasi (Inactive - untuk referensi masa depan)
            [
                'name' => 'Scopus 2024 - Indeksasi Jurnal Internasional',
                'description' => 'Template kriteria indeksasi jurnal internasional berdasarkan standar Scopus (Elsevier). Template ini dapat digunakan sebagai referensi bagi jurnal yang ingin terindeks di database Scopus. Status: Inactive (belum digunakan secara aktif).',
                'version' => '2024.0-draft',
                'type' => 'indeksasi',
                'is_active' => false,
                'effective_date' => now()->addMonths(3), // Efektif 3 bulan ke depan
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($templates as $index => $template) {
            AccreditationTemplate::create($template);
            $templateNum = $index + 1;
            $active = $template['is_active'] ? 'true' : 'false';
            $this->command->info("  ✓ Created template {$templateNum}/2: {$template['name']} (type={$template['type']}, active={$active})");
        }

        $templatesCount = count($templates);
        $this->command->info("✨ Successfully seeded {$templatesCount} accreditation templates!");
        $this->command->newLine();
    }
}
