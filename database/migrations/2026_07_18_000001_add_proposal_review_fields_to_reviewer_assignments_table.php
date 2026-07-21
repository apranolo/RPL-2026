<?php

/**
 * MOCK LOKAL - hapus setelah model resmi ReviewerAssignment (modul Pembinaan)
 * diubah atau digabung dengan kebutuhan modul Review Proposal.
 *
 * Menambahkan kolom proposal_id dan due_date ke tabel reviewer_assignments
 * yang sudah ada, untuk mendukung alur review proposal multi-reviewer.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviewer_assignments', function (Blueprint $table) {
            if (! Schema::hasColumn('reviewer_assignments', 'proposal_id')) {
                $table->foreignId('proposal_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('proposals')
                    ->cascadeOnDelete();
            }

            if (! Schema::hasColumn('reviewer_assignments', 'due_date')) {
                $table->date('due_date')->nullable()->after('proposal_id');
            }
        });

        // Make registration_id and assigned_by nullable to support proposal-review assignments
        // (these fields are Pembinaan-specific and may not exist on proposal review rows)
        \Illuminate\Support\Facades\DB::statement(
            'PRAGMA foreign_keys = OFF'
        );
        Schema::table('reviewer_assignments', function (Blueprint $table) {
            $table->foreignId('registration_id')
                ->nullable()
                ->change();
            $table->foreignId('assigned_by')
                ->nullable()
                ->change();
        });
        \Illuminate\Support\Facades\DB::statement(
            'PRAGMA foreign_keys = ON'
        );
    }

    public function down(): void
    {
        Schema::table('reviewer_assignments', function (Blueprint $table) {
            if (Schema::hasColumn('reviewer_assignments', 'proposal_id')) {
                $table->dropForeign(['proposal_id']);
                $table->dropColumn('proposal_id');
            }

            if (Schema::hasColumn('reviewer_assignments', 'due_date')) {
                $table->dropColumn('due_date');
            }
        });
    }
};
