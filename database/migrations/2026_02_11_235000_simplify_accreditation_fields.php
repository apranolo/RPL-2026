<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Simplify accreditation fields per Meeting Notes 11 Feb 2026.
 *
 * Changes:
 * - Convert sinta_rank from tinyInteger to string enum (sinta_1..sinta_6, non_sinta)
 * - Add new accreditation period fields (start_year, end_year, sk_number, sk_date)
 * - Add cover_image field
 * - Make e_issn and oai_pmh_url NOT NULLable (with default empty string)
 * - Drop deprecated columns (accreditation_grade, accreditation_status, sinta_indexed_date)
 */
return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Add new columns
        Schema::table('journals', function (Blueprint $table) {
            $table->integer('accreditation_start_year')->nullable()->after('sinta_rank');
            $table->integer('accreditation_end_year')->nullable()->after('accreditation_start_year');
            $table->string('accreditation_sk_number', 100)->nullable()->after('accreditation_end_year');
            $table->date('accreditation_sk_date')->nullable()->after('accreditation_sk_number');
            $table->string('cover_image', 255)->nullable()->after('cover_image_url');
        });

        // Step 2: Migrate sinta_rank integer values to string format
        // Create a temporary column, copy data, then swap
        Schema::table('journals', function (Blueprint $table) {
            $table->string('sinta_rank_new', 20)->default('non_sinta')->after('sinta_rank');
        });

        // Map existing integer values to string enum
        DB::statement("UPDATE journals SET sinta_rank_new = CASE
            WHEN sinta_rank = 1 THEN 'sinta_1'
            WHEN sinta_rank = 2 THEN 'sinta_2'
            WHEN sinta_rank = 3 THEN 'sinta_3'
            WHEN sinta_rank = 4 THEN 'sinta_4'
            WHEN sinta_rank = 5 THEN 'sinta_5'
            WHEN sinta_rank = 6 THEN 'sinta_6'
            ELSE 'non_sinta'
        END");

        // Drop old column and rename new one
        Schema::table('journals', function (Blueprint $table) {
            $table->dropColumn('sinta_rank');
        });

        Schema::table('journals', function (Blueprint $table) {
            $table->renameColumn('sinta_rank_new', 'sinta_rank');
        });

        // Step 3: Make e_issn and oai_pmh_url NOT NULL with defaults
        DB::statement("UPDATE journals SET e_issn = '' WHERE e_issn IS NULL");
        DB::statement("UPDATE journals SET oai_pmh_url = '' WHERE oai_pmh_url IS NULL");

        Schema::table('journals', function (Blueprint $table) {
            $table->string('e_issn', 50)->default('')->change();
            $table->string('oai_pmh_url', 500)->default('')->change();
        });

        // Step 4: Drop deprecated columns
        Schema::table('journals', function (Blueprint $table) {
            $table->dropColumn([
                'accreditation_status',
                'accreditation_grade',
                'sinta_indexed_date',
            ]);
        });
    }

    public function down(): void
    {
        // Step 1: Re-add dropped columns
        Schema::table('journals', function (Blueprint $table) {
            $table->string('accreditation_status', 50)->nullable();
            $table->string('accreditation_grade', 10)->nullable();
            $table->date('sinta_indexed_date')->nullable();
        });

        // Step 2: Revert sinta_rank back to integer
        Schema::table('journals', function (Blueprint $table) {
            $table->tinyInteger('sinta_rank_old')->unsigned()->nullable()->after('sinta_rank');
        });

        DB::statement("UPDATE journals SET sinta_rank_old = CASE
            WHEN sinta_rank = 'sinta_1' THEN 1
            WHEN sinta_rank = 'sinta_2' THEN 2
            WHEN sinta_rank = 'sinta_3' THEN 3
            WHEN sinta_rank = 'sinta_4' THEN 4
            WHEN sinta_rank = 'sinta_5' THEN 5
            WHEN sinta_rank = 'sinta_6' THEN 6
            ELSE NULL
        END");

        Schema::table('journals', function (Blueprint $table) {
            $table->dropColumn('sinta_rank');
        });

        Schema::table('journals', function (Blueprint $table) {
            $table->renameColumn('sinta_rank_old', 'sinta_rank');
        });

        // Step 3: Make e_issn and oai_pmh_url nullable again
        Schema::table('journals', function (Blueprint $table) {
            $table->string('e_issn', 50)->nullable()->change();
            $table->string('oai_pmh_url', 500)->nullable()->change();
        });

        // Step 4: Drop new columns
        Schema::table('journals', function (Blueprint $table) {
            $table->dropColumn([
                'accreditation_start_year',
                'accreditation_end_year',
                'accreditation_sk_number',
                'accreditation_sk_date',
                'cover_image',
            ]);
        });
    }
};
