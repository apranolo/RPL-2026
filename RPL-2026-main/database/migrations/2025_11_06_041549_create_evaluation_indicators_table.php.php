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
        Schema::create('evaluation_indicators', function (Blueprint $table) {
            $table->id();

            // Hierarchy: Category > Sub-Category >
            $table->string('category', 100); // Kategori utama, e.g., Kelengkapan Administrasi
            $table->string('sub_category', 100)->nullable(); // Sub-kategori (optional)

            // Indicator Details
            $table->string('code', 20)->unique(); // Kode indikator, e.g., ADM-01
            $table->text('question'); // Pertanyaan indikator
            $table->text('description')->nullable(); // Penjelasan detail

            // Scoring
            $table->decimal('weight', 5, 2)->default(1.00); // Bobot penilaian
            $table->enum('answer_type', ['boolean', 'scale', 'text'])->default('boolean'); // boolean: Ya/Tidak, scale: 1-5, text: input bebas

            // Attachment
            $table->boolean('requires_attachment')->default(false); // Wajib upload bukti?

            // Ordering
            $table->integer('sort_order')->default(0);

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index('category');
            $table->index('code');
            $table->index('sort_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation_indicators');
    }
};
