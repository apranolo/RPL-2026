<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProposalNavigationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_accessing_proposal_route_displays_proposal_index(): void
    {
        $userRole = Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'User']);
        $user = User::factory()->create(['role_id' => $userRole->id]);

        $response = $this->actingAs($user)->get('/proposal');

        $response->assertStatus(200);
    }

    public function test_admin_kampus_can_access_admin_proposals(): void
    {
        $adminRole = Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Admin Kampus']);
        $user = User::factory()->create(['role_id' => $adminRole->id]);

        $response = $this->actingAs($user)->get('/admin/proposals');

        $response->assertStatus(200);
    }

    public function test_super_admin_can_access_admin_proposals(): void
    {
        $superAdminRole = Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);
        $user = User::factory()->create(['role_id' => $superAdminRole->id]);

        $response = $this->actingAs($user)->get('/admin/proposals');

        $response->assertStatus(200);
    }

    public function test_admin_kampus_can_approve_proposal(): void
    {
        $university = \App\Models\University::factory()->create();

        $adminRole = Role::firstOrCreate(['name' => Role::ADMIN_KAMPUS], ['display_name' => 'Admin Kampus']);
        $adminKampus = User::factory()->create(['role_id' => $adminRole->id, 'university_id' => $university->id]);

        $dosenRole = Role::firstOrCreate(['name' => Role::USER], ['display_name' => 'User']);
        $dosen = User::factory()->create(['role_id' => $dosenRole->id, 'university_id' => $university->id]);

        $schema = \App\Models\ResearchSchema::create(['name' => 'Skema Test']);
        $proposal = \App\Models\Proposal::create([
            'title' => 'Proposal Admin Kampus Test',
            'description' => 'Deskripsi Test',
            'user_id' => $dosen->id,
            'research_schema_id' => $schema->id,
            'status_proposal' => \App\Models\Proposal::STATUS_SUBMITTED,
        ]);

        $response = $this->actingAs($adminKampus)->post("/admin/proposals/{$proposal->id}/approve");

        $response->assertRedirect(route('admin.proposals.index'));
        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'status_proposal' => \App\Models\Proposal::STATUS_ADMINISTRASI_VALID,
        ]);
    }
}
