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
        Schema::table('proposals', function (Blueprint $table) {
            if (! Schema::hasColumn('proposals', 'status_proposal')) {
                $table->string('status_proposal')->default('Draft');
            }
            if (! Schema::hasColumn('proposals', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable();
            }
            if (! Schema::hasColumn('proposals', 'file_dokumen_proposal')) {
                $table->string('file_dokumen_proposal')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn(['status_proposal', 'rejection_reason', 'file_dokumen_proposal']);
        });
    }
};
