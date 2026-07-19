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
        Schema::create('research_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('jenis_luaran', [
                'Jurnal',
                'Buku',
                'HKI',
                'Produk',
            ]);
            $table->string('judul_luaran');
            $table->integer('tahun_capaian')->nullable();
            $table->string('file_sertifikat_atau_cover')->nullable();
            $table->enum('status_verifikasi', ['Draft', 'Menunggu_Verifikasi', 'Terverifikasi_LPPM', 'Ditolak'])->default('Draft');
            $table->text('keterangan')->nullable();

            // Polymorphic relation
            $table->nullableMorphs('outputable');

            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('journal_outputs', function (Blueprint $table) {
            $table->id();
            $table->string('doi')->nullable();
            $table->string('journal_name')->nullable();
            $table->string('volume')->nullable();
            $table->string('number')->nullable();
            $table->string('url')->nullable();
            $table->timestamps();
        });

        Schema::create('book_outputs', function (Blueprint $table) {
            $table->id();
            $table->string('isbn')->nullable();
            $table->string('publisher')->nullable();
            $table->integer('pages')->nullable();
            $table->timestamps();
        });

        Schema::create('hki_outputs', function (Blueprint $table) {
            $table->id();
            $table->string('patent_number')->nullable();
            $table->string('patent_type')->nullable();
            $table->text('inventors')->nullable();
            $table->timestamps();
        });

        Schema::create('product_outputs', function (Blueprint $table) {
            $table->id();
            $table->string('partner_institution')->nullable();
            $table->text('benefits_description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_outputs');
        Schema::dropIfExists('hki_outputs');
        Schema::dropIfExists('book_outputs');
        Schema::dropIfExists('journal_outputs');
        Schema::dropIfExists('research_outputs');
    }
};
