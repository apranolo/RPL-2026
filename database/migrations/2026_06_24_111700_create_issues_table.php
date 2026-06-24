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
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained('journals')->cascadeOnDelete();
            $table->integer('volume');
            $table->integer('number');
            $table->integer('year');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->date('publication_date')->nullable();
            $table->enum('status', ['Draft', 'Published'])->default('Draft');
            $table->timestamps();

            // Mencegah duplikasi volume, nomor, dan tahun issue pada jurnal yang sama
            $table->unique(['journal_id', 'volume', 'number', 'year'], 'unique_issue_per_journal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
