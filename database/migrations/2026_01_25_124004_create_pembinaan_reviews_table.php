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
        Schema::create('pembinaan_reviews', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('registration_id')
                ->constrained('pembinaan_registrations')
                ->cascadeOnDelete();
            $table->foreignId('reviewer_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Review content
            $table->decimal('score', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->text('recommendation')->nullable();

            // Review time
            $table->timestamp('reviewed_at')->useCurrent();

            // Audit fields
            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('deleted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('registration_id');
            $table->index('reviewer_id');
            $table->index('reviewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembinaan_reviews');
    }
};
