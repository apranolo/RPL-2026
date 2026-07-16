<?php

use App\Models\Journal;
use App\Models\JournalAssessment;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Facades\Notification;

/*
|--------------------------------------------------------------------------
| ReviewDecisionTest
|--------------------------------------------------------------------------
|
| Feature tests untuk ReviewController (Summary) dan DecisionController
| (Approve/Reject Proposal & Assessment).
|
| @author FAHMI HIDAYAT
*/

/*
|--------------------------------------------------------------------------
| Setup Helpers
|--------------------------------------------------------------------------
*/

/**
 * Seed roles, universities, users, and return shared test data.
 */
function seedDecisionTestData(): array
{
    // Create roles
    $superAdminRole = Role::create([
        'name' => Role::SUPER_ADMIN,
        'display_name' => 'Super Administrator',
        'description' => 'Full access',
    ]);

    $adminKampusRole = Role::create([
        'name' => Role::ADMIN_KAMPUS,
        'display_name' => 'Administrator Kampus',
        'description' => 'University Administrator',
    ]);

    $userRole = Role::create([
        'name' => Role::USER,
        'display_name' => 'Pengelola Jurnal',
        'description' => 'Journal Manager',
    ]);

    // Create universities
    $university = University::create([
        'name' => 'Universitas Test 1',
        'code' => 'UT1',
        'address' => 'Alamat Test 1',
    ]);

    $otherUniversity = University::create([
        'name' => 'Universitas Test 2',
        'code' => 'UT2',
        'address' => 'Alamat Test 2',
    ]);

    // Create users
    $superAdmin = User::factory()->create([
        'name' => 'Super Admin Test',
        'email' => 'superadmin@test.com',
        'role_id' => $superAdminRole->id,
        'university_id' => null,
    ]);

    $adminKampus = User::factory()->create([
        'name' => 'Admin Kampus 1',
        'email' => 'adminkampus1@test.com',
        'role_id' => $adminKampusRole->id,
        'university_id' => $university->id,
    ]);

    $otherAdminKampus = User::factory()->create([
        'name' => 'Admin Kampus 2',
        'email' => 'adminkampus2@test.com',
        'role_id' => $adminKampusRole->id,
        'university_id' => $otherUniversity->id,
    ]);

    $regularUser = User::factory()->create([
        'name' => 'User Biasa',
        'email' => 'user@test.com',
        'role_id' => $userRole->id,
        'university_id' => $university->id,
    ]);

    return compact(
        'superAdmin',
        'adminKampus',
        'otherAdminKampus',
        'regularUser',
        'university',
        'otherUniversity',
    );
}

/*
|--------------------------------------------------------------------------
| Review Summary Tests (GET /admin/reviews/summary)
|--------------------------------------------------------------------------
*/

