<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the essay_questions table for essay-type questions linked to categories.
     * Essays are different from indicators (pilihan ganda/scale) and are evaluated manually.
     *
     * Design Decision: Essays linked to category_id (Unsur), NOT sub_category_id,
     * because essays are general questions per Unsur, not specific to Sub-Unsur.
     */
    public function up(): void
    {
        Schema::create('essay_questions', function (Blueprint $table) {
            $table->id();

            // Hierarchy (linked to Category, not SubCategory)
            $table->foreignId('category_id')
                ->constrained('evaluation_categories')
                ->cascadeOnDelete()
                ->comment('Foreign key to evaluation_categories');

            // Question Details
            $table->string('code', 20)->comment('Kode essay, e.g., ESS-ADM-01');
            $table->text('question')->comment('Pertanyaan essay');
            $table->text('guidance')->nullable()->comment('Panduan/hint untuk menjawab');

            // Constraints
            $table->integer('max_words')->default(500)->comment('Maksimal jumlah kata');
            $table->boolean('is_required')->default(true)->comment('Wajib diisi atau opsional');

            // Ordering
            $table->integer('display_order')->default(0);

            // Status
            $table->boolean('is_active')->default(true);

            // Timestamps
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('category_id');
            $table->index('code');
            $table->index('is_active');
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
        Schema::table('essay_questions', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['category_id']);
        });

        Schema::dropIfExists('essay_questions');
    }
};
