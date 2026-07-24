<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('review_schedules')) {
            Schema::create('review_schedules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('proposal_id')
                    ->constrained('journal_assessments')
                    ->cascadeOnDelete();
                $table->foreignId('reviewer_id')
                    ->constrained('users')
                    ->cascadeOnDelete();
                $table->dateTime('scheduled_at');
                $table->dateTime('ended_at')->nullable();
                $table->string('location')->nullable();
                $table->string('meeting_link')->nullable();
                $table->text('notes')->nullable();
                $table->string('status')->default('scheduled');
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->softDeletes();

                $table->index('status');
                $table->index('scheduled_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('review_schedules');
    }
};
