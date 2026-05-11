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

            // Yang bawah ini belum dibuat mas sama tim yang lain, jadi sementara pakai unsignedBigInteger dulu, nanti kalau sudah dibuat bisa diganti ke foreignId
            // $table->foreignId('submission_id')
            //     ->constrained('submissions')
            //     ->onDelete('cascade');

            $table->unsignedBigInteger('submission_id');

            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->string('action');

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
