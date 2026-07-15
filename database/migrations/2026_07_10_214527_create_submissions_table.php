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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel users (Author yang mengirimkan submisi)
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            // Relasi ke tabel journals (Target jurnal untuk submisi)
            $table->foreignId('journal_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('abstract'); // Kolom abstrak artikel
            $table->string('keywords'); // Kolom kata kunci (comma-separated atau JSON)
            
            // Opsi status baru sesuai dengan alur publikasi ilmiah
            $table->enum('status', [
                'draft',             // Baru dibuat, belum dikirim
                'submitted',         // Sudah dikirim ke pengelola jurnal
                'under_review',      // Sedang ditinjau oleh reviewer
                'revision_required', // Memerlukan revisi dari penulis
                'accepted',          // Diterima untuk dipublikasikan
                'rejected'           // Ditolak
            ])->default('submitted');

            $table->string('file_path')->nullable(); // Path file dokumen artikel (.doc/.docx/.pdf)
            $table->text('author_notes')->nullable(); // Catatan tambahan dari penulis
            
            $table->timestamps();
            $table->softDeletes(); // Disarankan jika model menggunakan SoftDeletes
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};