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
        Schema::table('pembinaan_registrations', function (Blueprint $table) {
            $table->enum('review_status', [
                'menunggu_reviewer',
                'sedang_direview',
                'review_selesai',
                'ditolak',
            ])->default('menunggu_reviewer')->after('status')
                ->comment('Review status for pembinaan process');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembinaan_registrations', function (Blueprint $table) {
            $table->dropColumn('review_status');
        });
    }
};
