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
        Schema::create('pembinaan', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', ['akreditasi', 'indeksasi']);

            // Link to accreditation template
            $table->foreignId('accreditation_template_id')
                ->nullable()
                ->constrained('accreditation_templates')
                ->nullOnDelete();

            // Registration period
            $table->dateTime('registration_start');
            $table->dateTime('registration_end');

            // Assessment period
            $table->dateTime('assessment_start');
            $table->dateTime('assessment_end');

            // Quota (optional)
            $table->integer('quota')->nullable();

            // Status
            $table->enum('status', ['draft', 'active', 'closed'])->default('draft');

            // Audit fields
            $table->foreignId('created_by')
                ->constrained('users')
                ->cascadeOnDelete();
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
            $table->index('category');
            $table->index('status');
            $table->index('registration_start');
            $table->index('registration_end');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembinaan');
    }
};
