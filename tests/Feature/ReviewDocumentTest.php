<?php

namespace Tests\Feature;

use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Review;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewDocumentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles using helper
        $this->seedRoles();

        // Ensure Reviewer role exists in tests
        Role::firstOrCreate(
            ['name' => Role::REVIEWER],
            [
                'display_name' => 'Reviewer',
                'description' => 'Reviewer role description',
            ]
        );
    }

    public function test_guest_cannot_print_berita_acara()
    {
        $university = University::factory()->create();
        $proposer = User::factory()->user($university->id)->create();

        $schema = ResearchSchema::create([
            'name' => 'Skema Cetak',
            'description' => 'Desc',
        ]);

        $proposal = Proposal::create([
            'title' => 'Proposal Cetak Test',
            'description' => 'Desc',
            'user_id' => $proposer->id,
            'research_schema_id' => $schema->id,
        ]);

        $reviewerRoleId = Role::where('name', Role::REVIEWER)->value('id');
        $reviewer = User::factory()->create([
            'role_id' => $reviewerRoleId,
            'university_id' => $university->id,
            'is_reviewer' => true,
        ]);

        $review = Review::create([
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
            'score' => 87.50,
            'feedback' => 'Bagus sekali.',
            'recommendation' => 'accepted',
            'reviewed_at' => now(),
        ]);

        $response = $this->get(route('review.print', ['type' => 'proposal', 'id' => $review->id]));
        $response->assertRedirect('/login');
    }

    public function test_authorized_reviewer_can_print_berita_acara()
    {
        $university = University::factory()->create();
        $proposer = User::factory()->user($university->id)->create();

        $schema = ResearchSchema::create([
            'name' => 'Skema Cetak',
            'description' => 'Desc',
        ]);

        $proposal = Proposal::create([
            'title' => 'Proposal Cetak Test',
            'description' => 'Desc',
            'user_id' => $proposer->id,
            'research_schema_id' => $schema->id,
        ]);

        $reviewerRoleId = Role::where('name', Role::REVIEWER)->value('id');
        $reviewer = User::factory()->create([
            'role_id' => $reviewerRoleId,
            'university_id' => $university->id,
            'is_reviewer' => true,
        ]);

        $review = Review::create([
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
            'score' => 87.50,
            'feedback' => 'Bagus sekali.',
            'recommendation' => 'accepted',
            'reviewed_at' => now(),
        ]);

        $response = $this->actingAs($reviewer)->get(route('review.print', ['type' => 'proposal', 'id' => $review->id]));

        $response->assertStatus(200);
        $response->assertViewIs('print.berita_acara');
        $response->assertViewHasAll(['type', 'review', 'proposal']);
    }

    public function test_proposer_can_print_their_own_berita_acara()
    {
        $university = University::factory()->create();
        $proposer = User::factory()->user($university->id)->create();

        $schema = ResearchSchema::create([
            'name' => 'Skema Cetak 2',
            'description' => 'Desc',
        ]);

        $proposal = Proposal::create([
            'title' => 'Proposal Cetak Test 2',
            'description' => 'Desc',
            'user_id' => $proposer->id,
            'research_schema_id' => $schema->id,
        ]);

        $reviewerRoleId = Role::where('name', Role::REVIEWER)->value('id');
        $reviewer = User::factory()->create([
            'role_id' => $reviewerRoleId,
            'university_id' => $university->id,
            'is_reviewer' => true,
        ]);

        $review = Review::create([
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
            'score' => 87.50,
            'feedback' => 'Bagus sekali.',
            'recommendation' => 'accepted',
            'reviewed_at' => now(),
        ]);

        $response = $this->actingAs($proposer)->get(route('review.print', ['type' => 'proposal', 'id' => $review->id]));

        $response->assertStatus(200);
        $response->assertViewIs('print.berita_acara');
    }

    public function test_admin_kampus_can_print_berita_acara_from_their_university()
    {
        $university = University::factory()->create();
        $admin = User::factory()->adminKampus($university->id)->create();
        $proposer = User::factory()->user($university->id)->create();

        $schema = ResearchSchema::create([
            'name' => 'Skema Cetak 3',
            'description' => 'Desc',
        ]);

        $proposal = Proposal::create([
            'title' => 'Proposal Cetak Test 3',
            'description' => 'Desc',
            'user_id' => $proposer->id,
            'research_schema_id' => $schema->id,
        ]);

        $reviewerRoleId = Role::where('name', Role::REVIEWER)->value('id');
        $reviewer = User::factory()->create([
            'role_id' => $reviewerRoleId,
            'university_id' => $university->id,
            'is_reviewer' => true,
        ]);

        $review = Review::create([
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
            'score' => 87.50,
            'feedback' => 'Bagus sekali.',
            'recommendation' => 'accepted',
            'reviewed_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('review.print', ['type' => 'proposal', 'id' => $review->id]));

        $response->assertStatus(200);
        $response->assertViewIs('print.berita_acara');
    }

    public function test_unauthorized_user_cannot_print_berita_acara()
    {
        $univ1 = University::factory()->create();
        $univ2 = University::factory()->create();

        $proposer = User::factory()->user($univ1->id)->create();

        $schema = ResearchSchema::create([
            'name' => 'Skema Cetak 4',
            'description' => 'Desc',
        ]);

        $proposal = Proposal::create([
            'title' => 'Proposal Cetak Test 4',
            'description' => 'Desc',
            'user_id' => $proposer->id,
            'research_schema_id' => $schema->id,
        ]);

        $reviewerRoleId = Role::where('name', Role::REVIEWER)->value('id');
        $reviewer = User::factory()->create([
            'role_id' => $reviewerRoleId,
            'university_id' => $univ1->id,
            'is_reviewer' => true,
        ]);

        $review = Review::create([
            'proposal_id' => $proposal->id,
            'reviewer_id' => $reviewer->id,
            'score' => 87.50,
            'feedback' => 'Bagus sekali.',
            'recommendation' => 'accepted',
            'reviewed_at' => now(),
        ]);

        $otherUser = User::factory()->user($univ2->id)->create();

        $response = $this->actingAs($otherUser)->get(route('review.print', ['type' => 'proposal', 'id' => $review->id]));

        $response->assertStatus(403);
    }
}
