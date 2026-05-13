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
        Schema::table('journals', function (Blueprint $table) {
            // Dikti Accreditation Details
            $table->string('dikti_accreditation_number', 50)->nullable()->after('accreditation_grade');
            $table->date('accreditation_issued_date')->nullable()->after('dikti_accreditation_number');
            $table->date('accreditation_expiry_date')->nullable()->after('accreditation_issued_date');

            // Indexations (JSON format: {"Scopus": {"indexed_at": "2023-01-15"}, "WoS": {...}})
            // NOTE: Multiple indexation platforms are stored here (Scopus, WoS, DOAJ, etc.)
            // However, "indexed journals" statistics specifically count Scopus-indexed only
            // (as per meeting notes 02 Feb 2026 - Scopus = "terindeks" definition)
            $table->json('indexations')->nullable()->after('accreditation_expiry_date');

            // SINTA indexed date
            $table->date('sinta_indexed_date')->nullable()->after('sinta_rank');

            // Add index for accreditation expiry queries
            $table->index('accreditation_expiry_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the index in a separate schema call with its own try/catch.
        // Blueprint batches SQL execution AFTER the closure returns, so a
        // try-catch inside the closure cannot catch SQL-level exceptions.
        // The index may already be gone (dropped by a later migration or by
        // MySQL when its column was removed), so we guard it explicitly.
        if (Schema::hasColumn('journals', 'accreditation_expiry_date')) {
            try {
                Schema::table('journals', function (Blueprint $table) {
                    $table->dropIndex('journals_accreditation_expiry_date_index');
                });
            } catch (\Throwable $e) {
                // Index already absent — safe to continue.
            }
        }

        // Drop columns that belong ONLY to this migration.
        $columnsToDrop = array_filter(
            ['dikti_accreditation_number', 'accreditation_issued_date',
                'accreditation_expiry_date', 'indexations', 'sinta_indexed_date'],
            fn ($col) => Schema::hasColumn('journals', $col)
        );

        if (! empty($columnsToDrop)) {
            Schema::table('journals', function (Blueprint $table) use ($columnsToDrop) {
                $table->dropColumn(array_values($columnsToDrop));
            });
        }
    }
};
