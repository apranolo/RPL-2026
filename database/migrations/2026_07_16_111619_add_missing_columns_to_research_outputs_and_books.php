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
        Schema::table('research_outputs', function (Blueprint $table) {
            $table->string('penulis_atau_pencipta')->nullable()->after('tahun_capaian');
            $table->string('tautan_publikasi')->nullable()->after('keterangan');
        });

        Schema::table('book_outputs', function (Blueprint $table) {
            $table->string('tipe_buku')->nullable()->after('pages');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('book_outputs', function (Blueprint $table) {
            $table->dropColumn('tipe_buku');
        });

        Schema::table('research_outputs', function (Blueprint $table) {
            $table->dropColumn(['penulis_atau_pencipta', 'tautan_publikasi']);
        });
    }
};
