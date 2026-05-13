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
        Schema::create('journal_assessments', function (Blueprint $table) {
            $table->id();

            // Ownership
            $table->foreignId('journal_id')->constrained('journals')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()
                ->comment('User yang mengisi assessment');

            // Assessment Info
            $table->date('assessment_date')->useCurrent();
            $table->string('period', 20)->nullable(); // Periode penilaian, e.g., '2025-Q3'

            // Status
            $table->enum('status', ['draft', 'submitted', 'reviewed'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete()
                ->comment('Admin yang review (untuk v1.1+)');

            // Scoring
            $table->decimal('total_score', 5, 2)->default(0.00); // Skor total
            $table->decimal('max_score', 5, 2)->default(0.00); // Skor maksimal
            $table->decimal('percentage', 5, 2)->default(0.00); // Persentase (total/max * 100)

            // Notes
            $table->text('notes')->nullable(); // Catatan dari User
            $table->text('admin_notes')->nullable(); // Catatan dari Admin (untuk v1.1+)

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('journal_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('assessment_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_assessments');
    }
};