test('super admin can access review summary page', function () {
    $data = seedDecisionTestData();

    $response = $this->actingAs($data['superAdmin'])
        ->get(route('admin.reviews.summary'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Reviewer/Summary')
        ->has('globalStats')
        ->has('gradeDistribution')
        ->has('filterOptions')
    );
});

test('regular user cannot access review summary page', function () {
    $data = seedDecisionTestData();

    $response = $this->actingAs($data['regularUser'])
        ->get(route('admin.reviews.summary'));

    $response->assertForbidden();
});

/*
|--------------------------------------------------------------------------
| Decision — Proposal Approve Tests (POST /admin/decision/decide)
|--------------------------------------------------------------------------
*/

test('super admin can approve a proposal', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $schema = ResearchSchema::create([
        'name' => 'Penelitian Dasar',
        'description' => 'Skema dasar',
    ]);

    $proposal = Proposal::create([
        'title' => 'Proposal Penelitian AI',
        'description' => 'Deskripsi proposal',
        'user_id' => $data['regularUser']->id,
        'research_schema_id' => $schema->id,
        'status_proposal' => 'Pending',
    ]);

    $response = $this->actingAs($data['superAdmin'])
        ->post(route('admin.decision.decide'), [
            'type' => 'proposal',
            'id' => $proposal->id,
            'decision' => 'approved',
            'reason' => null,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $proposal->refresh();
    expect($proposal->status_proposal)->toBe('Diterima');
    expect($proposal->rejection_reason)->toBeNull();
});

test('super admin can reject a proposal with reason', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $schema = ResearchSchema::create([
        'name' => 'Penelitian Terapan',
        'description' => 'Skema terapan',
    ]);

    $proposal = Proposal::create([
        'title' => 'Proposal Ditolak',
        'description' => 'Deskripsi proposal',
        'user_id' => $data['regularUser']->id,
        'research_schema_id' => $schema->id,
        'status_proposal' => 'Pending',
    ]);

    $response = $this->actingAs($data['superAdmin'])
        ->post(route('admin.decision.decide'), [
            'type' => 'proposal',
            'id' => $proposal->id,
            'decision' => 'rejected',
            'reason' => 'Proposal belum memenuhi standar minimum kualitas penelitian.',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $proposal->refresh();
    expect($proposal->status_proposal)->toBe('Ditolak');
    expect($proposal->rejection_reason)->toBe('Proposal belum memenuhi standar minimum kualitas penelitian.');
});

test('admin kampus can approve a proposal from their university', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $schema = ResearchSchema::create([
        'name' => 'Penelitian Dasar',
        'description' => 'Skema dasar',
    ]);

    $proposal = Proposal::create([
        'title' => 'Proposal Kampus Sendiri',
        'description' => 'Deskripsi proposal',
        'user_id' => $data['regularUser']->id,
        'research_schema_id' => $schema->id,
        'status_proposal' => 'Pending',
    ]);

    $response = $this->actingAs($data['adminKampus'])
        ->post(route('admin.decision.decide'), [
            'type' => 'proposal',
            'id' => $proposal->id,
            'decision' => 'diterima',
            'reason' => null,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $proposal->refresh();
    expect($proposal->status_proposal)->toBe('Diterima');
});

test('admin kampus cannot approve a proposal from another university', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $schema = ResearchSchema::create([
        'name' => 'Penelitian Dasar',
        'description' => 'Skema dasar',
    ]);

    // regularUser belongs to $university, otherAdminKampus belongs to $otherUniversity
    $proposal = Proposal::create([
        'title' => 'Proposal Universitas Lain',
        'description' => 'Deskripsi proposal',
        'user_id' => $data['regularUser']->id,
        'research_schema_id' => $schema->id,
        'status_proposal' => 'Pending',
    ]);

    $response = $this->actingAs($data['otherAdminKampus'])
        ->post(route('admin.decision.decide'), [
            'type' => 'proposal',
            'id' => $proposal->id,
            'decision' => 'approved',
            'reason' => null,
        ]);

    $response->assertForbidden();
});

test('rejection requires a reason of minimum 10 characters', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $schema = ResearchSchema::create([
        'name' => 'Penelitian Dasar',
        'description' => 'Skema dasar',
    ]);

    $proposal = Proposal::create([
        'title' => 'Proposal Validasi',
        'description' => 'Deskripsi proposal',
        'user_id' => $data['regularUser']->id,
        'research_schema_id' => $schema->id,
        'status_proposal' => 'Pending',
    ]);

    // Missing reason for rejection
    $response = $this->actingAs($data['superAdmin'])
        ->post(route('admin.decision.decide'), [
            'type' => 'proposal',
            'id' => $proposal->id,
            'decision' => 'rejected',
            'reason' => null,
        ]);

    $response->assertSessionHasErrors('reason');
});

test('regular user cannot access decision endpoint', function () {
    $data = seedDecisionTestData();

    $response = $this->actingAs($data['regularUser'])
        ->post(route('admin.decision.decide'), [
            'type' => 'proposal',
            'id' => 1,
            'decision' => 'approved',
        ]);

    $response->assertForbidden();
});

/*
|--------------------------------------------------------------------------
| Decision — Assessment Approve/Reject Tests
|--------------------------------------------------------------------------
*/

test('super admin can approve a journal assessment', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $journal = Journal::factory()->create([
        'user_id' => $data['regularUser']->id,
        'university_id' => $data['university']->id,
    ]);

    $assessment = JournalAssessment::factory()->create([
        'journal_id' => $journal->id,
        'user_id' => $data['regularUser']->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $response = $this->actingAs($data['superAdmin'])
        ->post(route('admin.decision.decide'), [
            'type' => 'assessment',
            'id' => $assessment->id,
            'decision' => 'approved',
            'reason' => null,
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $assessment->refresh();
    expect($assessment->status)->toBe('reviewed');
    expect($assessment->reviewed_by)->toBe($data['superAdmin']->id);
    expect($assessment->reviewed_at)->not()->toBeNull();
});

test('super admin can reject a journal assessment back to draft', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $journal = Journal::factory()->create([
        'user_id' => $data['regularUser']->id,
        'university_id' => $data['university']->id,
    ]);

    $assessment = JournalAssessment::factory()->create([
        'journal_id' => $journal->id,
        'user_id' => $data['regularUser']->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $response = $this->actingAs($data['superAdmin'])
        ->post(route('admin.decision.decide'), [
            'type' => 'assessment',
            'id' => $assessment->id,
            'decision' => 'ditolak',
            'reason' => 'Penilaian perlu diperbaiki: indikator X belum diisi lengkap.',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $assessment->refresh();
    expect($assessment->status)->toBe('draft');
    expect($assessment->admin_kampus_approval_notes)->toBe('Penilaian perlu diperbaiki: indikator X belum diisi lengkap.');
});

test('admin kampus cannot approve assessment from another university', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    // Journal in $university, but acting as $otherAdminKampus
    $journal = Journal::factory()->create([
        'user_id' => $data['regularUser']->id,
        'university_id' => $data['university']->id,
    ]);

    $assessment = JournalAssessment::factory()->create([
        'journal_id' => $journal->id,
        'user_id' => $data['regularUser']->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $response = $this->actingAs($data['otherAdminKampus'])
        ->post(route('admin.decision.decide'), [
            'type' => 'assessment',
            'id' => $assessment->id,
            'decision' => 'approved',
            'reason' => null,
        ]);

    $response->assertForbidden();
});

test('decision validation rejects invalid type', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $response = $this->actingAs($data['superAdmin'])
        ->post(route('admin.decision.decide'), [
            'type' => 'invalid_type',
            'id' => 1,
            'decision' => 'approved',
        ]);

    $response->assertSessionHasErrors('type');
});

test('decision validation rejects invalid decision value', function () {
    Notification::fake();
    $data = seedDecisionTestData();

    $response = $this->actingAs($data['superAdmin'])
        ->post(route('admin.decision.decide'), [
            'type' => 'proposal',
            'id' => 1,
            'decision' => 'maybe',
        ]);

    $response->assertSessionHasErrors('decision');
});
