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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('journal_id')
                ->constrained('journals')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('generated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Core fields
            $table->string('contract_number', 50)->unique();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->decimal('value', 15, 2)->nullable();

            // Period
            $table->date('start_date');
            $table->date('end_date');

            // Status: draft | aktif | selesai | batal
            $table->string('status', 20)->default('draft');

            // Audit
            $table->timestamp('generated_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            // Indexes for common queries
            $table->index('status');
            $table->index('journal_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
