<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the evaluation_categories table (Level 1: Unsur Evaluasi).
     * Each category belongs to a template and contains sub-categories and essay questions.
     */
    public function up(): void
    {
        Schema::create('evaluation_categories', function (Blueprint $table) {
            $table->id();

            // Hierarchy
            $table->foreignId('template_id')
                ->constrained('accreditation_templates')
                ->cascadeOnDelete()
                ->comment('Foreign key to accreditation_templates');

            // Category Details
            $table->string('code', 20)->comment('Kode unsur, e.g., ADM, KON, EDT');
            $table->string('name', 255)->comment('Nama unsur, e.g., Kelengkapan Administrasi');
            $table->text('description')->nullable()->comment('Penjelasan detail unsur');

            // Weighting
            $table->decimal('weight', 5, 2)->default(0.00)
                ->comment('Bobot kategori (0-100), sum per template harus <= 100');

            // Ordering
            $table->integer('display_order')->default(0)->comment('Urutan tampilan');

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('template_id');
            $table->index('code');
            $table->index('display_order');

            // Unique Constraint: code must be unique within a template
            $table->unique(['template_id', 'code'], 'unique_code_per_template');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Drops foreign key constraint before dropping the table.
     * This ensures clean rollback without constraint violations.
     */
    public function down(): void
    {
        Schema::table('evaluation_categories', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['template_id']);
        });

        Schema::dropIfExists('evaluation_categories');
    }
};
