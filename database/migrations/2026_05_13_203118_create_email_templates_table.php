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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();

            $table->foreignId('journal_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');

            $table->string('event_trigger');

            $table->string('subject');

            $table->text('body');

            $table->json('variables')->nullable();

            $table->string('description')->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');
    }
};
