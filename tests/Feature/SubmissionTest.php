<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Journal;
use App\Models\Submission;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SubmissionTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Journal $journal;

    /**
     * Setup state awal sebelum setiap test dijalankan.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Buat user (author) dan jurnal target untuk testing
        $this->user = User::factory()->create();
        $this->journal = Journal::factory()->create([
            'title' => 'Jurnal Informatika dan Teknologi'
        ]);
    }

    /**
     * Test author dapat melihat daftar submisinya sendiri.
     */
    public function test_author_can_view_submissions_index(): void
    {
        // Buat data submisi milik user saat ini
        Submission::factory()->create([
            'author_id' => $this->user->id,
            'journal_id' => $this->journal->id,
            'title' => 'Analisis Keamanan Jaringan Wi-Fi',
            'status' => 'submitted',
        ]);

        // Kirim request sebagai user yang terautentikasi
        $response = $this->actingAs($this->user)
            ->get('/submissions');

        $response->assertStatus(200);
        
        // Memastikan komponen React Inertia "Submission/Index" dirender dengan membawa data
        $response->assertInertia(fn ($page) => $page
            ->component('Submission/Index')
            ->has('submissions', 1)
            ->where('submissions.0.title', 'Analisis Keamanan Jaringan Wi-Fi')
            ->where('submissions.0.status', 'submitted')
        );
    }

    /**
     * Test pembuatan submisi baru dengan data valid beserta berkas naskah utama.
     */
    public function test_author_can_create_submission_with_manuscript_file(): void
    {
        Storage::fake('local');

        $file = UploadedFile::fake()->create('naskah_ilmiah.docx', 2048, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        $submissionData = [
            'journal_id' => $this->journal->id,
            'title' => 'Deteksi Malware pada Berkas Media MP4',
            'abstract' => 'Penelitian ini membahas mengenai kerentanan eksekusi kode berbahaya pada format kontainer MP4...',
            'keywords' => 'Malware, MP4, Keamanan Media, Cybersecurity',
            'status' => 'submitted',
            'manuscript' => $file,
        ];

        $response = $this->actingAs($this->user)
            ->post('/submissions', $submissionData);

        // Memastikan redirect kembali ke halaman indeks setelah sukses menyimpan
        $response->assertRedirect('/submissions');

        // Verifikasi database utama mencatat submisi baru
        $this->assertDatabaseHas('submissions', [
            'author_id' => $this->user->id,
            'journal_id' => $this->journal->id,
            'title' => 'Deteksi Malware pada Berkas Media MP4',
            'abstract' => 'Penelitian ini membahas mengenai kerentanan eksekusi kode berbahaya pada format kontainer MP4...',
            'keywords' => 'Malware, MP4, Keamanan Media, Cybersecurity',
            'status' => 'submitted'
        ]);

        // Ambil ID submisi yang baru saja dibuat
        $submission = Submission::where('title', 'Deteksi Malware pada Berkas Media MP4')->first();

        // Verifikasi tabel submission_files menyimpan relasi berkas naskah utama (manuscript)
        $this->assertDatabaseHas('submission_files', [
            'submission_id' => $submission->id,
            'file_name' => 'naskah_ilmiah.docx',
            'file_type' => 'manuscript'
        ]);
    }

    /**
     * Test status OJS baru tervalidasi dengan ketat sesuai struktur database.
     */
    public function test_submission_status_must_be_within_valid_editorial_options(): void
    {
        $this->actingAs($this->user);

        // 1. Mencoba menyimpan status OJS baru yang VALID (contoh: under_review)
        $validData = [
            'journal_id' => $this->journal->id,
            'title' => 'Valid Editorial Status Test',
            'abstract' => 'Abstract content here...',
            'keywords' => 'test',
            'status' => 'under_review', // Status Valid
        ];

        $responseValid = $this->post('/submissions', $validData);
        $responseValid->assertRedirect('/submissions');
        $this->assertDatabaseHas('submissions', ['status' => 'under_review']);

        // 2. Mencoba menyimpan status INVALID (tidak ada di skema enum migrasi)
        $invalidData = [
            'journal_id' => $this->journal->id,
            'title' => 'Invalid Status Test',
            'abstract' => 'Abstract content here...',
            'keywords' => 'test',
            'status' => 'arbitrary_status_yang_salah', // Status Tidak Valid
        ];

        $responseInvalid = $this->post('/submissions', $invalidData);
        
        // Memastikan request gagal divalidasi dan kembali dengan membawa error session
        $responseInvalid->assertSessionHasErrors(['status']);
    }

    /**
     * Test penghapusan submisi beserta berkas fisiknya (SoftDeletes).
     */
    public function test_author_can_delete_their_own_submission(): void
    {
        $submission = Submission::factory()->create([
            'author_id' => $this->user->id,
            'journal_id' => $this->journal->id,
            'title' => 'Artikel untuk Dihapus',
            'status' => 'draft'
        ]);

        $response = $this->actingAs($this->user)
            ->delete("/submissions/{$submission->id}");

        $response->assertRedirect('/submissions');

        // Memastikan data telah disembunyikan menggunakan soft deletes
        $this->assertSoftDeleted('submissions', [
            'id' => $submission->id
        ]);
    }
}