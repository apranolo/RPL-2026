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
            $table->json('oai_urls')->nullable()->after('oai_pmh_url');
        });

        // Copy existing data to the new column
        \Illuminate\Support\Facades\DB::table('journals')
            ->whereNotNull('oai_pmh_url')
            ->where('oai_pmh_url', '!=', '')
            ->orderBy('id')
            ->chunk(100, function ($journals) {
                foreach ($journals as $journal) {
                    \Illuminate\Support\Facades\DB::table('journals')
                        ->where('id', $journal->id)
                        ->update([
                            'oai_urls' => json_encode([$journal->oai_pmh_url]),
                        ]);
                }
            });

        Schema::table('journals', function (Blueprint $table) {
            $table->dropColumn('oai_pmh_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            $table->string('oai_pmh_url', 500)->default('')->after('url');
        });

        // Revert data
        \Illuminate\Support\Facades\DB::table('journals')
            ->whereNotNull('oai_urls')
            ->orderBy('id')
            ->chunk(100, function ($journals) {
                foreach ($journals as $journal) {
                    $urls = json_decode($journal->oai_urls, true);
                    \Illuminate\Support\Facades\DB::table('journals')
                        ->where('id', $journal->id)
                        ->update([
                            'oai_pmh_url' => ! empty($urls) ? $urls[0] : '',
                        ]);
                }
            });

        Schema::table('journals', function (Blueprint $table) {
            $table->dropColumn('oai_urls');
        });
    }
};
