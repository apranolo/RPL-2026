<?php

use App\Models\JournalAssessment;
use App\Models\ReviewSchedule;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseCount;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;
use function Pest\Laravel\delete;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seedRoles();

    $this->superAdmin = User::factory()->superAdmin()->create(['is_active' => true]);

    $this->universityA = University::factory()->create();
    $this->universityB = University::factory()->create();

    $this->adminKampusA = User::factory()->adminKampus($this->universityA->id)->create(['is_active' => true]);
    $this->adminKampusB = User::factory()->adminKampus($this->universityB->id)->create(['is_active' => true]);

    // Create submitted assessments in university A
    $this->assessmentA = JournalAssessment::factory()
        ->submitted()
        ->create();
    // Associate journal with university A
    $this->assessmentA->journal->update(['university_id' => $this->universityA->id]);

    // Create a reviewer in university A
    $this->reviewerA = User::factory()->create([
        'is_reviewer' => true,
        'is_active' => true,
        'university_id' => $this->universityA->id,
    ]);

    // Create submitted assessments in university B
    $this->assessmentB = JournalAssessment::factory()
        ->submitted()
        ->create();
    // Associate journal with university B
    $this->assessmentB->journal->update(['university_id' => $this->universityB->id]);

    $this->reviewerB = User::factory()->create([
        'is_reviewer' => true,
        'is_active' => true,
        'university_id' => $this->universityB->id,
    ]);

    $this->validPayload = [
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
        'scheduled_at' => now()->addDays(3)->format('Y-m-d H:i:s'),
        'ended_at' => now()->addDays(3)->addHours(2)->format('Y-m-d H:i:s'),
        'location' => 'Room 101',
        'meeting_link' => 'https://meet.example.com/test',
        'notes' => 'Please review thoroughly',
    ];
});

// ─── INDEX ───────────────────────────────────────────────

test('super admin can view schedules index', function () {
    ReviewSchedule::factory()->count(3)->create();

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.index'))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 3)
        );
});

test('admin kampus can view schedules index scoped to their university', function () {
    // Create schedule in university A
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);
    // Create schedule in university B
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentB->id,
        'reviewer_id' => $this->reviewerB->id,
    ]);

    actingAs($this->adminKampusA)
        ->get(route('admin.schedules.index'))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );
});

test('admin kampus cannot see schedules from other universities', function () {
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->adminKampusB)
        ->get(route('admin.schedules.index'))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 0)
        );
});

test('search filters schedules by journal title', function () {
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    $title = $this->assessmentA->journal->title;

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.index', ['search' => substr($title, 0, 10)]))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );
});

test('search filters schedules by reviewer name', function () {
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.index', ['search' => $this->reviewerA->name]))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );
});

test('status filter works correctly', function () {
    ReviewSchedule::factory()->scheduled()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);
    ReviewSchedule::factory()->completed()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.index', ['status' => 'completed']))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );
});

// ─── CREATE ──────────────────────────────────────────────

test('super admin can view create page', function () {
    actingAs($this->superAdmin)
        ->get(route('admin.schedules.create'))
        ->assertInertia(fn ($page) => $page->component('Admin/Reviewer/ScheduleCreate'));
});

test('admin kampus cannot view create page', function () {
    actingAs($this->adminKampusA)
        ->get(route('admin.schedules.create'))
        ->assertForbidden();
});

// ─── STORE ───────────────────────────────────────────────

test('super admin can create a schedule', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.schedules.store'), $this->validPayload)
        ->assertRedirect(route('admin.schedules.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('review_schedules', [
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
        'status' => 'scheduled',
    ]);
});

test('admin kampus cannot create a schedule', function () {
    actingAs($this->adminKampusA)
        ->post(route('admin.schedules.store'), $this->validPayload)
        ->assertForbidden();

    assertDatabaseCount('review_schedules', 0);
});

test('create schedule validates required fields', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.schedules.store'), [])
        ->assertSessionHasErrors(['proposal_id', 'reviewer_id', 'scheduled_at']);
});

// ─── SHOW ────────────────────────────────────────────────

test('super admin can view a schedule', function () {
    $schedule = ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.show', $schedule))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/ScheduleShow')
            ->has('schedule')
        );
});

test('admin kampus can view schedule within their university', function () {
    $schedule = ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->adminKampusA)
        ->get(route('admin.schedules.show', $schedule))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/ScheduleShow')
            ->has('schedule')
        );
});

test('admin kampus cannot view schedule from other university', function () {
    $schedule = ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->adminKampusB)
        ->get(route('admin.schedules.show', $schedule))
        ->assertForbidden();
});

