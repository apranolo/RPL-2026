<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_submission')->nullable()->constrained('articles')->nullOnDelete();
            $table->foreignId('id_reviewer')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recommendation')->nullable();
            $table->text('comments')->nullable();
            $table->text('comments_private')->nullable();
            $table->integer('score_originality')->nullable();
            $table->integer('score_methodology')->nullable();
            $table->integer('score_writing')->nullable();
            $table->integer('score_relevance')->nullable();
            $table->integer('score_conclusion')->nullable();
            $table->decimal('score_aggregate', 4, 2)->nullable();
            $table->enum('status', ['Pending', 'Submitted'])->default('Pending');
            $table->date('date_decided')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_decisions');
    }
};
