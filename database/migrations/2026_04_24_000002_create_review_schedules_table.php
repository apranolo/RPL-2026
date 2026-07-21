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
        Schema::create('review_schedules', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('proposal_id')
                ->constrained('proposals')
                ->cascadeOnDelete();
            $table->foreignId('reviewer_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('assigned_by')
                ->constrained('users')
                ->cascadeOnDelete();

            // Timeline & dates
            $table->timestamp('assigned_at')->useCurrent();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Status
            $table->string('status')->default('assigned'); // assigned, in_progress, completed

            $table->timestamps();

            // Indexes
            $table->index('proposal_id');
            $table->index('reviewer_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_schedules');
    }
};