// ─── UPDATE ──────────────────────────────────────────────

test('super admin can update a schedule', function () {
    $schedule = ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->put(route('admin.schedules.update', $schedule), [
            ...$this->validPayload,
            'status' => 'completed',
        ])
        ->assertRedirect(route('admin.schedules.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('review_schedules', [
        'id' => $schedule->id,
        'status' => 'completed',
    ]);
});

test('admin kampus cannot update a schedule', function () {
    $schedule = ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->adminKampusA)
        ->put(route('admin.schedules.update', $schedule), [
            ...$this->validPayload,
            'status' => 'completed',
        ])
        ->assertForbidden();
});

// ─── DELETE ──────────────────────────────────────────────

test('super admin can delete a schedule', function () {
    $schedule = ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->delete(route('admin.schedules.destroy', $schedule))
        ->assertRedirect(route('admin.schedules.index'))
        ->assertSessionHas('success');

    assertDatabaseMissing('review_schedules', [
        'id' => $schedule->id,
        'deleted_at' => null,
    ]);
});

test('admin kampus cannot delete a schedule', function () {
    $schedule = ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->adminKampusA)
        ->delete(route('admin.schedules.destroy', $schedule))
        ->assertForbidden();
});

// ─── POLICY ──────────────────────────────────────────────

test('inactive user cannot access schedules', function () {
    $inactive = User::factory()->superAdmin()->create(['is_active' => false]);

    actingAs($inactive)
        ->get(route('admin.schedules.index'))
        ->assertRedirect('/');
});

test('regular user cannot access schedules', function () {
    $user = User::factory()->user($this->universityA->id)->create(['is_active' => true]);

    actingAs($user)
        ->get(route('admin.schedules.index'))
        ->assertForbidden();
});

test('search by journal title does not leak data across universities', function () {
    $this->assessmentA->journal->update(['title' => 'JURNAL_UNIK_A_UNTUK_TESTING']);
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentB->id,
        'reviewer_id' => $this->reviewerB->id,
    ]);

    actingAs($this->adminKampusA)
        ->get(route('admin.schedules.index', ['search' => 'JURNAL_UNIK_A_UNTUK_TESTING']))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );

    actingAs($this->adminKampusB)
        ->get(route('admin.schedules.index'))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );
});

test('search by reviewer name does not leak data across universities', function () {
    $this->reviewerA->update(['name' => 'REVIEWER_UNIK_A_UNTUK_TESTING']);
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentB->id,
        'reviewer_id' => $this->reviewerB->id,
    ]);

    // Admin Kampus A searches by their reviewer's name — should see 1 result
    actingAs($this->adminKampusA)
        ->get(route('admin.schedules.index', ['search' => 'REVIEWER_UNIK_A_UNTUK_TESTING']))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );

    // Admin Kampus B searches by the SAME reviewer name — should see 0 results
    // (the reviewer belongs to university A, so its schedules should not leak to B)
    actingAs($this->adminKampusB)
        ->get(route('admin.schedules.index', ['search' => 'REVIEWER_UNIK_A_UNTUK_TESTING']))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 0)
        );
});

// ─── EDGE CASES ───────────────────────────────────────────

test('search with empty string returns all schedules within scope', function () {
    ReviewSchedule::factory()->count(2)->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.index', ['search' => '']))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 2)
        );
});

test('search with special characters does not break query', function () {
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.index', ['search' => '%_%_test%']))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 0)
        );
});

test('search with partial title match returns correct results', function () {
    $this->assessmentA->journal->update(['title' => 'Very Specific Journal Title For Testing']);
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.index', ['search' => 'Specific Journal']))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );
});

test('search with partial reviewer name match returns correct results', function () {
    $this->reviewerA->update(['name' => 'Dr. John Anderson Smith']);
    ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    actingAs($this->superAdmin)
        ->get(route('admin.schedules.index', ['search' => 'Anderson']))
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Reviewer/Schedule')
            ->has('schedules.data', 1)
        );
});

// ─── PROPOSAL MODEL ───────────────────────────────────────

test('proposal model resolves to journal_assessments table', function () {
    $proposal = new \App\Models\Proposal;
    expect($proposal->getTable())->toBe('journal_assessments');
});

test('review schedule proposal relationship returns Proposal instance', function () {
    $schedule = ReviewSchedule::factory()->create([
        'proposal_id' => $this->assessmentA->id,
        'reviewer_id' => $this->reviewerA->id,
    ]);

    $schedule->load('proposal');
    expect($schedule->proposal)->toBeInstanceOf(\App\Models\Proposal::class);
    expect($schedule->proposal->id)->toBe($this->assessmentA->id);
});
