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
            $table->foreignId('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignId('pembinaan_id')->nullable()->constrained('pembinaan')->nullOnDelete();

            $table->string('contract_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'active', 'completed', 'cancelled'])->default('draft');
            $table->decimal('contract_value', 15, 2)->default(0);

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('signed_at')->nullable();
            $table->string('document_path')->nullable();
            $table->text('notes')->nullable();

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();

            $table->softDeletes();
            $table->timestamps();

            $table->index('university_id');
            $table->index('pembinaan_id');
            $table->index('status');
            $table->index('start_date');
            $table->index('end_date');
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
