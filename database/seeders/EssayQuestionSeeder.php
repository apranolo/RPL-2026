<?php

namespace Database\Seeders;

use App\Models\AccreditationTemplate;
use App\Models\EssayQuestion;
use App\Models\EvaluationCategory;
use Illuminate\Database\Seeder;

/**
 * Seeder for creating sample essay questions.
 *
 * Creates 6 sample essays (3 per template):
 * - 3 for BAN-PT Akreditasi template
 * - 3 for Scopus Indeksasi template
 *
 * Essay questions are linked to categories (NOT sub-categories per advisor requirement).
 *
 * REQUIREMENTS:
 * - Must run AFTER AccreditationTemplateSeeder and DataMigrationSeeder
 * - Categories must exist before creating essays
 */
class EssayQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('📝 Seeding Essay Questions...');
        $this->command->newLine();

        // Get templates
        $banptTemplate = AccreditationTemplate::where('type', 'akreditasi')
            ->where('is_active', true)
            ->first();

        $scopusTemplate = AccreditationTemplate::where('type', 'indeksasi')
            ->where('is_active', false)
            ->first();

        if (! $banptTemplate || ! $scopusTemplate) {
            $this->command->error('❌ ERROR: Templates not found! Run AccreditationTemplateSeeder first.');

            return;
        }

        // Get categories for each template
        $banptCategories = EvaluationCategory::where('template_id', $banptTemplate->id)
            ->orderBy('display_order')
            ->get();

        if ($banptCategories->isEmpty()) {
            $this->command->error('❌ ERROR: No categories found for BAN-PT template! Run DataMigrationSeeder first.');

            return;
        }

        // ===========================
        // BAN-PT Akreditasi Essays
        // ===========================
        $this->command->info("📋 Creating essays for: {$banptTemplate->name}");

        $banptEssays = [
            [
                'category_id' => $banptCategories->first()->id, // First category: Kelengkapan Administrasi
                'code' => 'ESSAY-ADM-01',
                'question' => 'Jelaskan sejarah dan perkembangan jurnal Anda sejak pertama kali diterbitkan hingga saat ini.',
                'guidance' => 'Uraikan secara kronologis: tahun pendirian, latar belakang pendirian, milestone penting (perubahan nama, indexing, akreditasi), serta visi misi jurnal. Sertakan data kuantitatif seperti jumlah artikel per tahun dan perkembangan impact factor (jika ada).',
                'max_words' => 500,
                'is_required' => true,
                'display_order' => 1,
                'is_active' => true,
            ],
            [
                'category_id' => $banptCategories->skip(1)->first()?->id ?? $banptCategories->first()->id, // Second category or fallback to first
                'code' => 'ESSAY-KON-01',
                'question' => 'Jelaskan proses peer review yang diterapkan di jurnal Anda, mulai dari submission hingga accepted.',
                'guidance' => 'Uraikan tahapan: initial screening oleh editor, assignment ke reviewer (berapa orang? kriteria pemilihan?), blind review process (single/double-blind?), timeline per tahap, kriteria acceptance/rejection, dan proses revisi. Sertakan flowchart atau diagram jika memungkinkan.',
                'max_words' => 600,
                'is_required' => true,
                'display_order' => 2,
                'is_active' => true,
            ],
            [
                'category_id' => $banptCategories->skip(2)->first()?->id ?? $banptCategories->first()->id, // Third category or fallback
                'code' => 'ESSAY-VIS-01',
                'question' => 'Jelaskan strategi jurnal Anda dalam meningkatkan visibility dan citation index di masa mendatang.',
                'guidance' => 'Uraikan rencana: target indexing database (Scopus, Web of Science, dll), strategi digital marketing (social media, SEO), kolaborasi dengan institusi/asosiasi, program special issue, dan upaya meningkatkan author diversity. Berikan timeline realistis (1-3 tahun ke depan).',
                'max_words' => 500,
                'is_required' => false,
                'display_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banptEssays as $index => $essay) {
            EssayQuestion::create(array_merge($essay, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            $category = EvaluationCategory::find($essay['category_id']);
            $essayNum = $index + 1;
            $this->command->info("  ✓ Essay {$essayNum}/3: {$essay['code']} → Category: {$category->name}");
        }

        $this->command->newLine();

        // ===========================
        // Scopus Indeksasi Essays (DRAFT - not used yet)
        // ===========================
        $this->command->info("📋 Creating essays for: {$scopusTemplate->name} (DRAFT)");

        // For Scopus template, create generic categories if not exist
        $scopusCategories = EvaluationCategory::where('template_id', $scopusTemplate->id)->get();

        if ($scopusCategories->isEmpty()) {
            $this->command->warn('  ⚠️  No categories for Scopus template, creating placeholder categories...');

            $placeholderCategories = [
                ['code' => 'SCOPUS-QUA', 'name' => 'Journal Quality & Policy', 'weight' => 30],
                ['code' => 'SCOPUS-PUB', 'name' => 'Publication Ethics', 'weight' => 25],
                ['code' => 'SCOPUS-VIS', 'name' => 'Visibility & Citation', 'weight' => 45],
            ];

            foreach ($placeholderCategories as $order => $cat) {
                $category = EvaluationCategory::create([
                    'template_id' => $scopusTemplate->id,
                    'code' => $cat['code'],
                    'name' => $cat['name'],
                    'description' => "Placeholder category for {$cat['name']} evaluation criteria.",
                    'weight' => $cat['weight'],
                    'display_order' => $order + 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $scopusCategories->push($category);
                $this->command->info("    • Created placeholder category: {$cat['name']}");
            }
        }

        $scopusEssays = [
            [
                'category_id' => $scopusCategories->first()->id,
                'code' => 'ESSAY-SCOPUS-QUA-01',
                'question' => 'Describe your journal\'s editorial board composition and their expertise in the field.',
                'guidance' => 'Provide details on: number of board members, their academic ranks (Professor, Associate Professor), geographical diversity, h-index range, and their relevance to journal scope. Explain how board members contribute to journal quality.',
                'max_words' => 400,
                'is_required' => true,
                'display_order' => 1,
                'is_active' => false, // Inactive because template is not active
            ],
            [
                'category_id' => $scopusCategories->skip(1)->first()?->id ?? $scopusCategories->first()->id,
                'code' => 'ESSAY-SCOPUS-ETH-01',
                'question' => 'Explain your journal\'s policies on plagiarism detection, data transparency, and conflict of interest.',
                'guidance' => 'Describe: plagiarism tools used (Turnitin, iThenticate), similarity threshold policy, data sharing requirements, COI disclosure forms, and how violations are handled. Reference your published ethical guidelines.',
                'max_words' => 450,
                'is_required' => true,
                'display_order' => 2,
                'is_active' => false,
            ],
            [
                'category_id' => $scopusCategories->skip(2)->first()?->id ?? $scopusCategories->first()->id,
                'code' => 'ESSAY-SCOPUS-CIT-01',
                'question' => 'Provide evidence of your journal\'s citation impact and international reach.',
                'guidance' => 'Include metrics: CiteScore, SJR (if available), average citations per article, percentage of international authors (non-Indonesia), languages of publication, and indexing databases currently achieved. Attach supporting documents if available.',
                'max_words' => 350,
                'is_required' => false,
                'display_order' => 3,
                'is_active' => false,
            ],
        ];

        foreach ($scopusEssays as $index => $essay) {
            EssayQuestion::create(array_merge($essay, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));

            $category = EvaluationCategory::find($essay['category_id']);
            $essayNum = $index + 1;
            $this->command->info("  ✓ Essay {$essayNum}/3: {$essay['code']} → Category: {$category->name} (inactive)");
        }

        $this->command->newLine();
        $this->command->info('✨ Successfully seeded 6 essay questions!');
        $this->command->info('  • BAN-PT Akreditasi: 3 essays (active)');
        $this->command->info('  • Scopus Indeksasi: 3 essays (inactive draft)');
        $this->command->newLine();
    }
}
