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
        if (! Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();

                // Foreign keys
                $table->foreignId('proposal_id')
                    ->constrained('proposals')
                    ->cascadeOnDelete();
                $table->foreignId('reviewer_id')
                    ->constrained('users')
                    ->cascadeOnDelete();

                // Review details
                $table->decimal('score', 5, 2)->default(0);
                $table->text('feedback')->nullable();
                $table->string('recommendation')->nullable(); // Diterima, Ditolak, Revisi

                // Timeline
                $table->timestamp('reviewed_at')->nullable();

                $table->timestamps();

                // Indexes
                $table->index('proposal_id');
                $table->index('reviewer_id');
                $table->index('reviewed_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
