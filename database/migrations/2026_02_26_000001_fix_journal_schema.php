<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Cleans up three stale Dikti accreditation columns that are no longer used
     * by the application. All new columns (accreditation_start_year, *_end_year,
     * *_sk_number, *_sk_date, cover_image) and the sinta_rank type change (varchar)
     * were already applied to this database outside of migration tracking.
     */
    public function up(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            // Drop stale Dikti accreditation columns — replaced by sk_number/sk_date
            $table->dropColumn([
                'dikti_accreditation_number',
                'accreditation_issued_date',
                'accreditation_expiry_date',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            $table->string('dikti_accreditation_number', 50)->nullable();
            $table->date('accreditation_issued_date')->nullable();
            $table->date('accreditation_expiry_date')->nullable();
        });
    }
};
