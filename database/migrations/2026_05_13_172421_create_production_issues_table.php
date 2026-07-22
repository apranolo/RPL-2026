<?php

// database/migrations/2026_05_13_172421_create_production_issues_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the production_issues table for managing journal issue metadata.
     * Each issue belongs to a journal and is identified by volume, nomor, and tahun.
     */
    public function up(): void
    {
        Schema::create('production_issues', function (Blueprint $table) {
            $table->id();

            // Ownership
            $table->foreignId('journal_id')
                ->constrained('journals')
                ->cascadeOnDelete()
                ->comment('Foreign key to journals');

            // Issue Metadata
            $table->string('volume', 50)->comment('Volume number, e.g., 1');
            $table->string('nomor', 50)->comment('Issue number within the volume, e.g., 1');
            $table->smallInteger('tahun')->comment('Publication year, e.g., 2026');

            // Thematic Details
            $table->string('judul_tematik', 255)->nullable()->comment('Optional thematic title');
            $table->text('deskripsi')->nullable()->comment('Issue description');

            // Status
            $table->string('status', 50)->default('draft')->comment('draft | published | archived');

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('journal_id');
            $table->index('tahun');
            $table->index('status');

            // Prevent duplicate volume+nomor in the same year per journal
            $table->unique(
                ['journal_id', 'volume', 'nomor', 'tahun'],
                'unique_issue_per_journal'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_issues');
    }
};
