<?php

namespace Tests\Feature\Api;

use App\Models\Proposal;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Catatan asumsi skema (sesuaikan jika berbeda dengan aplikasi kamu):
 * - Ada model + factory App\Models\University.
 * - Tabel `users` punya kolom `university_id` dan `is_active`.
 * - Tabel `proposals` punya kolom `user_id` dan `judul`, serta factory Proposal.
 * - Tabel `research_outputs` punya kolom `proposal_id`.
 * - Guard yang dipakai untuk SPA/Sanctum adalah 'sanctum'.
 */
class TopListTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Endpoint leaderboard tidak boleh diakses tanpa login,
     * karena hasilnya di-scope berdasarkan university_id Admin Kampus.
     */
    public function test_guest_cannot_access_top_lecturers(): void
    {
        $response = $this->getJson('/api/top-lecturers');

        $response->assertUnauthorized();
    }

    public function test_guest_cannot_access_top_research(): void
    {
        $response = $this->getJson('/api/top-research');

        $response->assertUnauthorized();
    }

    /**
     * Admin Kampus A hanya boleh melihat dosen dari kampusnya sendiri,
     * bukan dosen dari kampus lain (aturan multi-tenancy).
     */
    public function test_top_lecturers_only_returns_data_from_admins_university(): void
    {
        $universityA = University::factory()->create();
        $universityB = University::factory()->create();

        $lecturerA = User::factory()->create(['university_id' => $universityA->id]);
        $lecturerB = User::factory()->create(['university_id' => $universityB->id]);

        Proposal::factory()->count(3)->create(['user_id' => $lecturerA->id]);
        Proposal::factory()->count(5)->create(['user_id' => $lecturerB->id]);

        $admin = User::factory()->create(['university_id' => $universityA->id]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/top-lecturers');

        $response->assertOk();
        $response->assertJsonCount(1);
        $response->assertJsonFragment(['name' => $lecturerA->name]);
        $response->assertJsonMissing(['name' => $lecturerB->name]);
    }

    /**
     * Admin Kampus A hanya boleh melihat penelitian (proposal) dari
     * dosen-dosen di kampusnya sendiri.
     */
    public function test_top_research_only_returns_data_from_admins_university(): void
    {
        $universityA = University::factory()->create();
        $universityB = University::factory()->create();

        $lecturerA = User::factory()->create(['university_id' => $universityA->id]);
        $lecturerB = User::factory()->create(['university_id' => $universityB->id]);

        $proposalA = Proposal::factory()->create([
            'user_id' => $lecturerA->id,
            'title' => 'Riset Universitas A',
        ]);
        $proposalB = Proposal::factory()->create([
            'user_id' => $lecturerB->id,
            'title' => 'Riset Universitas B',
        ]);

        $contractA = DB::table('contracts')->insertGetId([
            'university_id' => $universityA->id,
            'proposal_id' => $proposalA->id,
            'contract_number' => 'CON-A-01',
            'title' => $proposalA->title,
            'party_1' => 'Pihak A1',
            'party_2' => 'Pihak A2',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('research_outputs')->insert([
            'contract_id' => $contractA,
            'user_id' => $lecturerA->id,
            'jenis_luaran' => 'Jurnal',
            'judul_luaran' => 'Riset Universitas A',
            'status_verifikasi' => 'Terverifikasi_LPPM',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $admin = User::factory()->create(['university_id' => $universityA->id]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/top-research');

        $response->assertOk();
        $response->assertJsonFragment(['title' => $proposalA->title]);
        $response->assertJsonMissing(['title' => $proposalB->title]);
    }

    /**
     * Ketika belum ada proposal sama sekali di kampus tersebut, endpoint
     * top-lecturers harus fallback ke daftar dosen aktif di kampus yang sama.
     */
    public function test_top_lecturers_fallback_returns_active_users_from_same_university(): void
    {
        $university = University::factory()->create();
        $otherUniversity = University::factory()->create();

        User::factory()->count(3)->create([
            'university_id' => $university->id,
            'is_active' => true,
        ]);

        // Dosen aktif di kampus lain tidak boleh ikut muncul.
        User::factory()->count(2)->create([
            'university_id' => $otherUniversity->id,
            'is_active' => true,
        ]);

        $admin = User::factory()->create(['university_id' => $university->id, 'is_active' => false]);

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/top-lecturers');

        $response->assertOk();
        $response->assertJsonCount(3);
    }
}
