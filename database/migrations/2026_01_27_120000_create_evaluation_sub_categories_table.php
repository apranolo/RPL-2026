<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the evaluation_sub_categories table (Level 2: Sub-Unsur).
     * Each sub-category belongs to a category and contains indicators.
     */
    public function up(): void
    {
        Schema::create('evaluation_sub_categories', function (Blueprint $table) {
            $table->id();

            // Hierarchy
            $table->foreignId('category_id')
                ->constrained('evaluation_categories')
                ->cascadeOnDelete()
                ->comment('Foreign key to evaluation_categories');

            // Sub-Category Details
            $table->string('code', 20)->comment('Kode sub-unsur, e.g., ADM-ID, KON-PEER');
            $table->string('name', 255)->comment('Nama sub-unsur, e.g., Identitas Jurnal');
            $table->text('description')->nullable();

            // Ordering
            $table->integer('display_order')->default(0);

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('category_id');
            $table->index('code');
            $table->index('display_order');

            // Unique Constraint: code must be unique within a category
            $table->unique(['category_id', 'code'], 'unique_code_per_category');
        });
    }

    /**
     * Reverse the migrations.
     *
     * Drops foreign key constraint before dropping the table.
     */
    public function down(): void
    {
        Schema::table('evaluation_sub_categories', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['category_id']);
        });

        Schema::dropIfExists('evaluation_sub_categories');
    }
};
