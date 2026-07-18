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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            // Menggunakan foreignId tanpa strict constraint ke submissions karena tabel submissions mungkin belum ada
            $table->foreignId('submission_id')->nullable()->index(); 
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action'); // contoh: 'created', 'updated', dll
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
