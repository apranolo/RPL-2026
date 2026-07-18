<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates the proposal_documents table for storing files
     * attached to a Proposal.
     */
    public function up(): void
    {
        Schema::create('proposal_documents', function (Blueprint $table) {
            $table->id();

            // Foreign key to proposals
            $table->foreignId('proposal_id')
                ->constrained('proposals')
                ->cascadeOnDelete();

            // File metadata
            $table->string('file_name');
            $table->string('file_path');
            $table->string('file_type')->nullable();
            $table->integer('file_size')->nullable();

            // Document type & description
            $table->string('document_type')->nullable();
            $table->text('description')->nullable();

            $table->timestamps();

            // Index
            $table->index('proposal_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_documents');
    }
};
