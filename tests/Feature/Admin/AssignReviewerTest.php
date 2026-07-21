<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssignReviewerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function admin_can_assign_reviewer()
    {
        // Login sebagai admin
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        // Reviewer
        $reviewer = User::factory()->create([
            'role' => 'reviewer',
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
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('reviews', [
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
        ]);
    }

    /** @test */
    public function validation_fails_if_required_fields_are_missing()
    {
        $admin = User::factory()->create([
            'role' => 'admin',
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
