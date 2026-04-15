<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->command->info('🌱 Starting Database Seeding...');
        $this->command->info('');

        // Order matters! Sesuaikan dengan foreign key dependencies
        $this->call([
            RoleSeeder::class,              // 1. Roles (no dependencies)
            ScientificFieldSeeder::class,   // 2. Scientific Fields (no dependencies)
            UniversitySeeder::class,        // 3. Universities (no dependencies)
            UserSeeder::class,              // 4. Users (depends on: roles, universities)
            EvaluationIndicatorSeeder::class, // 5. Evaluation Indicators (v1.0 legacy data)

            // === NEW v1.1: Hierarchical Borang Structure ===
            AccreditationTemplateSeeder::class, // 6. Templates (2 templates: BAN-PT, Scopus)
            DataMigrationSeeder::class,         // 7. Migrate v1.0 → v1.1 (categories, sub-categories)
            EssayQuestionSeeder::class,         // 8. Essay Questions (6 samples)

            JournalSeeder::class,           // 9. Journals (depends on: universities, users, scientific_fields)
            AssessmentSeeder::class,        // 10. Assessments with Journal Metadata (depends on: journals, users, indicators)
            PembinaanSeeder::class,         // 11. Pembinaan System (depends on: journals, users, templates)
        ]);

        $this->command->info('');
        $this->command->info('✨ Database seeding completed successfully!');
        $this->command->info('');
        $this->command->info('🔐 You can now login with:');
        $this->command->info('   Email: superadmin@ajm.ac.id');
        $this->command->info('   Password: password123');
    }
}
