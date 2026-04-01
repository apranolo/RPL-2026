<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('scientific_fields')->updateOrInsert(
            ['code' => 'MULTI'],
            [
                'name' => 'Multidisiplin',
                'description' => 'Meliputi berbagai disiplin ilmu atau lintas disiplin',
                'parent_id' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('scientific_fields')->where('code', 'MULTI')->delete();
    }
};
