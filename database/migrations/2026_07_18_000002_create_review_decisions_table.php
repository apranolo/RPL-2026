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
        if (! Schema::hasTable('review_decisions')) {
            Schema::create('review_decisions', function (Blueprint $table): void {
                $table->id();

                $table->foreignId('reviewer_assignment_id')->constrained('reviewer_assignments')->cascadeOnDelete();
                $table->integer('score')->nullable();
                $table->string('recommendation')->nullable();
                $table->text('comment')->nullable();

                $table->timestamps();
                $table->softDeletes();
            });
        } else {
            Schema::table('review_decisions', function (Blueprint $table): void {
                if (! Schema::hasColumn('review_decisions', 'reviewer_assignment_id')) {
                    $table->foreignId('reviewer_assignment_id')->nullable()->constrained('reviewer_assignments')->cascadeOnDelete();
                }
                if (! Schema::hasColumn('review_decisions', 'score')) {
                    $table->integer('score')->nullable();
                }
                if (! Schema::hasColumn('review_decisions', 'recommendation')) {
                    $table->string('recommendation')->nullable();
                }
                if (! Schema::hasColumn('review_decisions', 'comment')) {
                    $table->text('comment')->nullable();
                }
                if (! Schema::hasColumn('review_decisions', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_decisions');
    }
};
