<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    
    public function up(): void
    {
        
        Schema::create('revision_rounds', function (Blueprint $table) {
            $table->id();

            $table->foreignId('journal_assessment_id')
                ->constrained('journal_assessments')
                ->cascadeOnDelete();

            // Nomor urut ronde (1, 2, 3, …)
            $table->unsignedTinyInteger('round_number')->default(1);

            // Admin/Reviewer yang meminta revisi
            $table->foreignId('requested_by')
                ->constrained('users')
                ->restrictOnDelete();

            // Catatan permintaan revisi dari penilai
            $table->text('request_notes')->nullable();

            // Kapan permintaan revisi dibuat
            $table->timestamp('requested_at')->nullable();

            // Status ronde: pending | submitted | accepted | rejected
            $table->enum('status', ['pending', 'submitted', 'accepted', 'rejected'])
                ->default('pending');

            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('submission_files', function (Blueprint $table) {
            $table->id();

            $table->foreignId('revision_round_id')
                ->constrained('revision_rounds')
                ->cascadeOnDelete();

            // Author yang mengunggah file
            $table->foreignId('uploaded_by')
                ->constrained('users')
                ->restrictOnDelete();

            // Nama file asli dari klien
            $table->string('original_filename');

            // Nama file yang disimpan di storage (dibuat unik)
            $table->string('stored_filename');

            // Path relatif di disk public (misal: revisions/1/123456_abc.pdf)
            $table->string('file_path');

            // Ukuran file dalam byte
            $table->unsignedBigInteger('file_size')->nullable();

            // MIME type (application/pdf, image/jpeg, dst.)
            $table->string('mime_type', 100)->nullable();

            // Catatan opsional dari Author untuk file ini
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Batalkan migrasi: hapus tabel submission_files lalu revision_rounds.
     */
    public function down(): void
    {
        Schema::dropIfExists('submission_files');
        Schema::dropIfExists('revision_rounds');
    }
};
