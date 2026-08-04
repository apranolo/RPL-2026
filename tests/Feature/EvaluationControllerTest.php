<?php

namespace Tests\Feature;

use App\Models\ProgressReport;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluationControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $reviewer;

    private User $dosen;

    private Role $reviewerRole;

    private \App\Models\ResearchSchema $schema;

    protected function setUp(): void
    {
        parent::setUp();

        $this->schema = \App\Models\ResearchSchema::create([
            'name' => 'Skema Dasar',
            'code' => 'SKM-DSR',
            'strata' => 'S1',
            'min_fund' => 10000000,
            'max_fund' => 50000000,
            'duration_months' => 12,
            'is_active' => true,
        ]);

        $this->reviewerRole = Role::create([
            'name' => 'Reviewer',
            'display_name' => 'Reviewer',
            'description' => 'Reviewer role',
        ]);

        $dosenRole = Role::create([
            'name' => 'User',
            'display_name' => 'User',
            'description' => 'User role',
        ]);

        $this->reviewer = User::create([
            'name' => 'Test Reviewer',
            'email' => 'reviewer@test.com',
            'password' => bcrypt('password'),
            'role_id' => $this->reviewerRole->id,
            'is_active' => true,
        ]);

        $this->dosen = User::create([
            'name' => 'Test Dosen',
            'email' => 'dosen@test.com',
            'password' => bcrypt('password'),
            'role_id' => $dosenRole->id,
            'is_active' => true,
        ]);
    }

    /**
     * Test: Reviewer dapat mengakses halaman daftar evaluasi
     */
    public function test_reviewer_dapat_mengakses_halaman_daftar_evaluasi(): void
    {
        $response = $this->actingAs($this->reviewer)
            ->get('/reviewer/evaluations');

        $response->assertStatus(200);
    }

    /**
     * Test: Reviewer tidak dapat mengakses laporan yang bukan tugasnya
     */
    public function test_reviewer_tidak_dapat_mengakses_laporan_bukan_tugasnya(): void
    {
        $proposal = Proposal::create([
            'user_id' => $this->dosen->id,
            'research_schema_id' => $this->schema->id,
            'judul' => 'Proposal Test',
            'deskripsi' => 'Deskripsi test',
            'status_proposal' => 'Draft',
        ]);

        $report = ProgressReport::create([
            'proposal_id' => $proposal->id,
            'user_id' => $this->dosen->id,
            'title' => 'Laporan Test',
            'content' => 'Isi laporan test',
            'report_type' => 'laporan_kemajuan',
            'report_period' => 'Kemajuan',
            'report_date' => now(),
            'progress_percentage' => 50,
            'status' => 'submitted',
        ]);

        // Tidak ada Review assignment untuk reviewer ini
        $response = $this->actingAs($this->reviewer)
            ->get("/reviewer/evaluations/{$report->id}");

        $response->assertStatus(403);
    }

    /**
     * Test: Reviewer dapat mengakses laporan yang ditugaskan kepadanya
     */
    public function test_reviewer_dapat_mengakses_laporan_yang_ditugaskan(): void
    {
        $proposal = Proposal::create([
            'user_id' => $this->dosen->id,
            'research_schema_id' => $this->schema->id,
            'judul' => 'Proposal Test',
            'deskripsi' => 'Deskripsi test',
            'status_proposal' => 'Draft',
        ]);

        // Buat assignment untuk reviewer
        Review::create([
            'proposal_id' => $proposal->id,
            'reviewer_id' => $this->reviewer->id,
            'status' => 'assigned',
            'start_date' => now(),
            'end_date' => now()->addDays(7),
        ]);

        $report = ProgressReport::create([
            'proposal_id' => $proposal->id,
            'user_id' => $this->dosen->id,
            'title' => 'Laporan Test',
            'content' => 'Isi laporan test',
            'report_type' => 'laporan_kemajuan',
            'report_period' => 'Kemajuan',
            'report_date' => now(),
            'progress_percentage' => 50,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->reviewer)
            ->get("/reviewer/evaluations/{$report->id}");

        $response->assertStatus(200);
    }
}
