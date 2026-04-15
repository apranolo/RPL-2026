<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the top-level template table for hierarchical borang indikator management.
     * Supports two types: 'akreditasi' (BAN-PT) and 'indeksasi' (Scopus/Sinta).
     */
    public function up(): void
    {
        Schema::create('accreditation_templates', function (Blueprint $table) {
            $table->id();

            // Template Info
            $table->string('name', 255)->comment('e.g., BAN-PT 2024 - Akreditasi, Scopus 2024 - Indeksasi');
            $table->text('description')->nullable()->comment('Deskripsi lengkap template');
            $table->string('version', 20)->nullable()->comment('Versi template, e.g., v1.0, v2.1');

            // Template Type
            $table->enum('type', ['akreditasi', 'indeksasi'])->comment('Kategori template');

            // Status
            $table->boolean('is_active')->default(true)->comment('Template aktif untuk digunakan');
            $table->date('effective_date')->nullable()->comment('Tanggal mulai berlaku');

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('type');
            $table->index('is_active');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Drops the accreditation_templates table.
     * NOTE: This will cascade delete all related categories, sub-categories, and indicators
     * due to foreign key constraints defined in child tables.
     */
    public function down(): void
    {
        Schema::dropIfExists('accreditation_templates');
    }
};
