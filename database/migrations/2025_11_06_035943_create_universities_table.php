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
        Schema::create('universities', function (Blueprint $table) {
            $table->id();

            // basic info
            $table->string('code', 20)->unique(); // Kode PTM unik. e.g., 'UAD', 'UMY'
            $table->string('name', 150); // Nama lengkap universitas
            $table->string('short_name', 20)->nullable(); // Singkatan nama universitas

            // Contact
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();

            // Branding
            $table->string('logo_url', 500)->nullable(); // URL logo PTM

            // Status
            $table->boolean('is_active')->default(true); // Status aktif/inaktif PTM

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('code');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('universities');
    }
};
