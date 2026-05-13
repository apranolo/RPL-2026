<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();

            // Linked registration (one-to-one)
            $table->foreignId('registration_id')
                ->constrained('pembinaan_registrations')
                ->cascadeOnDelete();

            // Contract identity
            $table->string('contract_number')->unique()->comment('Format: SPK-YYYY-XXXXX');

            // Financial & timeline
            $table->decimal('nilai_kontrak', 18, 2)->nullable()->comment('Contract value in IDR');
            $table->date('tanggal_mulai')->nullable();
            $table->date('tanggal_selesai')->nullable();

            // Status
            $table->enum('status', ['draft', 'aktif', 'selesai', 'batal'])
                ->default('draft')
                ->index();

            // Free-text notes
            $table->text('catatan')->nullable();

            // Audit
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
