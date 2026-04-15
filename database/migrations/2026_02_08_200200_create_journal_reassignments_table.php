<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Create journal_reassignments table for audit trail of journal manager changes.
     * Tracks when LPPM reassigns a journal from one user to another within the same university.
     *
     * Key requirements:
     * - Log all journal ownership transfers
     * - Preserve history even if users are deleted (nullable FKs)
     * - No soft deletes (audit log should be permanent)
     * - Optional reason field for documentation
     */
    public function up(): void
    {
        Schema::create('journal_reassignments', function (Blueprint $table) {
            $table->id();

            // Journal being reassigned (CASCADE: delete audit if journal deleted)
            $table->foreignId('journal_id')
                ->constrained('journals')
                ->onDelete('cascade')
                ->comment('Journal being reassigned');

            // Previous journal manager (NULL: preserve audit if user deleted)
            $table->foreignId('from_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('Previous journal manager');

            // New journal manager (NULL: preserve audit if user deleted)
            $table->foreignId('to_user_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('New journal manager');

            // LPPM admin who performed reassignment (NULL: preserve audit if admin deleted)
            $table->foreignId('reassigned_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null')
                ->comment('LPPM admin who performed the reassignment');

            // Optional reason for reassignment
            $table->text('reason')
                ->nullable()
                ->comment('Optional reason for reassignment (e.g., user leaving university)');

            $table->timestamps();

            // Add indexes for common query patterns
            $table->index('journal_id'); // Query history by journal
            $table->index('from_user_id'); // Query transfers from a user
            $table->index('to_user_id'); // Query transfers to a user
            $table->index('reassigned_by'); // Query reassignments by LPPM
            $table->index('created_at'); // Sort by date
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journal_reassignments');
    }
};
