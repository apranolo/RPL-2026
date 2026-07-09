<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plagiarism_checks', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('submission_id')->index();

            $table->decimal('similarity_score', 5, 2)->nullable();
            $table->timestamp('checked_at')->nullable();
            $table->string('report_file_path')->nullable();
            $table->json('source_breakdown')->nullable();
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plagiarism_checks');
    }
};