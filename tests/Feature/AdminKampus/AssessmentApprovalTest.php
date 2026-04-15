<?php

namespace Tests\Feature\AdminKampus;

use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentApprovalTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminKampus;

    protected User $otherAdminKampus;

    protected University $university;

    protected University $otherUniversity;

    protected function setUp(): void
    {
        parent::setUp();

        // Create roles
        $adminKampusRole = Role::create([
            'name' => 'Admin Kampus',
            'display_name' => 'Admin Kampus',
            'description' => 'University Administrator',
        ]);

        // Create universities
        $this->university = University::create([
            'name' => 'Universitas Test 1',
            'code' => 'UT1',
            'address' => 'Test Address 1',
        ]);

        $this->otherUniversity = University::create([
            'name' => 'Universitas Test 2',
            'code' => 'UT2',
            'address' => 'Test Address 2',
        ]);

        // Create Admin Kampus users
        $this->adminKampus = User::factory()->create([
            'name' => 'Admin Kampus 1',
            'email' => 'admin1@test.com',
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->otherAdminKampus = User::factory()->create([
            'name' => 'Admin Kampus 2',
            'email' => 'admin2@test.com',
            'role_id' => $adminKampusRole->id,
            'university_id' => $this->otherUniversity->id,
            'is_active' => true,
        ]);
    }

    public function test_admin_kampus_can_view_submitted_assessments_from_own_university(): void
    {
        // Create user and journal in same university
        $userRole = Role::create(['name' => 'User', 'display_name' => 'User']);
        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->university->id,
        ]);

        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $user->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.assessments.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AdminKampus/Assessments/Index')
            ->has('assessments.data', 1)
        );
    }

    public function test_admin_kampus_cannot_view_assessments_from_other_universities(): void
    {
        // Create assessment in other university
        $userRole = Role::create(['name' => 'User', 'display_name' => 'User']);
        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->otherUniversity->id,
        ]);

        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $this->otherUniversity->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $user->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->get(route('admin-kampus.assessments.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('AdminKampus/Assessments/Index')
            ->has('assessments.data', 0) // Should see 0 assessments
        );
    }

    public function test_admin_kampus_can_approve_assessment_with_timestamp(): void
    {
        $userRole = Role::create(['name' => 'User', 'display_name' => 'User']);
        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->university->id,
        ]);

        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $user->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Assessment looks good, approved!',
            ]);

        $response->assertRedirect(route('admin-kampus.assessments.index'));
        $response->assertSessionHas('success');

        $assessment->refresh();

        $this->assertEquals('reviewed', $assessment->status);
        $this->assertEquals($this->adminKampus->id, $assessment->reviewed_by);
        $this->assertNotNull($assessment->reviewed_at);
        $this->assertEquals('Assessment looks good, approved!', $assessment->admin_kampus_approval_notes);
    }

    public function test_admin_kampus_can_reject_assessment_with_notes(): void
    {
        $userRole = Role::create(['name' => 'User', 'display_name' => 'User']);
        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->university->id,
        ]);

        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $user->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.request-revision', $assessment), [
                'admin_notes' => 'Please provide more details on indicator X',
            ]);

        $response->assertRedirect(route('admin-kampus.assessments.index'));
        $response->assertSessionHas('success');

        $assessment->refresh();

        $this->assertEquals('draft', $assessment->status);
        $this->assertEquals($this->adminKampus->id, $assessment->admin_kampus_approved_by);
        $this->assertNotNull($assessment->admin_kampus_approved_at);
        $this->assertEquals('Please provide more details on indicator X', $assessment->admin_kampus_approval_notes);
    }

    public function test_admin_kampus_cannot_approve_assessment_from_other_university(): void
    {
        // Create assessment in other university
        $userRole = Role::create(['name' => 'User', 'display_name' => 'User']);
        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->otherUniversity->id,
        ]);

        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $this->otherUniversity->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $user->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Trying to approve',
            ]);

        $response->assertForbidden(); // Should be denied by policy
    }

    public function test_admin_kampus_can_only_review_submitted_assessments(): void
    {
        $userRole = Role::create(['name' => 'User', 'display_name' => 'User']);
        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->university->id,
        ]);

        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $this->university->id,
        ]);

        // Create assessment in draft status
        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $user->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.approve', $assessment), [
                'admin_notes' => 'Trying to approve draft',
            ]);

        $response->assertForbidden(); // Policy should prevent this
    }

    public function test_approval_notes_are_required_for_rejection(): void
    {
        $userRole = Role::create(['name' => 'User', 'display_name' => 'User']);
        $user = User::factory()->create([
            'role_id' => $userRole->id,
            'university_id' => $this->university->id,
        ]);

        $journal = Journal::factory()->create([
            'user_id' => $user->id,
            'university_id' => $this->university->id,
        ]);

        $assessment = JournalAssessment::factory()->create([
            'journal_id' => $journal->id,
            'user_id' => $user->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($this->adminKampus)
            ->post(route('admin-kampus.assessments.request-revision', $assessment), [
                'admin_notes' => '', // Empty notes
            ]);

        $response->assertSessionHasErrors('admin_notes');
    }
}
