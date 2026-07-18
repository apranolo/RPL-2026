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
        Schema::create('editorial_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('submissions')->cascadeOnDelete();
            $table->foreignId('editor_id')->constrained('users')->cascadeOnDelete();

            $table->unsignedInteger('round')->default(1);

            $table->enum('decision', [
                'Accept_For_Review',
                'Desk_Reject',
                'Accept_Submission',
                'Revisions_Required',
                'Reject_Submission',
            ]);

            $table->text('comments')->nullable();
            $table->timestamp('decided_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('editorial_decisions');
    }
};
