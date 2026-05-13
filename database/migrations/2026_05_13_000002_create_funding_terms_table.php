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
        Schema::create('funding_terms', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('contract_id')
                ->constrained('contracts')
                ->cascadeOnDelete();

            // Term information
            $table->integer('order')->comment('Urutan Termin (1, 2, 3, dst)');
            $table->string('term_name')->comment('Nama Termin (e.g., Tahap 1, Tahap 2)');
            $table->decimal('percentage', 5, 2)->comment('Persentase dari Total Dana');
            $table->decimal('nominal', 15, 2)->comment('Nominal Dana Termin');

            // Disbursement information
            $table->enum('status', ['cair', 'menunggu', 'ditangguhkan', 'batal'])->default('menunggu');
            $table->date('disbursement_date')->nullable()->comment('Tanggal Dana Cair');
            $table->string('receipt_number')->nullable()->comment('Nomor Kuitansi/Slip Transfer');
            $table->string('receipt_file')->nullable()->comment('Path to receipt/bukti transfer file');
            $table->text('notes')->nullable()->comment('Catatan/Keterangan Termin');

            // Audit fields
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
            $table->index('contract_id');
            $table->index('status');
            $table->index('order');
            $table->index('disbursement_date');

            // Unique constraint: one term per order per contract
            $table->unique(['contract_id', 'order'], 'unique_contract_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funding_terms');
    }
};
