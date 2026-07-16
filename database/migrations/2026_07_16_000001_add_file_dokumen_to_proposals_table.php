<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Menambahkan kolom file_dokumen_proposal ke tabel proposals.
 *
 * Kolom ini diperlukan untuk menyimpan path file dokumen proposal
 * yang diunggah oleh dosen pengusul.
 *
 * Catatan: Kolom ini sudah ada di migration create_proposals_table
 * versi baru (2026_05_13), namun migration lama (2026_04_23)
 * yang sudah dieksekusi belum memiliki kolom ini.
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            if (! Schema::hasColumn('proposals', 'file_dokumen_proposal')) {
                $table->string('file_dokumen_proposal')->nullable()->after('rejection_reason');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            if (Schema::hasColumn('proposals', 'file_dokumen_proposal')) {
                $table->dropColumn('file_dokumen_proposal');
            }
        });
    }
};
