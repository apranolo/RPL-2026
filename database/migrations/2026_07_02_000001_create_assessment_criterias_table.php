<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assessment_criterias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_id')->constrained('reviews')->cascadeOnDelete();
            $table->string('criterion');
            $table->unsignedTinyInteger('score')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessment_criterias');
    }
};