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
        Schema::create('assessment_attachments', function (Blueprint $table) {
            $table->id();

            // Relationships
            $table->foreignId('assessment_response_id')->constrained('assessment_responses')->cascadeOnDelete();

            // File Info
            $table->string('original_filename'); // Nama file asli saat diupload
            $table->string('stored_filename'); // Nama file di storage
            $table->string('file_path', 500); // Path di storage
            $table->unsignedInteger('file_size'); // Ukuran file dalam bytes
            $table->string('mime_type', 100); // e.g., application/pdf, image/jpeg

            // Uploader
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('assessment_response_id');
            $table->index('uploaded_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_attachments');
    }
};
