<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->cascadeOnDelete();
            // Menghubungkan ke tabel users (author/pembuat pengajuan)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->json('keywords')->nullable();
            $table->string('language', 10)->default('id');
            // Status pengajuan sesuai PRD Modul 2 & OJS Wizard
            $table->enum('status', [
                'Draft',
                'Submitted',
                'In_Review',
                'Copyediting',
                'Production',
                'Published',
                'Declined',
                'draft',      // keep lowercase for compatibility with other modules
                'pending',    // keep for compatibility
                'approved',   // keep for compatibility
                'rejected'    // keep for compatibility
            ])->default('Draft');
            $table->text('rejection_reason')->nullable(); // Alasan jika ditolak
            $table->timestamps();
            $table->softDeletes();

            $table->index('journal_id');
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};