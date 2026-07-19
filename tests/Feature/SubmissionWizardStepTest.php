<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Submission;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SubmissionWizardStepTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function guest_cannot_access_submission_steps()
    {
        $response = $this->get(route('submission.step1'));
        $response->assertRedirect('/login');
    }

    /** @test */
    public function user_can_store_step_1_and_it_creates_draft_in_database()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('submission.step1.store'), [
            'journal_id' => 1,
            'agreement1' => true,
            'agreement2' => true,
            'agreement3' => true,
            'agreement4' => true,
        ]);

        $response->assertRedirect(route('submission.step2'));
        
        $this->assertDatabaseHas('submissions', [
            'author_id' => $user->id,
            'journal_id' => 1,
            'status' => 'Draft',
        ]);
    }
}