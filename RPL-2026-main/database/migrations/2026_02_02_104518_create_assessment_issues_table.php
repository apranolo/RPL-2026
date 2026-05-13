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
        Schema::create('assessment_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_assessment_id')
                ->constrained('journal_assessments')
                ->onDelete('cascade');
            $table->string('title', 200);
            $table->text('description');
            $table->enum('category', ['editorial', 'technical', 'content_quality', 'management']);
            $table->enum('priority', ['high', 'medium', 'low'])->default('medium');
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index('journal_assessment_id', 'idx_assessment');
            $table->index('priority', 'idx_priority');
            $table->index('category', 'idx_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_issues');
    }
};
