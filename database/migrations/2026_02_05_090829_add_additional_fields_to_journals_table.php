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
        Schema::table('journals', function (Blueprint $table) {
            $table->string('cover_image_url', 500)->nullable()->after('email');
            $table->text('about')->nullable()->after('cover_image_url');
            $table->text('scope')->nullable()->after('about');
            $table->string('phone', 50)->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            $table->dropColumn(['cover_image_url', 'about', 'scope', 'phone']);
        });
    }
};
