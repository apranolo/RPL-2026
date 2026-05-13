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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('scientific_field_id')
                ->nullable()
                ->after('university_id')
                ->constrained('scientific_fields')
                ->nullOnDelete();

            $table->index('scientific_field_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['scientific_field_id']);
            $table->dropIndex(['scientific_field_id']);
            $table->dropColumn('scientific_field_id');
        });
    }
};
