<?php

/**
 * Migration: create_submissions_table
 *
 * ⚠️ CATATAN: Migration ini dibuat secara lokal untuk keperluan testing.
 * Jangan di-commit ke branch utama. Tunggu migration resmi dari Modul 2.
 */

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('journal_id')->constrained('journals')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            $table->string('title');
            $table->text('abstract')->nullable();
            $table->string('keywords')->nullable();

            $table->enum('status', ['draft', 'pending', 'approved', 'rejected'])->default('pending');

            $table->text('rejection_reason')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('journal_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};