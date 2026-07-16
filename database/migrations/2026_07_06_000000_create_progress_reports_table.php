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
        Schema::create('progress_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('university_id');
            $table->string('judul_penelitian');
            $table->string('nama_dosen');
            $table->string('fakultas');
            $table->integer('progres');
            $table->string('status'); // Selesai, Berjalan, Tertunda
            $table->bigInteger('anggaran');
            $table->bigInteger('anggaran_terserap');
            $table->integer('skor_kinerja')->default(0);
            $table->date('tanggal_update');
            $table->timestamps();

            $table->foreign('university_id')
                ->references('id')
                ->on('universities')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('progress_reports');
    }
};
