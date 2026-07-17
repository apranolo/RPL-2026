<?php

namespace Tests\Feature;

use App\Models\Journal;
use App\Models\Submission;
use App\Models\SubmissionContributor;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class SubmissionContributorTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Journal $journal;
    protected Submission $submission;

    /**
     * Setup state awal sebelum setiap test.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->journal = Journal::factory()->create();
        $this->submission = Submission::factory()->create([
            'author_id' => $this->user->id,
            'journal_id' => $this->journal->id,
        ]);
    }

    /**
     * Test author can view the step 4 page.
     */
    public function test_author_can_view_step4_page(): void
    {
        $response = $this->actingAs($this->user)
            ->get("/submissions/wizard/{$this->submission->id}/step4");

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Submission/Wizard/Step4Contributors')
            ->has('submission')
            ->where('submission.id', $this->submission->id)
        );
    }

    /**
     * Test other users cannot access the submission wizard page.
     */
    public function test_other_users_cannot_access_step4_page(): void
    {
        $otherUser = User::factory()->create();

        $response = $this->actingAs($otherUser)
            ->get("/submissions/wizard/{$this->submission->id}/step4");

        $response->assertStatus(403);
    }

    /**
     * Test author can successfully save contributors.
     */
    public function test_author_can_save_contributors(): void
    {
        $contributorsData = [
            'contributors' => [
                [
                    'name' => 'First Author',
                    'email' => 'first@example.com',
                    'affiliation' => 'University A',
                    'is_corresponding' => true,
                ],
                [
                    'name' => 'Second Author',
                    'email' => 'second@example.com',
                    'affiliation' => 'University B',
                    'is_corresponding' => false,
                ],
            ]
        ];

        $response = $this->actingAs($this->user)
            ->post("/submissions/wizard/{$this->submission->id}/step4", $contributorsData);

        // Assert it redirects to step 5
        $response->assertRedirect("/submissions/wizard/{$this->submission->id}/step5");

        // Verify in the database
        $this->assertDatabaseHas('submission_contributors', [
            'submission_id' => $this->submission->id,
            'name' => 'First Author',
            'email' => 'first@example.com',
            'affiliation' => 'University A',
            'is_corresponding' => true,
        ]);

        $this->assertDatabaseHas('submission_contributors', [
            'submission_id' => $this->submission->id,
            'name' => 'Second Author',
            'email' => 'second@example.com',
            'affiliation' => 'University B',
            'is_corresponding' => false,
        ]);

        $this->assertEquals(2, $this->submission->contributors()->count());
    }

    /**
     * Test saving contributors validates required fields.
     */
    public function test_saving_contributors_requires_valid_data(): void
    {
        $invalidData = [
            'contributors' => [
                [
                    'name' => '', // Empty name
                    'email' => 'invalid-email', // Invalid email format
                    'affiliation' => '', // Empty affiliation
                    'is_corresponding' => true,
                ]
            ]
        ];

        $response = $this->actingAs($this->user)
            ->post("/submissions/wizard/{$this->submission->id}/step4", $invalidData);

        $response->assertSessionHasErrors([
            'contributors.0.name',
            'contributors.0.email',
            'contributors.0.affiliation',
        ]);
    }

    /**
     * Test author can save contributors as draft.
     */
    public function test_author_can_save_contributors_as_draft(): void
    {
        $contributorsData = [
            'contributors' => [
                [
                    'name' => 'Draft Author',
                    'email' => 'draft@example.com',
                    'affiliation' => 'University C',
                    'is_corresponding' => true,
                ],
            ]
        ];

        $response = $this->actingAs($this->user)
            ->post("/submissions/wizard/{$this->submission->id}/step4?action=draft", $contributorsData);

        // Redirects back when saving draft
        $response->assertStatus(302);

        $this->assertDatabaseHas('submission_contributors', [
            'submission_id' => $this->submission->id,
            'name' => 'Draft Author',
            'email' => 'draft@example.com',
            'is_corresponding' => true,
        ]);
    }
}
