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
    Schema::create('review_forms', function (Blueprint $table) {
        $table->id();
        
        // Relasi ke assignment di atas
        $table->foreignId('review_assignment_id')->constrained('review_assignments')->cascadeOnDelete();
        
        // Nama indikator penilaian (misal: "Orisinalitas", "Metodologi")
        $table->string('criterion_name');
        
        // Skor penilaian 1 - 5 (Sesuai PRD)
        $table->tinyInteger('score'); 
        
        // Catatan khusus untuk kriteria ini (opsional)
        $table->text('comment')->nullable();
        
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review_forms');
    }
};