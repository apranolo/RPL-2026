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
            // Add kategori_diusulkan field (e.g., Sinta 1-6, Scopus, WoS, DOAJ)
            $table->string('kategori_diusulkan', 50)->nullable()->after('notes');

            // Add aggregate counts at assessment level
            $table->unsignedInteger('jumlah_editor')->nullable()->after('kategori_diusulkan')
                ->comment('Total number of editors across all issues');
            $table->unsignedInteger('jumlah_reviewer')->nullable()->after('jumlah_editor')
                ->comment('Total number of reviewers across all issues');
            $table->unsignedInteger('jumlah_author')->nullable()->after('jumlah_reviewer')
                ->comment('Total number of authors across all issues');

            // Add aggregate institution counts for cross-validation consistency
            $table->unsignedInteger('jumlah_institusi_editor')->nullable()->after('jumlah_author')
                ->comment('Total institutions with editors');
            $table->unsignedInteger('jumlah_institusi_reviewer')->nullable()->after('jumlah_institusi_editor')
                ->comment('Total institutions with reviewers');
            $table->unsignedInteger('jumlah_institusi_author')->nullable()->after('jumlah_institusi_reviewer')
                ->comment('Total institutions with authors');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_assessments', function (Blueprint $table) {
            $table->dropColumn([
                'kategori_diusulkan',
                'jumlah_editor',
                'jumlah_reviewer',
                'jumlah_author',
                'jumlah_institusi_editor',
                'jumlah_institusi_reviewer',
                'jumlah_institusi_author',
            ]);
        });
    }
};
