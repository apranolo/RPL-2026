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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained('journals')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 500);
            $table->text('abstract')->nullable();
            $table->string('authors_display')->nullable()->comment('Comma-separated author names for display');
            $table->string('file_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->enum('status', [
                'submitted',
                'under_review',
                'revision_required',
                'accepted',
                'rejected',
                'withdrawn',
            ])->default('submitted');
            $table->timestamp('submitted_at')->nullable();
            $table->text('cover_letter')->nullable();
            $table->json('keywords')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('journal_id');
            $table->index('author_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
