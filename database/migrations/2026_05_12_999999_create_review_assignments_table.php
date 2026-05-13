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
        Schema::create('review_assignments', function (Blueprint $table) {
            $table->id();

            // subject_id disimpan tanpa constraint dulu (FK ke table subject belum diketahui)
            $table->foreignId('subject_id');

            // reviewer_id diarahkan ke tabel users
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();

            // due_date nullable agar ReviewAssignmentController tidak error
            $table->date('due_date')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_assignments');
    }
};
