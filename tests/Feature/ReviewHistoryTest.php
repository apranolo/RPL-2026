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

test('logged in user (author) can access review history of their own proposals', function () {
    $university = University::factory()->create();
    $author = User::factory()->create([
        'role_id' => Role::where('name', Role::USER)->value('id'),
        'university_id' => $university->id,
        'is_reviewer' => false,
    ]);

    // Create research schema
    $schema = ResearchSchema::create([
        'name' => 'Skema Penelitian Unggulan 2',
        'description' => 'Description here',
    ]);

    // Create proposal
    $proposal = Proposal::create([
        'title' => 'Proposal Saya',
        'description' => 'Deskripsi proposal saya',
        'user_id' => $author->id,
        'research_schema_id' => $schema->id,
    ]);

    $reviewer = User::factory()->create([
        'role_id' => Role::where('name', Role::REVIEWER)->value('id'),
        'university_id' => $university->id,
        'is_reviewer' => true,
    ]);

    // Create mock review
    Review::create([
        'proposal_id' => $proposal->id,
        'reviewer_id' => $reviewer->id,
        'score' => 85.00,
        'feedback' => 'Bagus sekali.',
        'recommendation' => 'Diterima',
        'reviewed_at' => now(),
    ]);

    $response = $this->actingAs($author)->get(route('proposal.review-history'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Proposal/ReviewHistory')
        ->has('reviews')
        ->has('reviewSchedules')
        ->has('isReviewer')
        ->where('isReviewer', false)
    );
});

test('logged in user with dual roles (author and reviewer) can access their own proposal review history when visiting proposal history route', function () {
    $university = University::factory()->create();
    $dualUser = User::factory()->create([
        'role_id' => Role::where('name', Role::USER)->value('id'),
        'university_id' => $university->id,
        'is_reviewer' => true, // acts as reviewer too
    ]);

    // Attach Reviewer role as well
    $reviewerRole = Role::firstOrCreate(['name' => Role::REVIEWER]);
    $dualUser->roles()->syncWithoutDetaching([$reviewerRole->id]);

    // Create research schema
    $schema = ResearchSchema::create([
        'name' => 'Skema Penelitian Dual Role',
        'description' => 'Description here',
    ]);

    // Create proposal owned by dual user
    $proposal = Proposal::create([
        'title' => 'Proposal Dual Role',
        'description' => 'Deskripsi proposal dual role',
        'user_id' => $dualUser->id,
        'research_schema_id' => $schema->id,
    ]);

    $anotherReviewer = User::factory()->create([
        'role_id' => Role::where('name', Role::REVIEWER)->value('id'),
        'university_id' => $university->id,
        'is_reviewer' => true,
    ]);

    // Create mock review on dual user's proposal
    Review::create([
        'proposal_id' => $proposal->id,
        'reviewer_id' => $anotherReviewer->id,
        'score' => 90.00,
        'feedback' => 'Sangat bagus.',
        'recommendation' => 'Diterima',
        'reviewed_at' => now(),
    ]);

    // If visiting proposal.history (author context)
    $response = $this->actingAs($dualUser)->get(route('proposal.history'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('Proposal/ReviewHistory')
        ->has('reviews')
        ->has('reviewSchedules')
        ->has('isReviewer')
        ->where('isReviewer', false) // must be false because it is proposal.history route
    );
});
