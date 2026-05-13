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
        Schema::create('fundings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('contract_id');
            $table->string('termin_name');
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'disbursed', 'rejected'])->default('pending');
            $table->date('disbursement_date')->nullable();
            $table->string('evidence_path')->nullable();
            $table->timestamps();

            // Index for performance
            $table->index('contract_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fundings');
    }
};
