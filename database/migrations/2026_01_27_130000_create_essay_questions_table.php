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
        Schema::create('essay_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('evaluation_categories')->cascadeOnDelete();
            $table->string('code')->nullable();
            $table->text('question');
            $table->text('guidance')->nullable();
            $table->integer('max_words')->default(500);
            $table->boolean('is_required')->default(true);
            $table->integer('display_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('essay_questions');
    }
};
