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
        Schema::create('review_decisions', function (Blueprint $table): void {
            $table->id();

            $table->foreignId('reviewer_assignment_id')->constrained('reviewer_assignments')->cascadeOnDelete();
            $table->integer('score')->nullable();
            $table->string('recommendation')->nullable();
            $table->text('comment')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_decisions');
    }
};
