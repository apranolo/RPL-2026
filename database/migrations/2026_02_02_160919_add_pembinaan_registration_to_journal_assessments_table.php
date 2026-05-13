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
        Schema::table('journal_assessments', function (Blueprint $table) {
            // Add pembinaan registration foreign key
            $table->unsignedBigInteger('pembinaan_registration_id')->nullable()->after('journal_id');
            $table->foreign('pembinaan_registration_id')
                ->references('id')
                ->on('pembinaan_registrations')
                ->onDelete('set null');

            // Add index for faster queries
            $table->index('pembinaan_registration_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_assessments', function (Blueprint $table) {
            $table->dropForeign(['pembinaan_registration_id']);
            $table->dropIndex(['pembinaan_registration_id']);
            $table->dropColumn('pembinaan_registration_id');
        });
    }
};
