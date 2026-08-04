<?php

namespace Tests\Feature\Reviewer;

use App\Models\EvaluationIndicator;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DynamicMasterCriteriaTest extends TestCase
{
    use RefreshDatabase;

    private User $reviewerUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seedRoles();

        $reviewerRole = Role::firstOrCreate(
            ['name' => Role::REVIEWER],
            ['display_name' => 'Reviewer', 'description' => 'Reviewer proposal']
        );

        $this->reviewerUser = User::factory()->create([
            'role_id' => $reviewerRole->id,
        ]);
        $this->reviewerUser->roles()->attach($reviewerRole);
    }

    public function test_assignments_passes_master_criteria_to_inertia()
    {
        EvaluationIndicator::factory()->create(['is_active' => true, 'sort_order' => 1]);

        $response = $this->actingAs($this->reviewerUser)->get(route('reviewer.assignments.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Reviewer/index')
            ->has('masterCriteria')
        );
    }

    public function test_show_passes_master_criteria_to_inertia()
    {
        $proposal = Proposal::factory()->create();
        $review = Review::factory()->create([
            'reviewer_id' => $this->reviewerUser->id,
            'proposal_id' => $proposal->id,
        ]);
        EvaluationIndicator::factory()->create(['is_active' => true, 'sort_order' => 1]);

        $response = $this->actingAs($this->reviewerUser)->get(route('reviewer.assignments.show', $review->id));

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Reviewer/index')
            ->has('masterCriteria')
            ->has('selectedReview')
        );
    }

    public function test_submit_review_saves_assessment_criteria_and_calculates_average()
    {
        $proposal = Proposal::factory()->create();
        $review = Review::factory()->create([
            'reviewer_id' => $this->reviewerUser->id,
            'proposal_id' => $proposal->id,
        ]);

        $payload = [
            'status' => 'completed',
            'notes' => 'Great proposal',
            'assessment_criteria' => [
                [
                    'criterion' => 'Kesesuaian Metodologi',
                    'score' => 80,
                    'notes' => 'Bagus',
                ],
                [
                    'criterion' => 'Kelayakan Anggaran',
                    'score' => 90,
                    'notes' => 'Sangat Layak',
                ],
            ],
        ];

        $response = $this->actingAs($this->reviewerUser)->post(route('reviewer.assignments.submit-review', $review->id), $payload);

        $response->assertRedirect(route('reviewer.assignments.index'));

        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'score' => 85,
            'total_score' => 85,
        ]);

        $this->assertDatabaseHas('assessment_criterias', [
            'review_id' => $review->id,
            'criterion' => 'Kesesuaian Metodologi',
            'score' => 80,
        ]);

        $this->assertDatabaseHas('assessment_criterias', [
            'review_id' => $review->id,
            'criterion' => 'Kelayakan Anggaran',
            'score' => 90,
        ]);
    }
}
