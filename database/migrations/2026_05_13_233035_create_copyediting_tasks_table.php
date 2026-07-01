<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('copyediting_tasks', function (Blueprint $table) {
            $table->id('id_task');
            $table->foreignId('id_submission')
                ->constrained('submissions', 'id_submission')
                ->cascadeOnDelete();

            $table->foreignId('id_copyeditor')
                ->nullable()
                ->constrained('users', 'id')
                ->nullOnDelete();

            $table->enum('status', [
                'Assigned',
                'In_Progress',
                'Completed',
                'Author_Approved',
            ])->default('Assigned');


            $table->timestamp('assigned_at')->useCurrent(); 
            $table->timestamp('completed_at')->nullable(); 

            $table->text('editor_note')->nullable();
            $table->text('copyeditor_note')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('copyediting_tasks');
    }
};