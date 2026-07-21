<?php

use App\Models\AccreditationTemplate;
use App\Models\EssayQuestion;
use App\Models\EvaluationCategory;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;
use function Pest\Laravel\assertDatabaseHas;

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
});

// ============================================================================
// INDEX TESTS
// ============================================================================

test('Super Admin can view templates index page', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->superAdmin)
        ->get(route('admin.templates.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/BorangIndikator/Index')
            ->has('templates')
            ->has('filters')
        );
});

test('Non-Super Admin cannot view templates index page', function () {
    actingAs($this->adminKampus)
        ->get(route('admin.templates.index'))
        ->assertForbidden();
});

test('index page includes search filter', function () {
    AccreditationTemplate::factory()->create(['name' => 'Akreditasi Jurnal 2024']);
    AccreditationTemplate::factory()->create(['name' => 'Indeksasi Scopus 2024']);

    actingAs($this->superAdmin)
        ->get(route('admin.templates.index', ['search' => 'Scopus']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('templates.data', 1)
        );
});

test('index page includes type filter', function () {
    AccreditationTemplate::factory()->create(['type' => 'akreditasi']);
    AccreditationTemplate::factory()->create(['type' => 'indeksasi']);

    actingAs($this->superAdmin)
        ->get(route('admin.templates.index', ['type' => 'akreditasi']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('templates.data', 1)
        );
});

test('index page includes status filter', function () {
    AccreditationTemplate::factory()->create(['is_active' => true]);
    AccreditationTemplate::factory()->create(['is_active' => false]);

    actingAs($this->superAdmin)
        ->get(route('admin.templates.index', ['is_active' => 'active']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('templates.data', 1)
        );
});

test('index page includes counts for related models', function () {
    $template = AccreditationTemplate::factory()->create();
    $category = EvaluationCategory::factory()->create(['template_id' => $template->id]);
    $subCategory = EvaluationSubCategory::factory()->create(['category_id' => $category->id]);
    EssayQuestion::factory()->create(['category_id' => $category->id]);

    actingAs($this->superAdmin)
        ->get(route('admin.templates.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('templates.data.0', fn ($template) => $template
                ->where('categories_count', 1)
                ->where('sub_categories_count', 1)
                ->where('essay_questions_count', 1)
                ->etc()
            )
        );
});

// ============================================================================
// CREATE TESTS
// ============================================================================

test('Super Admin can view create template page', function () {
    actingAs($this->superAdmin)
        ->get(route('admin.templates.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/BorangIndikator/Index')
        );
});

test('Non-Super Admin cannot view create template page', function () {
    actingAs($this->adminKampus)
        ->get(route('admin.templates.create'))
        ->assertForbidden();
});

// ============================================================================
// STORE TESTS
// ============================================================================

test('Super Admin can create new template', function () {
    $data = [
        'name' => 'Akreditasi Jurnal Nasional 2024',
        'description' => 'Template untuk akreditasi jurnal nasional tahun 2024',
        'version' => '1.0',
        'type' => 'akreditasi',
        'is_active' => true,
        'effective_date' => '2024-01-01',
    ];

    actingAs($this->superAdmin)
        ->post(route('admin.templates.store'), $data)
        ->assertRedirect(route('admin.templates.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('accreditation_templates', [
        'name' => 'Akreditasi Jurnal Nasional 2024',
        'type' => 'akreditasi',
    ]);
});

test('Non-Super Admin cannot create template', function () {
    $data = [
        'name' => 'Test Template',
        'description' => 'Test',
        'version' => '1.0',
        'type' => 'akreditasi',
        'effective_date' => '2024-01-01',
    ];

    actingAs($this->adminKampus)
        ->post(route('admin.templates.store'), $data)
        ->assertForbidden();
});

test('template creation requires name', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.templates.store'), [
            'description' => 'Test',
            'version' => '1.0',
            'type' => 'akreditasi',
            'effective_date' => '2024-01-01',
        ])
        ->assertSessionHasErrors('name');
});

