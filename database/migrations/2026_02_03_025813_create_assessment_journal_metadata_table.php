<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assessment_journal_metadata', function (Blueprint $table) {
            $table->id();

            // Foreign key to journal assessment
            $table->foreignId('journal_assessment_id')
                ->constrained('journal_assessments')
                ->onDelete('cascade');

            // Journal issue identification
            $table->string('volume', 20)->comment('Volume number (e.g., "5")');
            $table->string('number', 20)->comment('Issue number (e.g., "2")');
            $table->year('year')->comment('Publication year');
            $table->unsignedTinyInteger('month')->comment('Publication month (1-12)');
            $table->string('url_issue', 500)->nullable()->comment('URL to journal issue');

            // Editor metrics per issue
            $table->unsignedInteger('jumlah_negara_editor')->default(0)
                ->comment('Number of countries represented by editors in this issue');
            $table->unsignedInteger('jumlah_institusi_editor')->default(0)
                ->comment('Number of institutions represented by editors in this issue');

            // Reviewer metrics per issue
            $table->unsignedInteger('jumlah_negara_reviewer')->default(0)
                ->comment('Number of countries represented by reviewers in this issue');
            $table->unsignedInteger('jumlah_institusi_reviewer')->default(0)
                ->comment('Number of institutions represented by reviewers in this issue');

            // Author metrics per issue (optional - may not always be tracked)
            $table->unsignedInteger('jumlah_negara_author')->nullable()
                ->comment('Number of countries represented by authors in this issue');
            $table->unsignedInteger('jumlah_institusi_author')->nullable()
                ->comment('Number of institutions represented by authors in this issue');

            // Ordering for display
            $table->unsignedInteger('display_order')->default(0);

            $table->timestamps();

            // Indexes for performance
            $table->index('journal_assessment_id');
            $table->index(['year', 'month']);
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_journal_metadata');
    }
};
