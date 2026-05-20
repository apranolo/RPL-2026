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

            // Auto-generated contract number (e.g. KON-2026-0001)
            $table->string('contract_number')->unique()->nullable();

            // Contract title / subject
            $table->string('title');

            // Related entities
            $table->foreignId('pembinaan_registration_id')
                ->nullable()
                ->constrained('pembinaan_registrations')
                ->nullOnDelete();

            $table->foreignId('journal_id')
                ->nullable()
                ->constrained('journals')
                ->nullOnDelete();

            $table->foreignId('university_id')
                ->nullable()
                ->constrained('universities')
                ->nullOnDelete();

            // Contract period
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Status: draft | active | selesai | dibatalkan
            $table->string('status')->default('draft');

            // Terms / notes
            $table->text('terms')->nullable();
            $table->text('notes')->nullable();

            // Audit trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
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
