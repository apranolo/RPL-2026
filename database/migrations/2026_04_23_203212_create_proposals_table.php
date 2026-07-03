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
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // id_pengusul
            $table->foreignId('research_schema_id')->constrained('research_schemas')->cascadeOnDelete(); // id_skema_pendanaan
            $table->string('title'); // judul_penelitian
            $table->text('abstract'); // abstrak
            $table->text('background'); // latar_belakang
            $table->string('proposal_doc_path'); // file_dokumen_proposal
            $table->enum('status', ['Draft', 'Submitted', 'Administrasi_Valid', 'Ditolak'])->default('Draft'); // status_proposal
            $table->timestamp('submitted_at')->nullable(); // tanggal_pengajuan
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
