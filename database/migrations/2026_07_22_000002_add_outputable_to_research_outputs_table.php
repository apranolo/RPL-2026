<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('research_outputs', function (Blueprint $table) {
            $table->nullableMorphs('outputable');
        });
    }

    public function down(): void
    {
        Schema::table('research_outputs', function (Blueprint $table) {
            $table->dropMorphs('outputable');
        });
    }
};
