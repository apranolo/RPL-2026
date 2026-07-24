<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('galleys', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_submission')->nullable();
            $table->foreignId('id_issue')->nullable()->constrained('issues')->nullOnDelete();
            $table->string('label', 20);
            $table->string('file_path');
            $table->integer('page_from')->nullable();
            $table->integer('page_to')->nullable();
            $table->string('doi')->nullable()->unique();
            $table->integer('sequence')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('galleys');
    }
};
