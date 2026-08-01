<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `proposals` table as specified in Modul 1 (Manajemen Proposal Penelitian)
     * of the Sistem Penelitian Terintegrasi PRD.
     */
    public function up(): void
    {
        if (! Schema::hasTable('proposals')) {
            Schema::create('proposals', function (Blueprint $table) {
                $table->id();

                // Foreign keys
                $table->foreignId('id_pengusul')   // Peneliti/Dosen who submitted
                    ->constrained('users')
                    ->cascadeOnDelete();

                $table->foreignId('id_skema_pendanaan')  // Funding scheme
                    ->nullable()
                    ->constrained('skema_pendanaan')
                    ->nullOnDelete();

                // Core proposal fields
                $table->string('judul_penelitian', 255);
                $table->text('abstrak');
                $table->text('latar_belakang');
                $table->string('file_dokumen_proposal')->nullable(); // PDF path

                // Status per PRD: Draft, Submitted, Administrasi_Valid, Ditolak
                $table->enum('status_proposal', [
                    'draft',
                    'submitted',
                    'administrasi_valid',
                    'ditolak',
                ])->default('draft');

                $table->date('tanggal_pengajuan')->nullable(); // Auto-set on submit

                // Total funding approved (linked to Modul 3 Kontrak)
                $table->decimal('total_pendanaan_disetujui', 15, 2)->nullable();

                // Soft-delete support
                $table->foreignId('deleted_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();

                $table->timestamps();
                $table->softDeletes();

                // Indexes
                $table->index('status_proposal');
                $table->index('tanggal_pengajuan');
                $table->index('id_pengusul');

                // Unique: no duplicate titles for the same proposer within a year
                $table->unique(['id_pengusul', 'judul_penelitian'], 'unique_pengusul_judul');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposals');
    }
};
