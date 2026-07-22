<?php

namespace Tests\Feature;

use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Review;
use App\Models\ReviewSchedule;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles
    $this->seedRoles();

    // Ensure Reviewer role exists in tests
    Role::firstOrCreate(
        ['name' => Role::REVIEWER],
        [
            'display_name' => 'Reviewer',
            'description' => 'Reviewer role description',
        ]
    );
});

test('guest cannot access review history', function () {
    $response = $this->get(route('proposal.review-history'));

    $response->assertRedirect('/login');
});

test('logged in reviewer can access their own review history', function () {
    $university = University::factory()->create();
    $reviewer = User::factory()->create([
        'role_id' => Role::where('name', Role::REVIEWER)->value('id'),
        'university_id' => $university->id,
        'is_reviewer' => true,
    ]);

    // Create research schema
    $schema = ResearchSchema::create([
        'name' => 'Skema Penelitian Unggulan',
        'description' => 'Skema penelitian unggulan description',
    ]);

    // Create proposal
    $proposer = User::factory()->user($university->id)->create();
    $proposal = Proposal::create([
        'title' => 'Proposal Riset Test',
        'description' => 'Deskripsi proposal riset',
        'user_id' => $proposer->id,
        'research_schema_id' => $schema->id,
    ]);

    // Create mock review
    Review::create([
        'proposal_id' => $proposal->id,
        'reviewer_id' => $reviewer->id,
        'score' => 90.00,
        'feedback' => 'Proposal sangat baik, memiliki dampak praktis.',
        'recommendation' => 'Diterima',
        'reviewed_at' => now(),
    ]);

    // Create mock schedule
    $admin = User::factory()->adminKampus($university->id)->create();
    ReviewSchedule::create([
        'proposal_id' => $proposal->id,
        'reviewer_id' => $reviewer->id,
        'assigned_by' => $admin->id,
        'assigned_at' => now(),
        'start_date' => now(),
        'end_date' => now()->addDays(7),
        'status' => 'assigned',
    ]);

    $response = $this->actingAs($reviewer)->get(route('proposal.review-history'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Proposal/ReviewHistory')
        ->has('reviews')
        ->has('reviewSchedules')
        ->where('dosen', null)
    );
});

test('admin kampus can access review history of reviewer from the same university', function () {
    $university = University::factory()->create();
    $admin = User::factory()->adminKampus($university->id)->create();

    $reviewer = User::factory()->create([
        'role_id' => Role::where('name', Role::REVIEWER)->value('id'),
        'university_id' => $university->id,
        'is_reviewer' => true,
    ]);

    $response = $this->actingAs($admin)->get(route('proposal.review-history', ['dosen' => $reviewer->id]));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Proposal/ReviewHistory')
        ->has('reviews')
        ->has('reviewSchedules')
        ->where('dosen.id', $reviewer->id)
    );
});

test('admin kampus cannot access review history of reviewer from a different university', function () {
    $univ1 = University::factory()->create();
    $univ2 = University::factory()->create();

    $admin = User::factory()->adminKampus($univ1->id)->create();
    $reviewer = User::factory()->create([
        'role_id' => Role::where('name', Role::REVIEWER)->value('id'),
        'university_id' => $univ2->id,
        'is_reviewer' => true,
    ]);

    $response = $this->actingAs($admin)->get(route('proposal.review-history', ['dosen' => $reviewer->id]));

    $response->assertStatus(403);
});
