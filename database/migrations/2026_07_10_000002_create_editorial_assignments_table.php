<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('editorial_assignments')) {
            Schema::create('editorial_assignments', function (Blueprint $table) {
                $table->id();

                $table->foreignId('editor_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('submission_id')->constrained('submissions')->cascadeOnDelete();

                $table->foreignId('assigned_by')->constrained('users')->cascadeOnDelete();
                $table->timestamp('assigned_at')->useCurrent();

                $table->enum('status', ['assigned', 'in_progress', 'completed'])->default('assigned');

                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

                $table->timestamps();
                $table->softDeletes();

                $table->index('editor_id');
                $table->index('submission_id');
                $table->index('status');
                $table->index('assigned_at');

                $table->unique(['editor_id', 'submission_id'], 'unique_editor_submission');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('editorial_assignments');
    }
};
