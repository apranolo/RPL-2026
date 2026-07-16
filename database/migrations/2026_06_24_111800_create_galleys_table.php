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
        Schema::create('galleys', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('submission_id')->nullable();
            $table->foreignId('issue_id')->nullable()->constrained('issues')->nullOnDelete();
            $table->string('label', 50); // e.g. PDF, HTML, XML
            $table->string('file_path');
            $table->integer('page_from')->nullable();
            $table->integer('page_to')->nullable();
            $table->string('doi')->nullable()->unique();
            $table->integer('sequence')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('galleys');
    }
};
