<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Buat tabel `outputs` — tabel tunggal yang digunakan oleh model ResearchOutput.
     *
     * Mencakup:
     *  - Kolom dasar luaran (kategori, judul, status, keterangan, file_path)
     *  - Kolom spesifik Produk/Prototipe (tkt_level, version, year, url,
     *    cover_image, document)
     *  - Relasi ke User dan Proposal (nullable)
     *  - Soft Deletes
     */
    public function up(): void
    {
        Schema::create('outputs', function (Blueprint $table) {
            $table->id();

            // ── Relasi ──────────────────────────────────────────────────────────
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('proposal_id')->nullable();

            // ── Kolom Dasar Luaran ───────────────────────────────────────────────
            $table->string('kategori', 50);
            $table->string('judul', 255);
            $table->text('keterangan')->nullable();
            $table->string('file_path', 255)->nullable();
            $table->enum('status', [
                'draft',
                'submitted',
                'approved',
                'rejected',
                'published',
                'patented',
            ])->default('draft');

            // ── Kolom Produk / Prototipe ─────────────────────────────────────────
            // user_id selalu diikat ke Auth::id() di controller (RBAC).
            $table->integer('tkt_level')->nullable();          // TKT 1–9
            $table->string('version', 50)->nullable();         // mis. v1.0, v2.3
            $table->integer('year')->nullable();               // tahun capaian
            $table->string('url', 2048)->nullable();           // URL referensi / repositori
            $table->string('cover_image', 255)->nullable();    // path relatif di public disk
            $table->string('document', 255)->nullable();       // path relatif di public disk

            // ── Polymorphic (untuk HKI/Buku jika masih digunakan) ───────────────
            $table->nullableMorphs('outputable');

            // ── Meta ────────────────────────────────────────────────────────────
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outputs');
    }
};
