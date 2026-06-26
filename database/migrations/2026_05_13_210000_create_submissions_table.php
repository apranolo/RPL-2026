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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained('journals')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 500)->nullable();
            $table->text('abstract')->nullable();
            $table->json('keywords')->nullable();
            $table->string('language', 10)->default('id');
            $table->enum('status', [
                'Draft',
                'Submitted',
                'In_Review',
                'Copyediting',
                'Production',
                'Published',
                'Declined',
            ])->default('Draft');
            $table->timestamps();
            $table->softDeletes();

            $table->index('journal_id');
            $table->index('author_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
