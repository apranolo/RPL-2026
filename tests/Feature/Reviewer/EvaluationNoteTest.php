<?php

namespace Tests\Feature\Reviewer;

use App\Models\Journal;
use App\Models\Pembinaan;
use App\Models\PembinaanRegistration;
use App\Models\PembinaanReview;
use App\Models\ReviewerAssignment;
use App\Models\Role;
use App\Models\University;
use App\Models\ScientificField;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluationNoteTest extends TestCase
{
    use RefreshDatabase;

    private User $reviewer;
    private User $otherReviewer;
    private PembinaanRegistration $registration;
    private ReviewerAssignment $assignment;

    protected function setUp(): void
    {
        parent::setUp();

        $reviewerRole = Role::firstOrCreate(['name' => 'Reviewer'], ['display_name' => 'Reviewer']);
        $userRole = Role::firstOrCreate(['name' => 'User'], ['display_name' => 'User']);

        $this->reviewer = User::factory()->create(['role_id' => $reviewerRole->id]);
        $this->otherReviewer = User::factory()->create(['role_id' => $reviewerRole->id]);
        $dosen = User::factory()->create(['role_id' => $userRole->id]);

        $university = University::factory()->create();
        $scientificField = ScientificField::factory()->create();

        $journal = Journal::factory()->create([
            'user_id' => $dosen->id,
            'university_id' => $university->id,
            'scientific_field_id' => $scientificField->id,
        ]);
        $pembinaan = Pembinaan::factory()->create();

        $this->registration = PembinaanRegistration::create([
            'user_id' => $dosen->id,
            'journal_id' => $journal->id,
            'pembinaan_id' => $pembinaan->id,
            'status' => 'approved',
            'review_status' => 'menunggu_reviewer',
            'registered_at' => now(),
        ]);

        $this->assignment = ReviewerAssignment::create([
            'registration_id' => $this->registration->id,
            'reviewer_id' => $this->reviewer->id,
            'status' => 'assigned',
            'assigned_at' => now(),
        ]);
    }

    public function test_reviewer_can_submit_evaluation_note()
    {
        $response = $this->actingAs($this->reviewer)
            ->post(route('reviewer.evaluations.storeNote', $this->assignment->id), [
                'score' => 85,
                'feedback' => 'Good progress, need minor revisions.',
                'recommendation' => 'Accept with minor revisions',
            ]);

        $response->assertRedirect(route('reviewer.evaluations.note', $this->assignment->id));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('pembinaan_reviews', [
            'registration_id' => $this->registration->id,
            'reviewer_id' => $this->reviewer->id,
            'score' => 85,
            'feedback' => 'Good progress, need minor revisions.',
        ]);

        $this->assertDatabaseHas('reviewer_assignments', [
            'id' => $this->assignment->id,
            'status' => 'completed',
        ]);

        $this->assertDatabaseHas('pembinaan_registrations', [
            'id' => $this->registration->id,
            'review_status' => 'review_selesai',
        ]);
    }

    public function test_reviewer_cannot_submit_note_for_other_reviewer_assignment()
    {
        $response = $this->actingAs($this->otherReviewer)
            ->post(route('reviewer.evaluations.storeNote', $this->assignment->id), [
                'score' => 90,
                'feedback' => 'Nice work.',
            ]);

        $response->assertStatus(403);
    }
}
