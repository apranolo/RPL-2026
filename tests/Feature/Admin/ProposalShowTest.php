<?php

namespace Tests\Feature\Admin;

use App\Models\Proposal;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProposalShowTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_view_proposal_detail_page()
    {
        $adminRole = Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);
        $admin = User::factory()->create(['role_id' => $adminRole->id]);

        $proposal = Proposal::factory()->create([
            'status_proposal' => Proposal::STATUS_ADMINISTRASI_VALID,
        ]);

        $response = $this
            ->actingAs($admin)
            ->get(route('admin.proposals.show', ['proposal' => $proposal->id]));

        $response->assertStatus(200);
    }
}
