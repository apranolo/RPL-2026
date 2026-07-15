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
        Schema::create('research_schemas', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // schema_name
            $table->text('description')->nullable();
            $table->decimal('max_funding', 15, 2)->default(0); // Pagu dana maksimal
            $table->boolean('is_active')->default(true); // Status keaktifan skema
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_schemas');
    }
};
