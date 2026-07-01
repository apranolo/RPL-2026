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
    Schema::create('revision_rounds', function (Blueprint $table) {
        $table->id('id_round'); 
        $table->foreignId('id_submission')->constrained('submissions', 'id_submission')->cascadeOnDelete();
        $table->integer('round_number');
        $table->date('due_date')->nullable();
        $table->text('editor_decision_note')->nullable();
        $table->enum('status', ['Awaiting_Revision', 'Submitted', 'Approved', 'Rejected'])->default('Awaiting_Revision');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revision_rounds');
    }
};
