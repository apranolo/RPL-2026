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
        Schema::create('assessment_responses', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('journal_assessment_id')->constrained('journal_assessments')->cascadeOnDelete();
            $table->foreignId('evaluation_indicator_id')->constrained('evaluation_indicators')->cascadeOnDelete();

            // Response
            $table->boolean('answer_boolean')->nullable(); // Untuk answer_type: boolean (Ya/Tidak)
            $table->tinyInteger('answer_scale')->nullable(); // Untuk answer_type: scale (1-5)
            $table->text('answer_text')->nullable(); // Untuk answer_type: text

            // Scoring
            $table->decimal('score', 5, 2)->default(0.00); // Skor untuk jawaban ini

            // Notes
            $table->text('notes')->nullable(); // Catatan tambahan dari User

            $table->timestamps();

            // Indexes
            $table->index('journal_assessment_id');
            $table->index('evaluation_indicator_id');

            // Unique Constraint (satu indikator hanya dijawab 1x per assessment)
            $table->unique(['journal_assessment_id', 'evaluation_indicator_id'], 'unique_assessment_indicator');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_responses');
    }
};
