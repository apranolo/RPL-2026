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
        Schema::create('assessment_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_assessment_id')
                ->constrained('journal_assessments')
                ->onDelete('cascade')
                ->comment('Reference to journal assessment');
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade')
                ->comment('User who created the note');
            $table->string('author_role', 50)
                ->comment('Role of the author: User, Admin Kampus, Reviewer, LPPM');
            $table->enum('note_type', ['submission', 'approval', 'rejection', 'review', 'general'])
                ->comment('Type of note');
            $table->text('content')
                ->comment('Content of the note');
            $table->timestamps();

            // Indexes for better query performance
            $table->index(['journal_assessment_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_notes');
    }
};
