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
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_outputs');
    }
};
