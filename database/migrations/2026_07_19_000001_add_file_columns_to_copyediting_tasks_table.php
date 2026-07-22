<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Adds the file-path and author-approval columns that the copyediting
     * upload/approval workflow (CopyeditingTask model & CopyeditingController)
     * relies on, but which are missing from the official
     * 2026_05_13_233035_create_copyediting_tasks_table migration (owned by
     * Septian Eko, PR #87). This is an additive migration so it does not
     * touch or duplicate that table definition.
     */
    public function up(): void
    {
        Schema::table('copyediting_tasks', function (Blueprint $table) {
            $table->string('original_file_path')->nullable()->after('copyeditor_note');
            $table->string('original_file_name')->nullable()->after('original_file_path');
            $table->string('copyedited_file_path')->nullable()->after('original_file_name');
            $table->string('copyedited_file_name')->nullable()->after('copyedited_file_path');
            $table->text('author_approval_notes')->nullable()->after('copyedited_file_name');
            $table->timestamp('author_approved_at')->nullable()->after('author_approval_notes');
        });
    }

    public function down(): void
    {
        Schema::table('copyediting_tasks', function (Blueprint $table) {
            $table->dropColumn([
                'original_file_path',
                'original_file_name',
                'copyedited_file_path',
                'copyedited_file_name',
                'author_approval_notes',
                'author_approved_at',
            ]);
        });
    }
};
