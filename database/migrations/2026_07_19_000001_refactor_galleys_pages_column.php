<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Replaces the two separate integer columns (page_from, page_to) with a
     * single nullable string column (pages) in "FROM-TO" format (e.g. "10-15").
     * Existing data is migrated by combining the old values.
     */
    public function up(): void
    {
        Schema::table('galleys', function (Blueprint $table) {
            $table->string('pages')->nullable()->after('file_path');
        });

        // Migrate existing data: combine page_from and page_to into the pages column
        DB::table('galleys')->whereNotNull('page_from')->orWhereNotNull('page_to')->orderBy('id')->each(function ($galley) {
            $from = $galley->page_from;
            $to   = $galley->page_to;

            if ($from !== null && $to !== null) {
                $pages = ($from === $to) ? (string) $from : "{$from}-{$to}";
            } elseif ($from !== null) {
                $pages = (string) $from;
            } else {
                $pages = (string) $to;
            }

            DB::table('galleys')->where('id', $galley->id)->update(['pages' => $pages]);
        });

        Schema::table('galleys', function (Blueprint $table) {
            $table->dropColumn(['page_from', 'page_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('galleys', function (Blueprint $table) {
            $table->integer('page_from')->nullable()->after('file_path');
            $table->integer('page_to')->nullable()->after('page_from');
        });

        // Attempt to restore data from the pages string
        DB::table('galleys')->whereNotNull('pages')->each(function ($galley) {
            $parts = explode('-', $galley->pages, 2);
            $from  = isset($parts[0]) && is_numeric($parts[0]) ? (int) $parts[0] : null;
            $to    = isset($parts[1]) && is_numeric($parts[1]) ? (int) $parts[1] : $from;

            DB::table('galleys')->where('id', $galley->id)->update([
                'page_from' => $from,
                'page_to'   => $to,
            ]);
        });

        Schema::table('galleys', function (Blueprint $table) {
            $table->dropColumn('pages');
        });
    }
};
