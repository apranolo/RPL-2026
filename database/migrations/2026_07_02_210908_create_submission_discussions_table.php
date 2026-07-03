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
        Schema::create('submission_discussions', function (Blueprint $table) {
            $table->id();

            // FK to submissions table.
            // Constraint will be added after Submission module is merged.
            $table->foreignId('submission_id');

            $table->string('stage')->default('editorial');

            $table->string('subject');

            $table->timestamps();

            $table->softDeletes();

            $table->index('submission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submission_discussions');
    }
};
