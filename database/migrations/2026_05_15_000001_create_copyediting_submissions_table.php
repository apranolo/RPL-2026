<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('copyediting_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->foreignId('copyeditor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('author_id')->constrained('users')->onDelete('cascade');

            $table->string('original_file_path')->nullable();
            $table->string('original_file_name')->nullable();

            $table->string('copyedited_file_path')->nullable();
            $table->string('copyedited_file_name')->nullable();

            $table->text('copyeditor_notes')->nullable();

            $table->enum('status', [
                'pending',
                'copyediting',
                'waiting_approval',
                'approved',
                'rejected',
            ])->default('pending');

            $table->text('author_approval_notes')->nullable();
            $table->timestamp('author_approved_at')->nullable();
            $table->timestamp('copyedited_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('copyediting_submissions');
    }
};
