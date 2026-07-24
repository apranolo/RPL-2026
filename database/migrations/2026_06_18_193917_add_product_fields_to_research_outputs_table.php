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
        if (Schema::hasTable('research_outputs')) {
            Schema::table('research_outputs', function (Blueprint $table) {
                $table->integer('tkt_level')->nullable()->after('keterangan');
                $table->string('version', 50)->nullable()->after('tkt_level');
                $table->integer('year')->nullable()->after('version');
                $table->string('url')->nullable()->after('year');
                $table->string('cover_image')->nullable()->after('url');
                $table->string('document')->nullable()->after('cover_image');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('research_outputs', function (Blueprint $table) {
            $table->dropColumn([
                'tkt_level',
                'version',
                'year',
                'url',
                'cover_image',
                'document',
            ]);
        });
    }
};
