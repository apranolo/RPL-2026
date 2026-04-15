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
        Schema::create('journals', function (Blueprint $table) {
            $table->id();

            // Ownership
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            // Pengelola jurnal (User)
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();

            // Basic Info
            $table->string('title'); // Nama jurnal
            $table->string('issn', 20)->nullable(); // ISSN cetak
            $table->string('e_issn', 20)->nullable(); // ISSN elektronik

            // Publication Details
            $table->string('url', 500)->nullable(); // URL jurnal
            $table->string('publisher')->nullable(); // Penerbit
            $table->string('frequency', 50)->nullable(); // Frekuensi terbit: Bulanan, Triwulan, dll
            $table->year('first_published_year')->nullable(); // Tahun terbit pertama

            // Classification
            $table->foreignId('scientific_field_id')->nullable()->constrained('scientific_fields')->nullOnDelete();

            // Indexing & Accreditation
            $table->tinyInteger('sinta_rank')->nullable(); // 1-6, atau NULL jika belum terindeks
            $table->string('accreditation_status', 50)->nullable(); // Terakreditasi/Belum
            $table->string('accreditation_grade', 10)->nullable(); // S1, S2, S3, S4

            // Contact
            $table->string('editor_in_chief')->nullable();
            $table->string('email')->nullable();

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('university_id');
            $table->index('user_id');
            $table->index('scientific_field_id');
            $table->index('sinta_rank');
            $table->index('title');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('journals');
    }
};
