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
        Schema::create('reviewer_assignments', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('reviewer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('registration_id')
                ->constrained('pembinaan_registrations')
                ->cascadeOnDelete();

            // Assignment info
            $table->foreignId('assigned_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->timestamp('assigned_at')->useCurrent();

            // Status
            $table->enum('status', ['assigned', 'in_progress', 'completed'])->default('assigned');

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
            $table->index('reviewer_id');
            $table->index('registration_id');
            $table->index('status');
            $table->index('assigned_at');

            // Unique constraint: one reviewer per registration
            $table->unique(['reviewer_id', 'registration_id'], 'unique_reviewer_registration');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviewer_assignments');
    }
};
