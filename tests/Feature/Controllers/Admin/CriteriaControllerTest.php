<?php

use App\Models\AccreditationTemplate;
use App\Models\EvaluationCategory;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;
use function Pest\Laravel\assertDatabaseMissing;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Seed roles (required for tests)
    $this->seed(\Database\Seeders\RoleSeeder::class);

    // Create Super Admin user
    $this->superAdmin = User::factory()->create([
        'role_id' => Role::where('name', Role::SUPER_ADMIN)->first()->id,
        'university_id' => University::factory()->create()->id,
        'is_active' => true,
    ]);

    // Create non-Super Admin user for authorization tests
    $this->adminKampus = User::factory()->create([
        'role_id' => Role::where('name', Role::ADMIN_KAMPUS)->first()->id,
        'university_id' => University::factory()->create()->id,
        'is_active' => true,
    ]);

    // Set up default hierarchy models for tests
    $this->template = AccreditationTemplate::factory()->create();
    $this->category = EvaluationCategory::factory()->create(['template_id' => $this->template->id]);
    $this->subCategory = EvaluationSubCategory::factory()->create(['category_id' => $this->category->id]);
});

// ============================================================================
// INDEX TESTS
// ============================================================================

test('Super Admin can view criteria index page', function () {
    EvaluationIndicator::factory()->create(['sub_category_id' => $this->subCategory->id]);

    actingAs($this->superAdmin)
        ->get(route('admin.criteria.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Criteria/Index')
            ->has('criteria')
            ->has('subCategories')
            ->has('filters')
        );
});

test('Non-Super Admin cannot view criteria index page', function () {
    actingAs($this->adminKampus)
        ->get(route('admin.criteria.index'))
        ->assertForbidden();
});

