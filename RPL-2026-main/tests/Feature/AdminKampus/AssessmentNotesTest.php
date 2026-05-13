<?php

namespace Tests\Feature\AdminKampus;

use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test Assessment Notes Timeline Functionality
 *
 * Tests the creation, retrieval, and timeline display of assessment notes
 * that track the history of an assessment through its lifecycle.
 *
 * @group assessment-notes
 * @group admin-kampus
 */
class AssessmentNotesTest extends TestCase
{
    use RefreshDatabase;

    protected University $university;

    protected User $adminKampus;

    protected User $user;

    protected Role $adminKampusRole;

    protected Role $userRole;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $this->adminKampusRole = Role::create([
            'name' => 'Admin Kampus',
            'display_name' => 'Admin Kampus',
        ]);

        $this->userRole = Role::create([
            'name' => 'User',
            'display_name' => 'User',
        ]);

        // Create university
        $this->university = University::factory()->create();

        // Create Admin Kampus
        $this->adminKampus = User::factory()->create([
            'role_id' => $this->adminKampusRole->id,
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        // Create User
        $this->user = User::factory()->create([
            'role_id' => $this->userRole->id,
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);
    }

    public function test_note_is_created_when_admin_kampus_approves_assessment(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Assessment approved. Good work!',
            ]);

        // Assert note was created
        $this->assertDatabaseHas('assessment_notes', [
            'journal_assessment_id' => $assessment->id,
            'user_id' => $this->adminKampus->id,
            'author_role' => 'Admin Kampus',
            'note_type' => 'approval',
            'content' => 'Assessment approved. Good work!',
        ]);
    }

    public function test_note_is_created_when_admin_kampus_rejects_assessment(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.request-revision', $assessment), [
                'admin_notes' => 'Please provide more evidence for indicator 3.',
            ]);

        // Assert note was created
        $this->assertDatabaseHas('assessment_notes', [
            'journal_assessment_id' => $assessment->id,
            'user_id' => $this->adminKampus->id,
            'author_role' => 'Admin Kampus',
            'note_type' => 'rejection',
            'content' => 'Please provide more evidence for indicator 3.',
        ]);
    }

    public function test_default_note_is_created_when_approval_has_no_admin_notes(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment));

        // Assert default note was created
        $this->assertDatabaseHas('assessment_notes', [
            'journal_assessment_id' => $assessment->id,
            'user_id' => $this->adminKampus->id,
            'author_role' => 'Admin Kampus',
            'note_type' => 'approval',
            'content' => 'Assessment disetujui oleh Admin Kampus (LPPM)',
        ]);
    }

    public function test_multiple_notes_are_stored_chronologically(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        // First action: Reject with notes
        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.request-revision', $assessment), [
                'admin_notes' => 'First review: Need improvements.',
            ]);

        $assessment->refresh();

        // Change status back to submitted (simulating user resubmission)
        $assessment->update(['status' => 'submitted']);

        // Second action: Approve
        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Second review: Much better, approved!',
            ]);

        // Assert both notes exist
        $notes = $assessment->assessmentNotes()->orderBy('created_at')->get();

        $this->assertCount(2, $notes);
        $this->assertEquals('rejection', $notes[0]->note_type);
        $this->assertEquals('First review: Need improvements.', $notes[0]->content);
        $this->assertEquals('approval', $notes[1]->note_type);
        $this->assertEquals('Second review: Much better, approved!', $notes[1]->content);
    }

    public function test_notes_include_author_information(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Approved by admin.',
            ]);

        $note = $assessment->assessmentNotes()->first();

        // Assert author information
        $this->assertNotNull($note);
        $this->assertEquals($this->adminKampus->id, $note->user_id);
        $this->assertEquals('Admin Kampus', $note->author_role);
        $this->assertEquals($this->adminKampus->id, $note->user->id);
        $this->assertEquals($this->adminKampus->name, $note->user->name);
    }

    public function test_notes_can_be_retrieved_with_eager_loading(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        // Create multiple notes
        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.request-revision', $assessment), [
                'admin_notes' => 'Note 1',
            ]);

        $assessment->refresh();
        $assessment->update(['status' => 'submitted']);

        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Note 2',
            ]);

        // Retrieve assessment with notes and refresh to clear relationship cache
        $assessment->refresh();
        $loadedAssessment = JournalAssessment::with(['assessmentNotes.user'])->find($assessment->id);

        // Access relationship using accessor
        $notesCollection = $loadedAssessment->assessmentNotes;

        $this->assertCount(2, $notesCollection);
        $this->assertTrue($loadedAssessment->relationLoaded('assessmentNotes'));
        $this->assertNotNull($notesCollection->first()->user);
    }

    public function test_notes_have_timestamps(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        $beforeTime = now()->subSecond();

        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Timestamped note',
            ]);

        $afterTime = now()->addSecond();

        $assessment->refresh();
        $note = $assessment->assessmentNotes()->first();

        $this->assertNotNull($note->created_at);
        $this->assertTrue(
            $note->created_at->greaterThanOrEqualTo($beforeTime) && $note->created_at->lessThanOrEqualTo($afterTime),
            'Note created_at should be between before and after times'
        );
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $note->created_at);
    }

    public function test_notes_are_deleted_when_assessment_is_deleted(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Test note for deletion',
            ]);

        $assessment->refresh();
        $noteId = $assessment->assessmentNotes()->first()->id;

        // Force delete (hard delete) to trigger cascade
        $assessment->forceDelete();

        // Assert note is also deleted (cascade)
        $this->assertDatabaseMissing('assessment_notes', [
            'id' => $noteId,
        ]);
    }

    public function test_note_content_can_be_long_text(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        $longNote = str_repeat('This is a long note. ', 40); // ~880 characters (under 1000 max)
        $longNote = trim($longNote); // Laravel validation trims input

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => $longNote,
            ]);

        $response->assertRedirect(); // Ensure action completed
        $assessment->refresh();

        $note = $assessment->assessmentNotes()->first();

        $this->assertNotNull($note, 'Note should be created');
        $this->assertEquals($longNote, $note->content);
        $this->assertTrue(strlen($note->content) > 800); // Changed from 1000 to 800
    }

    public function test_different_note_types_are_distinguished(): void
    {
        $journal = Journal::factory()->create([
            'user_id' => $this->user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $this->user->id,
            'status' => 'submitted',
        ]);

        // Create rejection note
        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.request-revision', $assessment), [
                'admin_notes' => 'Rejection note',
            ]);

        $assessment->refresh();
        $assessment->update(['status' => 'submitted']);

        // Create approval note
        $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Approval note',
            ]);

        $assessment->refresh();
        $rejectionNote = $assessment->assessmentNotes()->where('note_type', 'rejection')->first();
        $approvalNote = $assessment->assessmentNotes()->where('note_type', 'approval')->first();

        $this->assertNotNull($rejectionNote);
        $this->assertNotNull($approvalNote);
        $this->assertEquals('rejection', $rejectionNote->note_type);
        $this->assertEquals('approval', $approvalNote->note_type);
        $this->assertNotEquals($rejectionNote->id, $approvalNote->id);
    }
}