test('template creation requires unique name', function () {
    AccreditationTemplate::factory()->create(['name' => 'Duplicate Name']);

    actingAs($this->superAdmin)
        ->post(route('admin.templates.store'), [
            'name' => 'Duplicate Name',
            'description' => 'Test',
            'version' => '1.0',
            'type' => 'akreditasi',
            'effective_date' => '2024-01-01',
        ])
        ->assertSessionHasErrors('name');
});

test('template creation requires valid type', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.templates.store'), [
            'name' => 'Test Template',
            'description' => 'Test',
            'version' => '1.0',
            'type' => 'invalid_type',
            'effective_date' => '2024-01-01',
        ])
        ->assertSessionHasErrors('type');
});

test('template creation requires effective_date', function () {
    actingAs($this->superAdmin)
        ->post(route('admin.templates.store'), [
            'name' => 'Test Template',
            'description' => 'Test',
            'version' => '1.0',
            'type' => 'akreditasi',
        ])
        ->assertSessionHasErrors('effective_date');
});

// ============================================================================
// SHOW TESTS
// ============================================================================

test('Super Admin can view template details', function () {
    $template = AccreditationTemplate::factory()->create();
    $category = EvaluationCategory::factory()->create(['template_id' => $template->id]);

    actingAs($this->superAdmin)
        ->get(route('admin.templates.show', $template))
        ->assertRedirect(route('admin.templates.structure', $template));
});

test('Non-Super Admin cannot view template details', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->adminKampus)
        ->get(route('admin.templates.show', $template))
        ->assertForbidden();
});

// ============================================================================
// EDIT TESTS
// ============================================================================

test('Super Admin can view edit template page', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->superAdmin)
        ->get(route('admin.templates.edit', $template))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/BorangIndikator/Index')
        );
});

test('Non-Super Admin cannot view edit template page', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->adminKampus)
        ->get(route('admin.templates.edit', $template))
        ->assertForbidden();
});

// ============================================================================
// UPDATE TESTS
// ============================================================================

test('Super Admin can update template', function () {
    $template = AccreditationTemplate::factory()->create([
        'name' => 'Original Name',
        'is_active' => false,
    ]);

    $data = [
        'name' => 'Updated Name',
        'description' => 'Updated description',
        'version' => '2.0',
        'type' => 'indeksasi',
        'is_active' => true,
        'effective_date' => '2024-06-01',
    ];

    actingAs($this->superAdmin)
        ->put(route('admin.templates.update', $template), $data)
        ->assertRedirect(route('admin.templates.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('accreditation_templates', [
        'id' => $template->id,
        'name' => 'Updated Name',
        'type' => 'indeksasi',
    ]);
});

test('Non-Super Admin cannot update template', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->adminKampus)
        ->put(route('admin.templates.update', $template), [
            'name' => 'Updated Name',
            'description' => 'Test',
            'version' => '1.0',
            'type' => 'akreditasi',
            'effective_date' => '2024-01-01',
        ])
        ->assertForbidden();
});

test('template update allows keeping same name', function () {
    $template = AccreditationTemplate::factory()->create(['name' => 'Unique Name']);

    actingAs($this->superAdmin)
        ->put(route('admin.templates.update', $template), [
            'name' => 'Unique Name', // Same name should be allowed
            'description' => 'Updated',
            'version' => '1.0',
            'type' => 'akreditasi',
            'effective_date' => '2024-01-01',
        ])
        ->assertSessionDoesntHaveErrors('name');
});

// ============================================================================
// DESTROY TESTS
// ============================================================================

test('Super Admin can delete template without dependencies', function () {
    $template = AccreditationTemplate::factory()->create(['is_active' => false]);

    actingAs($this->superAdmin)
        ->delete(route('admin.templates.destroy', $template))
        ->assertRedirect(route('admin.templates.index'))
        ->assertSessionHas('success');

    expect($template->fresh()->deleted_at)->not->toBeNull();
});

