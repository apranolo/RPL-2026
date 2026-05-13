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
        Schema::create('oai_harvesting_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journal_id')->constrained()->onDelete('cascade')
                ->comment('Foreign key to journals table');
            $table->timestamp('harvested_at')->useCurrent()
                ->comment('When the harvesting was performed');
            $table->integer('records_found')->default(0)
                ->comment('Total records found in OAI-PMH response');
            $table->integer('records_imported')->default(0)
                ->comment('Successfully imported article records');
            $table->enum('status', ['success', 'partial', 'failed'])->default('success')
                ->comment('Harvesting result status');
            $table->text('error_message')->nullable()
                ->comment('Error details if harvesting failed');

            // Indexes
            $table->index('journal_id');
            $table->index('harvested_at');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('oai_harvesting_logs');
    }
};
