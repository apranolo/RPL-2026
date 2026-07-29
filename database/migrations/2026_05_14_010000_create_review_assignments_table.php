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

            // Relasi ke tabel submissions (Tugas Dzaky di Tab 2)
            $table->unsignedBigInteger('submission_id');

            // Relasi ke tabel users milik Kelas B (Harus presisi menunjuk ke 'users')
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();

            // Menyimpan putaran ronde review (misal: 1 untuk ronde pertama, 2 untuk revisi)
            $table->integer('round')->default(1);

            // Status dari undangan review
            $table->enum('status', ['Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled'])->default('Pending');

            // Batas waktu review (nullable karena mungkin baru diset setelah Accepted)
            $table->date('due_date')->nullable();

            // Alasan jika statusnya 'Declined'
            $table->text('decline_reason')->nullable();

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