test('Super Admin cannot delete template with categories', function () {
    $template = AccreditationTemplate::factory()->create(['is_active' => false]);
    EvaluationCategory::factory()->create(['template_id' => $template->id]);

    actingAs($this->superAdmin)
        ->delete(route('admin.templates.destroy', $template))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect($template->fresh()->deleted_at)->toBeNull();
});

test('Non-Super Admin cannot delete template', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->adminKampus)
        ->delete(route('admin.templates.destroy', $template))
        ->assertForbidden();
});

// ============================================================================
// CLONE TESTS
// ============================================================================

test('Super Admin can clone template', function () {
    $template = AccreditationTemplate::factory()->create(['name' => 'Original Template']);
    $category = EvaluationCategory::factory()->create(['template_id' => $template->id]);
    $subCategory = EvaluationSubCategory::factory()->create(['category_id' => $category->id]);
    EvaluationIndicator::factory()->create(['sub_category_id' => $subCategory->id]);

    actingAs($this->superAdmin)
        ->post(route('admin.templates.clone', $template), [
            'new_name' => 'Cloned Template',
        ])
        ->assertRedirect(route('admin.templates.index'))
        ->assertSessionHas('success');

    assertDatabaseHas('accreditation_templates', ['name' => 'Cloned Template']);

    $cloned = AccreditationTemplate::where('name', 'Cloned Template')->first();
    expect($cloned->categories)->toHaveCount(1);
    expect($cloned->subCategories)->toHaveCount(1);
    expect($cloned->indicators)->toHaveCount(1);
});

test('clone requires new name', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->superAdmin)
        ->post(route('admin.templates.clone', $template), [])
        ->assertSessionHasErrors('new_name');
});

test('clone requires unique new name', function () {
    $template1 = AccreditationTemplate::factory()->create(['name' => 'Original']);
    $template2 = AccreditationTemplate::factory()->create(['name' => 'Existing']);

    actingAs($this->superAdmin)
        ->post(route('admin.templates.clone', $template1), [
            'new_name' => 'Existing',
        ])
        ->assertSessionHasErrors('new_name');
});

test('Non-Super Admin cannot clone template', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->adminKampus)
        ->post(route('admin.templates.clone', $template), [
            'new_name' => 'Cloned',
        ])
        ->assertForbidden();
});

// ============================================================================
// TOGGLE ACTIVE TESTS
// ============================================================================

test('Super Admin can toggle template active status', function () {
    $template = AccreditationTemplate::factory()->create(['is_active' => false]);

    actingAs($this->superAdmin)
        ->post(route('admin.templates.toggle', $template))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($template->fresh()->is_active)->toBeTrue();
});

test('toggle changes active to inactive', function () {
    $template = AccreditationTemplate::factory()->create(['is_active' => true]);

    actingAs($this->superAdmin)
        ->post(route('admin.templates.toggle', $template));

    expect($template->fresh()->is_active)->toBeFalse();
});

test('Non-Super Admin cannot toggle template status', function () {
    $template = AccreditationTemplate::factory()->create(['is_active' => false]);

    actingAs($this->adminKampus)
        ->post(route('admin.templates.toggle', $template))
        ->assertForbidden();
});

// ============================================================================
// TREE TESTS
// ============================================================================

test('Super Admin can view template tree structure', function () {
    $template = AccreditationTemplate::factory()->create();
    $category = EvaluationCategory::factory()->create(['template_id' => $template->id]);
    $subCategory = EvaluationSubCategory::factory()->create(['category_id' => $category->id]);
    $indicator = EvaluationIndicator::factory()->create(['sub_category_id' => $subCategory->id]);
    $essay = EssayQuestion::factory()->create(['category_id' => $category->id]);

    $response = actingAs($this->superAdmin)
        ->get(route('admin.templates.structure', $template))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('Admin/BorangIndikator/Tree')
            ->has('template')
            ->has('initialTree')
            ->has('structuredTree')
        );
});

test('Non-Super Admin cannot view template tree', function () {
    $template = AccreditationTemplate::factory()->create();

    actingAs($this->adminKampus)
        ->get(route('admin.templates.structure', $template))
        ->assertForbidden();
});
