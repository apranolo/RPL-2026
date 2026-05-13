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
            // Add fields for Dikti reviewer assignment tracking
            $table->foreignId('assigned_by')->nullable()->after('admin_kampus_approval_notes')
                ->constrained('users')->onDelete('set null')
                ->comment('Dikti user who assigned the reviewer');
            $table->timestamp('assigned_at')->nullable()->after('assigned_by')
                ->comment('Timestamp when reviewer was assigned');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_assessments', function (Blueprint $table) {
            $table->dropForeign(['assigned_by']);
            $table->dropColumn(['assigned_by', 'assigned_at']);
        });
    }
};
