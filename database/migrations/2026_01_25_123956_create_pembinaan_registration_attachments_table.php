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
        Schema::create('pembinaan_registration_attachments', function (Blueprint $table) {
            $table->id();

            // Foreign key to registration
            $table->foreignId('registration_id')
                ->constrained('pembinaan_registrations')
                ->cascadeOnDelete();

            // File info
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable(); // in bytes

            // Document type/label
            $table->string('document_type')->nullable(); // e.g., 'ISSN Certificate', 'Cover', 'Accreditation'
            $table->text('description')->nullable();

            // Audit fields
            $table->foreignId('uploaded_by')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('deleted_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('registration_id');
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembinaan_registration_attachments');
    }
};
