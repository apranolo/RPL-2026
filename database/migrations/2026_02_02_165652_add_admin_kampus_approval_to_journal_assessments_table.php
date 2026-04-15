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
        Schema::table('journal_assessments', function (Blueprint $table) {
            // Admin Kampus approval tracking fields
            $table->foreignId('admin_kampus_approved_by')->nullable()->after('status')
                ->constrained('users')->onDelete('set null')
                ->comment('Admin Kampus who approved/rejected the assessment');
            $table->timestamp('admin_kampus_approved_at')->nullable()->after('admin_kampus_approved_by')
                ->comment('Timestamp when Admin Kampus approved/rejected');
            $table->text('admin_kampus_approval_notes')->nullable()->after('admin_kampus_approved_at')
                ->comment('Notes from Admin Kampus on approval/rejection');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_assessments', function (Blueprint $table) {
            $table->dropForeign(['admin_kampus_approved_by']);
            $table->dropColumn([
                'admin_kampus_approved_by',
                'admin_kampus_approved_at',
                'admin_kampus_approval_notes',
            ]);
        });
    }
};
