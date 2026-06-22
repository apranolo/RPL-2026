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
        Schema::table('author_profiles', function (Blueprint $table) {
            $table->unsignedInteger('h_index')->default(0);
            $table->unsignedInteger('total_citations')->default(0);
            $table->json('yearly_data')->nullable();   // { "2023": 12, "2024": 30, ... }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('author_profiles', function (Blueprint $table) {
            $table->dropColumn(['h_index', 'total_citations', 'yearly_data']);
        });
    }
};
