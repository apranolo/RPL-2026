<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the `skema_pendanaan` (funding scheme) lookup table required by
     * the `proposals` table foreign key.
     */
    public function up(): void
    {
        Schema::create('skema_pendanaan', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 150);        // e.g. "Penelitian Dasar", "PDUPT"
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skema_pendanaan');
    }
};
