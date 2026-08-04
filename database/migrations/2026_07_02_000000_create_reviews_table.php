<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('reviews')) {
            Schema::create('reviews', function (Blueprint $table) {
                $table->id();
                $table->foreignId('proposal_id')->constrained('proposals')->cascadeOnDelete();
                $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
                $table->decimal('score', 5, 2)->default(0);
                $table->text('feedback')->nullable();
                $table->string('status')->default('pending');
                $table->text('notes')->nullable();
                $table->timestamp('start_date')->nullable();
                $table->timestamp('end_date')->nullable();
                $table->decimal('total_score', 8, 2)->unsigned()->nullable();
                $table->string('recommendation')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamps();
            });
        } else {
            Schema::table('reviews', function (Blueprint $table) {
                if (! Schema::hasColumn('reviews', 'score')) {
                    $table->decimal('score', 5, 2)->default(0);
                }
                if (! Schema::hasColumn('reviews', 'feedback')) {
                    $table->text('feedback')->nullable();
                }
                if (! Schema::hasColumn('reviews', 'status')) {
                    $table->string('status')->default('pending');
                }
                if (! Schema::hasColumn('reviews', 'notes')) {
                    $table->text('notes')->nullable();
                }
                if (! Schema::hasColumn('reviews', 'start_date')) {
                    $table->timestamp('start_date')->nullable();
                }
                if (! Schema::hasColumn('reviews', 'end_date')) {
                    $table->timestamp('end_date')->nullable();
                }
                if (! Schema::hasColumn('reviews', 'total_score')) {
                    $table->decimal('total_score', 8, 2)->unsigned()->nullable();
                }
                if (! Schema::hasColumn('reviews', 'reviewed_at')) {
                    $table->timestamp('reviewed_at')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
