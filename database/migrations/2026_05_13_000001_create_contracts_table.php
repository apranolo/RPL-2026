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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('researcher_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Contract information
            $table->string('contract_number')->unique();
            $table->date('contract_date');
            $table->string('party_1')->comment('LPPM / Institusi Pemberi Dana');
            $table->string('party_2')->comment('Peneliti Utama');

            // Financial information
            $table->decimal('total_approved_funding', 15, 2)->comment('Total Dana yang Disetujui');

            // Status and documents
            $table->enum('contract_status', ['aktif', 'selesai', 'ditangguhkan'])->default('aktif');
            $table->string('financial_document')->nullable()->comment('Path to contract document');

            // Audit fields
            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->foreignId('deleted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('researcher_id');
            $table->index('contract_status');
            $table->index('contract_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
