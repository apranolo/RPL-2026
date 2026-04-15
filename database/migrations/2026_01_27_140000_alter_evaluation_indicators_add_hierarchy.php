<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Alters the evaluation_indicators table to add hierarchical relationship.
     *
     * BACKWARD COMPATIBILITY STRATEGY:
     * - Adds new sub_category_id column (nullable for gradual migration)
     * - Keeps old category/sub_category VARCHAR columns (marked as DEPRECATED)
     * - Old v1.0 assessments continue to work using string columns
     * - New v1.1 assessments use relational sub_category_id
     *
     * MIGRATION PLAN:
     * - Step 1: This migration adds sub_category_id column
     * - Step 2: DataMigrationSeeder populates sub_category_id from string values
     * - Step 3: v1.2 removes deprecated columns (after 3 months production stability)
     */
    public function up(): void
    {
        Schema::table('evaluation_indicators', function (Blueprint $table) {
            // Add new relational column AFTER id
            $table->foreignId('sub_category_id')
                ->nullable()
                ->after('id')
                ->constrained('evaluation_sub_categories')
                ->cascadeOnDelete()
                ->comment('NEW v1.1: FK to evaluation_sub_categories (relational)');

            // Add index for performance
            $table->index('sub_category_id');
        });

        // Update column comments to mark old columns as DEPRECATED
        DB::statement("ALTER TABLE evaluation_indicators 
            MODIFY category VARCHAR(100) NULL COMMENT 'DEPRECATED v1.1 - Use sub_category_id relation. Remove in v1.2'");

        DB::statement("ALTER TABLE evaluation_indicators 
            MODIFY sub_category VARCHAR(100) NULL COMMENT 'DEPRECATED v1.1 - Use sub_category_id relation. Remove in v1.2'");

        // Make category nullable for new indicators created via hierarchy
        DB::statement('ALTER TABLE evaluation_indicators 
            MODIFY category VARCHAR(100) NULL');
    }

    /**
     * Reverse the migrations.
     *
     * CRITICAL ROLLBACK PROCEDURE:
     * 1. Drop foreign key constraint FIRST (prevent constraint violations)
     * 2. Drop index
     * 3. Drop column
     * 4. Revert column comments to v1.0 state
     *
     * After rollback, v1.0 code can still read category/sub_category string columns.
     */
    public function down(): void
    {
        Schema::table('evaluation_indicators', function (Blueprint $table) {
            // MUST drop foreign key before dropping column
            $table->dropForeign(['sub_category_id']);
            $table->dropIndex(['sub_category_id']);
            $table->dropColumn('sub_category_id');
        });

        // Revert comments to v1.0 state (remove DEPRECATED warnings)
        DB::statement("ALTER TABLE evaluation_indicators 
            MODIFY category VARCHAR(100) NOT NULL COMMENT 'Kategori utama, e.g., Kelengkapan Administrasi'");

        DB::statement("ALTER TABLE evaluation_indicators 
            MODIFY sub_category VARCHAR(100) NULL COMMENT 'Sub-kategori (optional)'");
    }
};
