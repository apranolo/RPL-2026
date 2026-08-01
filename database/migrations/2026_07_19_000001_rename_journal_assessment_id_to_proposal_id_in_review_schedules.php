<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('review_schedules', 'journal_assessment_id')) {
            Schema::table('review_schedules', function (Blueprint $table) {
                $table->dropForeign(['journal_assessment_id']);
                $table->renameColumn('journal_assessment_id', 'proposal_id');
                $table->foreign('proposal_id')
                    ->references('id')
                    ->on('journal_assessments')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('review_schedules', function (Blueprint $table) {
            $table->dropForeign(['proposal_id']);
            $table->renameColumn('proposal_id', 'journal_assessment_id');
            $table->foreign('journal_assessment_id')
                ->references('id')
                ->on('journal_assessments')
                ->cascadeOnDelete();
        });
    }
};
