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
        Schema::create('pembinaan_registrations', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('pembinaan_id')
                ->constrained('pembinaan')
                ->cascadeOnDelete();
            $table->foreignId('journal_id')
                ->constrained('journals')
                ->cascadeOnDelete();
            $table->foreignId('user_id') // Pengelola who registered
                ->constrained('users')
                ->cascadeOnDelete();

            // Registration status
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            // Registration time
            $table->timestamp('registered_at')->useCurrent();

            // Review info
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->text('rejection_reason')->nullable();

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
            $table->index('status');
            $table->index('registered_at');

            // Unique constraint: one journal per pembinaan
            $table->unique(['pembinaan_id', 'journal_id'], 'unique_pembinaan_journal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembinaan_registrations');
    }
};
