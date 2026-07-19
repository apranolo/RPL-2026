<?php

use App\Models\Role;
use App\Models\User;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;
use App\Models\AssessmentResponse;
use App\Models\JournalAssessment;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seedRoles();

    // Create Super Admin
    $superRole = Role::where('name', Role::SUPER_ADMIN)->first();
    $this->superAdmin = User::factory()->create([
        'role_id' => $superRole->id,
        'is_active' => true,
    ]);
    $this->superAdmin->roles()->attach($superRole->id);

    // Create Admin Kampus
    $adminRole = Role::where('name', Role::ADMIN_KAMPUS)->first();
    $this->adminKampus = User::factory()->create([
        'role_id' => $adminRole->id,
        'is_active' => true,
    ]);
    $this->adminKampus->roles()->attach($adminRole->id);

    // Create standard User
    $userRole = Role::where('name', Role::USER)->first();
    $this->user = User::factory()->create([
        'role_id' => $userRole->id,
        'is_active' => true,
    ]);
    $this->user->roles()->attach($userRole->id);

    // Create sub category
    $this->subCategory = EvaluationSubCategory::factory()->create();
});

// Helper for valid payload
function validCriteriaPayload(int $subCategoryId): array
{
    return [
        'sub_category_id' => $subCategoryId,
        'code' => 'KP-TEST',
        'question' => 'Apakah kriteria ini valid?',
        'description' => 'Penjelasan kriteria test.',
        'weight' => 5.5,
        'answer_type' => 'scale',
        'requires_attachment' => true,
        'sort_order' => 1,
        'is_active' => true,
    ];
}

test('guests are redirected to the login page', function () {
    $this->get(route('admin.criteria.index'))->assertRedirect('/login');
});

test('non-super admins cannot view criteria list', function () {
    $response = actingAs($this->adminKampus)->get(route('admin.criteria.index'));
    $response->assertForbidden();

    $response = actingAs($this->user)->get(route('admin.criteria.index'));
    $response->assertForbidden();
});

test('super admin can view criteria list', function () {
    EvaluationIndicator::factory()->count(3)->create([
        'sub_category_id' => $this->subCategory->id,
    ]);

    $response = actingAs($this->superAdmin)->get(route('admin.criteria.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Criteria/Index')
        ->has('criteria.data', 3)
    );
});

test('super admin can view create form', function () {
    $response = actingAs($this->superAdmin)->get(route('admin.criteria.create'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Criteria/Create')
    );
});

test('super admin can store a new criterion', function () {
    $payload = validCriteriaPayload($this->subCategory->id);

    $response = actingAs($this->superAdmin)->post(route('admin.criteria.store'), $payload);

    $response->assertRedirect(route('admin.criteria.index'));
    $this->assertDatabaseHas('evaluation_indicators', [
        'code' => 'KP-TEST',
        'sub_category_id' => $this->subCategory->id,
        'weight' => 5.5,
    ]);
});

test('store criteria validates required fields', function () {
    $response = actingAs($this->superAdmin)->post(route('admin.criteria.store'), []);

    $response->assertSessionHasErrors(['sub_category_id', 'code', 'question', 'weight', 'answer_type']);
});

test('super admin can view a single criterion', function () {
    $criterion = EvaluationIndicator::factory()->create([
        'sub_category_id' => $this->subCategory->id,
    ]);

    $response = actingAs($this->superAdmin)->get(route('admin.criteria.show', $criterion->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Criteria/Show')
        ->has('criterion')
    );
});

test('super admin can view edit form', function () {
    $criterion = EvaluationIndicator::factory()->create([
        'sub_category_id' => $this->subCategory->id,
    ]);

    $response = actingAs($this->superAdmin)->get(route('admin.criteria.edit', $criterion->id));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('Admin/Criteria/Edit')
        ->has('criterion')
    );
});

test('super admin can update a criterion', function () {
    $criterion = EvaluationIndicator::factory()->create([
        'sub_category_id' => $this->subCategory->id,
        'code' => 'KP-OLD',
    ]);

    $payload = validCriteriaPayload($this->subCategory->id);
    $payload['code'] = 'KP-NEW';
    $payload['weight'] = 8.5;

    $response = actingAs($this->superAdmin)
        ->put(route('admin.criteria.update', $criterion->id), $payload);

    $response->assertRedirect(route('admin.criteria.index'));
    $this->assertDatabaseHas('evaluation_indicators', [
        'id' => $criterion->id,
        'code' => 'KP-NEW',
        'weight' => 8.5,
    ]);
});

test('super admin can delete unused criterion', function () {
    $criterion = EvaluationIndicator::factory()->create([
        'sub_category_id' => $this->subCategory->id,
    ]);

    $response = actingAs($this->superAdmin)
        ->delete(route('admin.criteria.destroy', $criterion->id));

    $response->assertRedirect(route('admin.criteria.index'));
    $this->assertDatabaseMissing('evaluation_indicators', [
        'id' => $criterion->id,
    ]);
});

test('super admin cannot delete criterion used in submitted assessment', function () {
    $criterion = EvaluationIndicator::factory()->create([
        'sub_category_id' => $this->subCategory->id,
    ]);

    // Create a submitted assessment and response
    $assessment = JournalAssessment::factory()->submitted()->create();

    AssessmentResponse::create([
        'journal_assessment_id' => $assessment->id,
        'evaluation_indicator_id' => $criterion->id,
        'score' => 5,
    ]);

    $response = actingAs($this->superAdmin)
        ->delete(route('admin.criteria.destroy', $criterion->id));

    $response->assertForbidden();
    $this->assertDatabaseHas('evaluation_indicators', [
        'id' => $criterion->id,
    ]);
});
