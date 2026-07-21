<?php

namespace Tests\Feature\Admin;

use App\Models\ResearchOutput;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OutputReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles if necessary, or just create a user with Role::SUPER_ADMIN
        Role::firstOrCreate(['id' => Role::SUPER_ADMIN, 'name' => 'super_admin']);
        Role::firstOrCreate(['id' => Role::ADMIN_KAMPUS, 'name' => 'admin_kampus']);
        Role::firstOrCreate(['id' => Role::USER, 'name' => 'user']);
    }

    public function test_super_admin_can_access_report_page()
    {
        $superAdmin = User::factory()->create(['role_id' => Role::SUPER_ADMIN]);

        // Create dummy output
        ResearchOutput::factory()->create([
            'status' => 'verified',
            'type' => 'Jurnal',
            'year' => '2025',
        ]);

        $response = $this->actingAs($superAdmin)->get(route('admin.output.report'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Output/Report')
            ->has('outputs')
            ->has('statsByType')
            ->has('statsByYear')
        );
    }

    public function test_super_admin_can_download_excel()
    {
        $superAdmin = User::factory()->create(['role_id' => Role::SUPER_ADMIN]);

        $response = $this->actingAs($superAdmin)->get(route('admin.output.export'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Disposition');
        $this->assertStringContainsString('attachment;', $response->headers->get('Content-Disposition'));
    }

    public function test_stats_api_returns_correct_data_for_super_admin()
    {
        $superAdmin = User::factory()->create(['role_id' => Role::SUPER_ADMIN]);

        ResearchOutput::factory()->count(2)->create([
            'status' => 'verified',
            'type' => 'Jurnal',
        ]);
        ResearchOutput::factory()->create([
            'status' => 'verified',
            'type' => 'Buku',
        ]);

        $responseCategory = $this->actingAs($superAdmin)->getJson('/api/stats/outputs/by-category');
        $responseCategory->assertStatus(200)
            ->assertJsonPath('meta.grand_total', 3);

        $responseYearly = $this->actingAs($superAdmin)->getJson('/api/stats/outputs/yearly');
        $responseYearly->assertStatus(200);
    }

    public function test_stats_api_multi_tenancy_for_admin_kampus()
    {
        $univ1 = University::factory()->create();
        $univ2 = University::factory()->create();

        $adminKampus = User::factory()->create([
            'role_id' => Role::ADMIN_KAMPUS,
            'university_id' => $univ1->id,
        ]);

        $user1 = User::factory()->create(['university_id' => $univ1->id, 'role_id' => Role::USER]);
        $user2 = User::factory()->create(['university_id' => $univ2->id, 'role_id' => Role::USER]);

        // Output for univ1
        ResearchOutput::factory()->create([
            'status' => 'verified',
            'user_id' => $user1->id,
        ]);

        // Output for univ2
        ResearchOutput::factory()->create([
            'status' => 'verified',
            'user_id' => $user2->id,
        ]);

        $responseCategory = $this->actingAs($adminKampus)->getJson('/api/stats/outputs/by-category');
        $responseCategory->assertStatus(200)
            ->assertJsonPath('meta.grand_total', 1);
    }
}
