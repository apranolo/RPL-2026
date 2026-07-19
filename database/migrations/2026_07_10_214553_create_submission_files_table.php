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
        Schema::create('submission_files', function (Blueprint $table) {
            $table->id();

            // Relasi ke tabel submissions
            $table->foreignId('submission_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('file_name'); // Nama asli berkas (misal: "revisi_naskah.docx")
            $table->string('file_path'); // Path penyimpanan sistem (misal: "submissions/files/...")
            
            // Kolom kategori berkas sesuai kebutuhan publikasi ilmiah
            $table->enum('file_type', [
                'manuscript',          // Naskah utama (tanpa identitas penulis / blind review)
                'supplementary_file',  // Berkas pendukung (dataset, grafik tambahan, media)
                'title_page',          // Halaman judul (terdapat identitas penulis)
                'cover_letter',        // Surat pengantar untuk editor
                'ethical_statement',   // Pernyataan etik atau orisinalitas
                'revision_note'        // Catatan tanggapan atas masukan reviewer
            ])->default('manuscript');

            $table->string('mime_type')->nullable(); // Menyimpan tipe mime berkas (misal: application/pdf)
            $table->bigInteger('file_size')->nullable(); // Ukuran berkas dalam satuan bytes
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submission_files');
    }
};