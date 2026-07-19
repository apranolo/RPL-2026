<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drops three stale Dikti accreditation columns that were removed from the
     * application model. These were added by the Jan-24 indexation migration and
     * superseded by the accreditation_start/end_year + sk_number/sk_date model
     * introduced in the Feb-11 simplify migration.
     *
     * Column existence is checked to make the migration idempotent for databases
     * where the columns may already have been dropped manually.
     */
    public function up(): void
    {
        if (Schema::hasColumn('journals', 'accreditation_expiry_date')) {
            try {
                Schema::table('journals', function (Blueprint $table) {
                    $table->dropIndex('journals_accreditation_expiry_date_index');
                });
            } catch (\Throwable) {
                // Index already absent — safe to continue.
            }
        }

        Schema::table('journals', function (Blueprint $table) {
            if (Schema::hasColumn('journals', 'accreditation_expiry_date')) {
                try {
                    $table->dropIndex('journals_accreditation_expiry_date_index');
                } catch (\Throwable $e) {
                    // Ignore
                }
            }

            $columnsToDrop = array_filter(
                ['dikti_accreditation_number', 'accreditation_issued_date', 'accreditation_expiry_date'],
                fn ($col) => Schema::hasColumn('journals', $col)
            );

            if (! empty($columnsToDrop)) {
                if (DB::getDriverName() === 'sqlite' && in_array('accreditation_expiry_date', $columnsToDrop)) {
                    $table->dropIndex(['accreditation_expiry_date']);
                }
                $table->dropColumn(array_values($columnsToDrop));
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            if (! Schema::hasColumn('journals', 'dikti_accreditation_number')) {
                $table->string('dikti_accreditation_number', 50)->nullable();
            }
            if (! Schema::hasColumn('journals', 'accreditation_issued_date')) {
                $table->date('accreditation_issued_date')->nullable();
            }
            if (! Schema::hasColumn('journals', 'accreditation_expiry_date')) {
                $table->date('accreditation_expiry_date')->nullable();
            }
        });
    }
};