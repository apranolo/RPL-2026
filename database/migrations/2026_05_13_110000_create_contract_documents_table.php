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
        Schema::create('contract_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('document_name');
            $table->string('file_path');
            $table->string('file_type')->default('pdf');
            $table->bigInteger('file_size')->nullable();
            $table->string('contract_number')->nullable();
            $table->dateTime('contract_date')->nullable();
            $table->dateTime('signed_date')->nullable();
            $table->string('status')->default('draft'); // draft, signed, archived
            $table->text('description')->nullable();
            $table->string('uploaded_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contract_documents');
    }
};
