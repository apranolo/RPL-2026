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
                $table->string('status_proposal')->default('Pending')->after('research_schema_id');
            }
            if (! Schema::hasColumn('proposals', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('status_proposal');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proposals', function (Blueprint $table) {
            $table->dropColumn(['status_proposal', 'rejection_reason']);
        });
    }
};
