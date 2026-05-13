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
            $table->string('supporting_document')->nullable()->after('status')
                ->comment('Path to optional supporting document (proposal, etc.)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pembinaan_registrations', function (Blueprint $table) {
            $table->dropColumn('supporting_document');
        });
    }
};
