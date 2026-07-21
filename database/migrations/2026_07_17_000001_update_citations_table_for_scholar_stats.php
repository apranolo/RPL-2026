<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Repurposes the citations table from per-publication records to
     * per-user Google Scholar statistics (h-index, total citations, and
     * the yearly citation trend used by the Profile/Citation chart).
     */
    public function up(): void
    {
        Schema::dropIfExists('citations');

        Schema::create('citations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('h_index')->default(0);
            $table->integer('total_citations')->default(0);
            $table->json('yearly_data')->nullable(); // [{"year": 2024, "citations": 15}, ...]
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('citations');
    }
};
