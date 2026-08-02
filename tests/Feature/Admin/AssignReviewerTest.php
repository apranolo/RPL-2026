<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignReviewerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_assign_reviewer()
    {
        $adminRole = Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);
        $reviewerRole = Role::firstOrCreate(['name' => Role::REVIEWER], ['display_name' => 'Reviewer']);

        // Login sebagai admin
        $admin = User::factory()->create([
            'role_id' => $adminRole->id,
        ]);

        // Reviewer
        $reviewer = User::factory()->create([
            'role_id' => $reviewerRole->id,
        ]);

        // Proposal
        $proposal = \App\Models\Proposal::factory()->create();

        $response = $this
            ->actingAs($admin)
            ->post(route('admin.assign.store'), [
                'proposal_id' => $proposal->id,
                'reviewer_id' => $reviewer->id,
            ]);

        $response
            ->assertRedirect(route('admin.proposals.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('reviews', [
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
        ]);
    }

    /** @test */
    public function validation_fails_if_required_fields_are_missing()
    {
        $adminRole = Role::firstOrCreate(['name' => Role::SUPER_ADMIN], ['display_name' => 'Super Admin']);

        $admin = User::factory()->create([
            'role_id' => $adminRole->id,
        ]);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/reviewer/assign')
            ->post(route('admin.assign.store'), []);

        $response
            ->assertRedirect('/admin/reviewer/assign')
            ->assertSessionHasErrors([
                'proposal_id',
                'reviewer_id',
            ]);
    }
}
