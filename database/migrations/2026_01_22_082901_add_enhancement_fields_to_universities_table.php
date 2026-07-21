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
        Schema::table('universities', function (Blueprint $table) {
            // PTM Code from PDDIKTI (5 digit unique identifier)
            $table->string('ptm_code', 10)->unique()->nullable()->after('code');

            // Accreditation status (Unggul, Baik Sekali, Baik, Cukup, dll)
            $table->string('accreditation_status', 50)->nullable()->after('logo_url');

            // Cluster (Mandiri, Utama, Madya, dll)
            $table->string('cluster', 50)->nullable()->after('accreditation_status');

            // Profile description with 250 character limit
            $table->string('profile_description', 250)->nullable()->after('cluster');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('universities', function (Blueprint $table) {
            $table->dropColumn([
                'ptm_code',
                'accreditation_status',
                'cluster',
                'profile_description',
            ]);
        });
    }
};
