<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_journal')->constrained('journals')->cascadeOnDelete();
            $table->integer('volume');
            $table->integer('number');
            $table->year('year');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->enum('status', ['Draft', 'Published'])->default('Draft');
            $table->timestamps();

            $table->unique(['id_journal', 'volume', 'number', 'year'], 'unique_issue_per_journal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issues');
    }
};
