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
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained()->onDelete('cascade')
                ->comment('Foreign key to journals table');

            // OAI-PMH Metadata
            $table->string('oai_identifier', 255)->unique()
                ->comment('Unique OAI identifier from harvesting');
            $table->timestamp('oai_datestamp')
                ->comment('Last modified date from OAI-PMH');
            $table->string('oai_set', 100)->nullable()
                ->comment('OAI set specification');

            // Article Metadata (Dublin Core)
            $table->text('title')->comment('Article title');
            $table->text('abstract')->nullable()->comment('Article abstract');
            $table->json('authors')->nullable()->comment('Array of author names');
            $table->json('keywords')->nullable()->comment('Article keywords');
            $table->string('doi', 255)->nullable()->comment('Digital Object Identifier');
            $table->date('publication_date')->comment('Article publication date');

            // Volume/Issue Information
            $table->string('volume', 50)->nullable()->comment('Journal volume');
            $table->string('issue', 50)->nullable()->comment('Journal issue/number');
            $table->string('pages', 50)->nullable()->comment('Page range (e.g., 1-10)');

            // URLs
            $table->string('article_url', 500)->nullable()->comment('Full text URL');
            $table->string('pdf_url', 500)->nullable()->comment('PDF download URL');

            // Timestamps
            $table->timestamps();
            $table->timestamp('last_harvested_at')->nullable()
                ->comment('Last time this article was updated from OAI-PMH');

            // Indexes for performance
            $table->index('doi');
            $table->index('publication_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
