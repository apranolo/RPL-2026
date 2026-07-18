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
        Schema::create('scientific_fields', function (Blueprint $table) {
            $table->id();

            $table->string('code', 20)->unique(); // 'Kode bidang ilmu, e.g., COMP, MED'
            $table->string('name'); // 'Nama bidang ilmu, e.g., Computer Science, Medicine'
            $table->text('description')->nullable();

            // Hierarchy (optional untuk grouping)
            $table->foreignId('parent_id')->nullable()->constrained('scientific_fields')->nullOnDelete();

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index('code');
            $table->index('parent_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scientific_fields');
    }
};
