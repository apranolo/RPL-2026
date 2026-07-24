<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('review_decisions')) {
            Schema::create('review_decisions', function (Blueprint $table) {
                $table->id();

                $table->unsignedBigInteger('review_assignment_id');

                $table->foreignId('reviewer_id')
                    ->constrained('users')
                    ->cascadeOnDelete();

                $table->string('recommendation')->nullable();

                $table->json('scores')->nullable();

                $table->text('overall_comment')->nullable();

                $table->boolean('is_submitted')
                    ->default(false);

                $table->timestamp('submitted_at')
                    ->nullable();

                $table->timestamps();
            });
        }
    }

    /**
     * Reverse migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_decisions');
    }
};
