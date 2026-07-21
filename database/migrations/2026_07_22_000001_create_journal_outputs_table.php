<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('journal_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->nullable()->constrained('journals')->nullOnDelete();
            $table->string('title', 500);
            $table->text('authors');
            $table->unsignedSmallInteger('year');
            $table->string('doi')->nullable()->index();
            $table->string('url', 500)->nullable();
            $table->string('journal_name');
            $table->string('volume', 50)->nullable();
            $table->string('issue', 50)->nullable();
            $table->string('pages', 50)->nullable();
            $table->string('issn', 20)->nullable();
            $table->string('e_issn', 20)->nullable();
            $table->string('publisher')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('journal_outputs');
    }
};
