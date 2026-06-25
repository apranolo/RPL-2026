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
    Schema::create('copyediting_tasks', function (Blueprint $table) {
        $table->id('id_task');
        $table->foreignId('id_submission')->constrained('submissions', 'id_submission')->cascadeOnDelete();
        $table->foreignId('id_copyeditor')->nullable()->constrained('users', 'id')->nullOnDelete();
        $table->enum('status', ['Pending', 'InProgress', 'AwaitingAuthorConfirm', 'Completed'])->default('Pending');
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
