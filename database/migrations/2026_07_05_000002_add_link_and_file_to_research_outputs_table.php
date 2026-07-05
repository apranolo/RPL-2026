<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_outputs', function (Blueprint $table) {
            $table->string('link_url')->nullable()->after('file_path');
            $table->string('file_name')->nullable()->after('link_url');
            $table->string('file_path')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('research_outputs', function (Blueprint $table) {
            $table->dropColumn(['link_url', 'file_name']);
        });
    }
};