test('criteria index page includes search and filters', function () {
    EvaluationIndicator::factory()->create([
        'sub_category_id' => $this->subCategory->id,
        'code' => 'SPECIFIC-01',
        'question' => 'Apakah jurnal ini terakreditasi?',
        'answer_type' => 'boolean',
        'is_active' => true,
    ]);

    EvaluationIndicator::factory()->create([
        'sub_category_id' => $this->subCategory->id,
        'code' => 'OTHER-02',
        'question' => 'Skala penilaian mutu?',
        'answer_type' => 'scale',
        'is_active' => false,
    ]);

    // Search filter
    actingAs($this->superAdmin)
        ->get(route('admin.criteria.index', ['search' => 'terakreditasi']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('criteria.data', 1)
            ->where('criteria.data.0.code', 'SPECIFIC-01')
        );

    // Answer type filter
    actingAs($this->superAdmin)
        ->get(route('admin.criteria.index', ['answer_type' => 'scale']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('criteria.data', 1)
            ->where('criteria.data.0.code', 'OTHER-02')
        );

    // Status filter
    actingAs($this->superAdmin)
        ->get(route('admin.criteria.index', ['is_active' => 'inactive']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('criteria.data', 1)
            ->where('criteria.data.0.code', 'OTHER-02')
        );
});

// ============================================================================
// CREATE TESTS
// ============================================================================

test('Super Admin can view create criteria page', function () {
    actingAs($this->superAdmin)
        ->get(route('admin.criteria.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Criteria/Create')
            ->has('subCategories')
        );
});

test('Non-Super Admin cannot view create criteria page', function () {
    actingAs($this->adminKampus)
        ->get(route('admin.criteria.create'))
        ->assertForbidden();
});

// ============================================================================
// STORE TESTS
// ============================================================================

test('Super Admin can store criteria in batch', function () {
    $data = [
        'sub_category_id' => $this->subCategory->id,
        'criteria' => [
            [
                'code' => 'TEST-01',
                'question' => 'Pertanyaan Kriteria Satu?',
                'description' => 'Penjelasan Detail Satu',
                'weight' => 2.50,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'code' => 'TEST-02',
                'question' => 'Pertanyaan Kriteria Dua?',
                'description' => null,
                'weight' => 4.00,
                'answer_type' => 'scale',
                'requires_attachment' => false,
                'sort_order' => 2,
                'is_active' => false,
            ]
        ]
    ];

    actingAs($this->superAdmin)
        ->post(route('admin.criteria.store'), $data)
        ->assertRedirect(route('admin.criteria.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('evaluation_indicators', [
        'sub_category_id' => $this->subCategory->id,
        'code' => 'TEST-01',
        'question' => 'Pertanyaan Kriteria Satu?',
        'weight' => 2.50,
        'answer_type' => 'boolean',
        'requires_attachment' => true,
        'is_active' => true,
    ]);

    assertDatabaseHas('evaluation_indicators', [
        'sub_category_id' => $this->subCategory->id,
        'code' => 'TEST-02',
        'question' => 'Pertanyaan Kriteria Dua?',
        'weight' => 4.00,
        'answer_type' => 'scale',
        'requires_attachment' => false,
        'is_active' => false,
    ]);
});

test('Non-Super Admin cannot store criteria', function () {
    $data = [
        'sub_category_id' => $this->subCategory->id,
        'criteria' => [
            [
                'code' => 'TEST-01',
                'question' => 'Pertanyaan Kriteria Satu?',
                'weight' => 2.50,
                'answer_type' => 'boolean',
                'requires_attachment' => true,
                'is_active' => true,
            ]
        ]
    ];

    actingAs($this->adminKampus)
        ->post(route('admin.criteria.store'), $data)
        ->assertForbidden();
});

// ============================================================================
// SHOW & EDIT TESTS
// ============================================================================

test('Super Admin can view criterion details', function () {
    $criterion = EvaluationIndicator::factory()->create(['sub_category_id' => $this->subCategory->id]);

    actingAs($this->superAdmin)
        ->get(route('admin.criteria.show', $criterion))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Criteria/Show')
            ->has('criterion')
        );
});

test('Super Admin can view edit criterion page', function () {
    $criterion = EvaluationIndicator::factory()->create(['sub_category_id' => $this->subCategory->id]);

    actingAs($this->superAdmin)
        ->get(route('admin.criteria.edit', $criterion))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/Criteria/Edit')
            ->has('criterion')
            ->has('subCategories')
        );
});

// ============================================================================
// UPDATE TESTS
// ============================================================================

test('Super Admin can update criterion', function () {
    $criterion = EvaluationIndicator::factory()->create([
        'sub_category_id' => $this->subCategory->id,
        'code' => 'OLD-01',
        'question' => 'Old Question?',
        'weight' => 1.50,
    ]);

    $data = [
        'sub_category_id' => $this->subCategory->id,
        'code' => 'UPDATED-01',
        'question' => 'Updated Question?',
        'description' => 'Updated Description',
        'weight' => 5.25,
        'answer_type' => 'text',
        'requires_attachment' => true,
        'sort_order' => 10,
        'is_active' => true,
    ];

    actingAs($this->superAdmin)
        ->put(route('admin.criteria.update', $criterion), $data)
        ->assertRedirect(route('admin.criteria.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('evaluation_indicators', [
        'id' => $criterion->id,
        'code' => 'UPDATED-01',
        'question' => 'Updated Question?',
        'weight' => 5.25,
        'answer_type' => 'text',
        'requires_attachment' => true,
    ]);
});

// ============================================================================
// DESTROY TESTS
// ============================================================================

test('Super Admin can delete criterion', function () {
    $criterion = EvaluationIndicator::factory()->create(['sub_category_id' => $this->subCategory->id]);

    actingAs($this->superAdmin)
        ->delete(route('admin.criteria.destroy', $criterion))
        ->assertRedirect(route('admin.criteria.index'))
        ->assertSessionHas('success');

    assertDatabaseMissing('evaluation_indicators', [
        'id' => $criterion->id,
    ]);
});
