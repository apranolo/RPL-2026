<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * 1. Buat proposal_id nullable — produk/prototipe tidak selalu terhubung ke proposal.
 * 2. Perluas enum `status` agar mencakup nilai yang digunakan form Produk/Prototipe:
 *    'published' dan 'patented' (selain 'draft', 'submitted', 'approved', 'rejected').
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('research_outputs')) {
            // ── 1. Buat proposal_id nullable ──────────────────────────────────────
            Schema::table('research_outputs', function (Blueprint $table) {
                // Drop foreign key dulu sebelum mengubah kolom
                $table->unsignedBigInteger('proposal_id')->nullable()->change();
            });
        }

        // ── 2. Perbarui enum status (MySQL tidak mendukung ALTER ENUM via Blueprint) ──
        // Gunakan raw SQL agar bisa mengubah nilai enum secara aman.
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("
                ALTER TABLE research_outputs
                MODIFY COLUMN status ENUM(
                    'draft',
                    'submitted',
                    'approved',
                    'rejected',
                    'published',
                    'patented'
                ) NOT NULL DEFAULT 'draft'
            ");
        }
    }

    public function down(): void
    {
        // Kembalikan proposal_id ke NOT NULL
        Schema::table('research_outputs', function (Blueprint $table) {
            $table->unsignedBigInteger('proposal_id')->nullable(false)->change();
        });

        // Kembalikan enum status ke nilai semula
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("
                ALTER TABLE research_outputs
                MODIFY COLUMN status ENUM(
                    'draft',
                    'submitted',
                    'approved',
                    'rejected'
                ) NOT NULL DEFAULT 'draft'
            ");
        }
    }
};
