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
        Schema::create('agendas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('title');
            $table->string('slug')->unique();
            $table->string('type'); // Seminar, Workshop, Conference
            $table->longText('description');
            $table->string('thumbnail')->nullable();

            $table->date('date_start');
            $table->date('date_end')->nullable();
            $table->time('time_start');
            $table->time('time_end')->nullable();

            $table->enum('location_type', ['Online', 'Offline', 'Hybrid']);
            $table->string('location_venue')->nullable();
            $table->string('location_link')->nullable(); // Zoom
            $table->string('registration_link')->nullable();

            $table->decimal('price', 10, 2)->default(0);

            $table->string('contact_person_name')->nullable();
            $table->string('contact_person_phone')->nullable();
            $table->string('contact_person_email')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendas');
    }
};
