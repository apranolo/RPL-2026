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
        Schema::create('outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('journal_id')->nullable()->constrained()->onDelete('set null');

            // Output type: publikasi_jurnal, hki, buku, prosiding, etc.
            $table->string('type');

            // Common fields
            $table->string('title');
            $table->text('authors')->nullable();
            $table->year('year')->nullable();
            $table->string('doi')->nullable();
            $table->string('url')->nullable();

            // Publication-specific fields (for publikasi_jurnal)
            $table->string('journal_name')->nullable();
            $table->string('volume')->nullable();
            $table->string('issue')->nullable();
            $table->string('pages')->nullable();
            $table->string('issn')->nullable();
            $table->string('e_issn')->nullable();
            $table->string('publisher')->nullable();

            // File attachment
            $table->string('file_path')->nullable();

            // Status
            $table->string('status')->default('draft'); // draft, submitted, verified

            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index('doi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outputs');
    }
};
