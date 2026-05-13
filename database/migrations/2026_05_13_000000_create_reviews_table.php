<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_assignment_id')->constrained('review_assignments')->cascadeOnDelete();
            $table->string('criterion_name');
            $table->integer('score')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['review_assignment_id', 'criterion_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};