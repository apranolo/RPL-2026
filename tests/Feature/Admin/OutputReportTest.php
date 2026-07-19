<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class OutputReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    public function test_super_admin_can_access_report_page()
    {
        $superAdmin = User::factory()->superAdmin()->create();

        // Create dummy output
        DB::table('outputs')->insert([
            'title' => 'Test',
            'type' => 'Jurnal',
            'year' => '2025',
            'user_id' => $superAdmin->id,
            'status' => 'verified',
            'created_at' => now(),
            'updated_at' => now(),
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
        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)->get(route('admin.output.export'));

        $response->assertStatus(200);
        $response->assertHeader('Content-Disposition');
        $this->assertStringContainsString('attachment;', $response->headers->get('Content-Disposition'));
    }

    public function test_stats_api_returns_correct_data_for_super_admin()
    {
        $role = Role::firstOrCreate(['name' => Role::SUPER_ADMIN]);
        $superAdmin = User::factory()->create();
        $superAdmin->roles()->syncWithoutDetaching([$role->id]);

        DB::table('outputs')->insert([
            [
                'title' => 'Test 1',
                'type' => 'Jurnal',
                'year' => '2025',
                'user_id' => $superAdmin->id,
                'status' => 'verified',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Test 2',
                'type' => 'Jurnal',
                'year' => '2025',
                'user_id' => $superAdmin->id,
                'status' => 'verified',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Test 3',
                'type' => 'Buku',
                'year' => '2025',
                'user_id' => $superAdmin->id,
                'status' => 'verified',
                'created_at' => now(),
                'updated_at' => now(),
            ],
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

        $adminKampus = User::factory()->adminKampus($univ1->id)->create();
        $user1 = User::factory()->user()->create(['university_id' => $univ1->id]);
        $user2 = User::factory()->user()->create(['university_id' => $univ2->id]);

        // Output for univ1
        DB::table('outputs')->insert([
            'title' => 'Test',
            'type' => 'Jurnal',
            'year' => '2025',
            'user_id' => $user1->id,
            'status' => 'verified',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Output for univ2
        DB::table('outputs')->insert([
            'title' => 'Test',
            'type' => 'Jurnal',
            'year' => '2025',
            'user_id' => $user2->id,
            'status' => 'verified',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $responseCategory = $this->actingAs($adminKampus)->getJson('/api/stats/outputs/by-category');
        $responseCategory->assertStatus(200)
            ->assertJsonPath('meta.grand_total', 1);
    }
}
