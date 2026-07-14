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
        Schema::create('monev_schedules', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('contract_id')->nullable();

            $table->foreignId('evaluator_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->date('date');

            $table->time('time')->nullable();

            $table->string('location')->nullable();

            $table->enum('status', [
                'scheduled',
                'done',
                'cancelled'
            ])->default('scheduled');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monev_schedules');
    }
};
