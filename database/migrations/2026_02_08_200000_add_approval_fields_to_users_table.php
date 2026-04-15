<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Add approval workflow fields to users table:
     * - approval_status: ENUM for workflow state (pending → approved/rejected)
     * - approved_by: FK to users (LPPM/Dikti who approved)
     * - approved_at: Timestamp of approval/rejection
     * - rejection_reason: TEXT explaining rejection
     *
     * Existing users default to 'approved' to maintain continuity.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add approval status field after is_active
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])
                ->default('approved')
                ->after('is_active')
                ->comment('User registration approval status');

            // Add foreign key to user who approved/rejected
            $table->foreignId('approved_by')
                ->nullable()
                ->after('approval_status')
                ->constrained('users')
                ->onDelete('set null')
                ->comment('LPPM or Dikti admin who approved/rejected registration');

            // Add approval timestamp
            $table->timestamp('approved_at')
                ->nullable()
                ->after('approved_by')
                ->comment('Timestamp when user was approved/rejected');

            // Add rejection reason field
            $table->text('rejection_reason')
                ->nullable()
                ->after('approved_at')
                ->comment('Reason for rejection if approval_status is rejected');

            // Add index for filtering by approval status
            $table->index('approval_status');
        });

        // Update existing users to 'approved' status to maintain continuity
        // This ensures existing users remain functional after migration
        DB::table('users')->update(['approval_status' => 'approved']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['approved_by']);

            // Drop index
            $table->dropIndex(['approval_status']);

            // Drop columns
            $table->dropColumn([
                'approval_status',
                'approved_by',
                'approved_at',
                'rejection_reason',
            ]);
        });
    }
};
