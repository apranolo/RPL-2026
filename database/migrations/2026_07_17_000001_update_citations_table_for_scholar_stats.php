<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Repurposes the citations table from per-publication records to
     * per-user Google Scholar statistics (h-index, total citations, and
     * the yearly citation trend used by the Profile/Citation chart).
     */
    public function up(): void
    {
        Schema::table('citations', function (Blueprint $table) {
            $table->dropUnique(['doi']);
            $table->dropColumn([
                'title',
                'author',
                'publication_year',
                'journal',
                'volume',
                'issue',
                'pages',
                'doi',
            ]);
        });

        Schema::table('citations', function (Blueprint $table) {
            $table->integer('h_index')->default(0)->after('user_id');
            $table->integer('total_citations')->default(0)->after('h_index');
            $table->json('yearly_data')->nullable()->after('total_citations'); // [{"year": 2024, "citations": 15}, ...]
            $table->timestamp('last_synced_at')->nullable()->after('yearly_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citations', function (Blueprint $table) {
            $table->dropColumn(['h_index', 'total_citations', 'yearly_data', 'last_synced_at']);
        });

        Schema::table('citations', function (Blueprint $table) {
            $table->text('title');
            $table->string('author');
            $table->unsignedSmallInteger('publication_year');
            $table->string('journal')->nullable();
            $table->string('volume')->nullable();
            $table->string('issue')->nullable();
            $table->string('pages')->nullable();
            $table->string('doi')->nullable()->unique();
        });
    }
};
