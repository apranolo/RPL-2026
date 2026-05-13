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

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles
    $this->superAdminRole = Role::create([
        'name' => 'Super Admin',
        'display_name' => 'Super Admin',
    ]);
    $this->adminKampusRole = Role::create([
        'name' => 'Admin Kampus',
        'display_name' => 'Admin Kampus',
    ]);
    $this->userRole = Role::create([
        'name' => 'User',
        'display_name' => 'User',
    ]);

    // Create university
    $this->university = University::create([
        'name' => 'Test University',
        'code' => 'TEST',
        'address' => 'Test Address',
        'city' => 'Test City',
        'province' => 'Test Province',
        'is_active' => true,
    ]);

    // Create users
    $this->superAdmin = User::create([
        'name' => 'Super Admin User',
        'email' => 'superadmin@test.com',
        'password' => bcrypt('password'),
        'role_id' => $this->superAdminRole->id,
        'is_active' => true,
    ]);

    $this->adminKampus = User::create([
        'name' => 'Admin Kampus User',
        'email' => 'adminkampus@test.com',
        'password' => bcrypt('password'),
        'role_id' => $this->adminKampusRole->id,
        'university_id' => $this->university->id,
        'is_active' => true,
    ]);

    $this->regularUser = User::create([
        'name' => 'Regular User',
        'email' => 'user@test.com',
        'password' => bcrypt('password'),
        'role_id' => $this->userRole->id,
        'university_id' => $this->university->id,
        'is_active' => true,
    ]);

    // Create test data
    $this->template = AccreditationTemplate::create([
        'name' => 'Test Template',
        'type' => 'akreditasi',
        'is_active' => true,
        'effective_date' => now(),
    ]);
});

// AccreditationTemplate Policy Tests
test('super admin can view any templates', function () {
    expect($this->superAdmin->can('viewAny', AccreditationTemplate::class))->toBeTrue();
});

test('admin kampus cannot view any templates', function () {
    expect($this->adminKampus->can('viewAny', AccreditationTemplate::class))->toBeFalse();
});

test('regular user cannot view any templates', function () {
    expect($this->regularUser->can('viewAny', AccreditationTemplate::class))->toBeFalse();
});

test('super admin can create template', function () {
    expect($this->superAdmin->can('create', AccreditationTemplate::class))->toBeTrue();
});

test('admin kampus cannot create template', function () {
    expect($this->adminKampus->can('create', AccreditationTemplate::class))->toBeFalse();
});

test('super admin can update template', function () {
    expect($this->superAdmin->can('update', $this->template))->toBeTrue();
});

test('super admin can delete template with multiple active templates', function () {
    AccreditationTemplate::create([
        'name' => 'Second Template',
        'type' => 'akreditasi',
        'is_active' => true,
        'effective_date' => now(),
    ]);

    expect($this->superAdmin->can('delete', $this->template))->toBeTrue();
});

test('super admin cannot delete only active template of type', function () {
    expect($this->superAdmin->can('delete', $this->template))->toBeFalse();
});

test('super admin can clone template', function () {
    expect($this->superAdmin->can('clone', $this->template))->toBeTrue();
});

// EvaluationCategory Policy Tests
test('super admin can manage categories', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Test Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    expect($this->superAdmin->can('viewAny', EvaluationCategory::class))->toBeTrue()
        ->and($this->superAdmin->can('create', EvaluationCategory::class))->toBeTrue()
        ->and($this->superAdmin->can('update', $category))->toBeTrue()
        ->and($this->superAdmin->can('delete', $category))->toBeTrue()
        ->and($this->superAdmin->can('reorder', EvaluationCategory::class))->toBeTrue();
});

test('admin kampus cannot manage categories', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Test Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    expect($this->adminKampus->can('viewAny', EvaluationCategory::class))->toBeFalse()
        ->and($this->adminKampus->can('create', EvaluationCategory::class))->toBeFalse()
        ->and($this->adminKampus->can('update', $category))->toBeFalse();
});

// EvaluationSubCategory Policy Tests
test('super admin can manage sub categories', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Test Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    $subCategory = $category->subCategories()->create([
        'code' => 'A.1',
        'name' => 'Test Sub Category',
        'display_order' => 1,
    ]);

    expect($this->superAdmin->can('viewAny', EvaluationSubCategory::class))->toBeTrue()
        ->and($this->superAdmin->can('create', EvaluationSubCategory::class))->toBeTrue()
        ->and($this->superAdmin->can('update', $subCategory))->toBeTrue()
        ->and($this->superAdmin->can('delete', $subCategory))->toBeTrue()
        ->and($this->superAdmin->can('move', $subCategory))->toBeTrue()
        ->and($this->superAdmin->can('reorder', EvaluationSubCategory::class))->toBeTrue();
});

test('regular user cannot manage sub categories', function () {
    expect($this->regularUser->can('viewAny', EvaluationSubCategory::class))->toBeFalse()
        ->and($this->regularUser->can('create', EvaluationSubCategory::class))->toBeFalse();
});

// EssayQuestion Policy Tests
test('super admin can manage essay questions', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Test Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    $essay = $category->essayQuestions()->create([
        'code' => 'E-A-1',
        'question' => 'Test question?',
        'max_words' => 500,
        'is_required' => true,
        'display_order' => 1,
        'is_active' => true,
    ]);

    expect($this->superAdmin->can('viewAny', EssayQuestion::class))->toBeTrue()
        ->and($this->superAdmin->can('create', EssayQuestion::class))->toBeTrue()
        ->and($this->superAdmin->can('update', $essay))->toBeTrue()
        ->and($this->superAdmin->can('delete', $essay))->toBeTrue()
        ->and($this->superAdmin->can('toggleActive', $essay))->toBeTrue()
        ->and($this->superAdmin->can('reorder', EssayQuestion::class))->toBeTrue();
});

test('admin kampus cannot manage essay questions', function () {
    expect($this->adminKampus->can('viewAny', EssayQuestion::class))->toBeFalse()
        ->and($this->adminKampus->can('create', EssayQuestion::class))->toBeFalse();
});

// EvaluationIndicator Policy Tests
test('all users can view indicators', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Test Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    $subCategory = $category->subCategories()->create([
        'code' => 'A.1',
        'name' => 'Test Sub Category',
        'display_order' => 1,
    ]);

    $indicator = $subCategory->indicators()->create([
        'code' => 'IND-001',
        'question' => 'Test indicator?',
        'answer_type' => 'boolean',
        'weight' => 5.00,
        'sort_order' => 1,
        'is_active' => true,
    ]);

    expect($this->superAdmin->can('viewAny', EvaluationIndicator::class))->toBeTrue()
        ->and($this->adminKampus->can('viewAny', EvaluationIndicator::class))->toBeTrue()
        ->and($this->regularUser->can('viewAny', EvaluationIndicator::class))->toBeTrue()
        ->and($this->regularUser->can('view', $indicator))->toBeTrue();
});

test('only super admin can manage indicators', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Test Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    $subCategory = $category->subCategories()->create([
        'code' => 'A.1',
        'name' => 'Test Sub Category',
        'display_order' => 1,
    ]);

    $indicator = $subCategory->indicators()->create([
        'code' => 'IND-001',
        'question' => 'Test indicator?',
        'answer_type' => 'boolean',
        'weight' => 5.00,
        'sort_order' => 1,
        'is_active' => true,
    ]);

    expect($this->superAdmin->can('create', EvaluationIndicator::class))->toBeTrue()
        ->and($this->superAdmin->can('update', $indicator))->toBeTrue()
        ->and($this->superAdmin->can('delete', $indicator))->toBeTrue()
        ->and($this->adminKampus->can('create', EvaluationIndicator::class))->toBeFalse()
        ->and($this->adminKampus->can('update', $indicator))->toBeFalse()
        ->and($this->regularUser->can('create', EvaluationIndicator::class))->toBeFalse();
});

test('super admin can migrate legacy indicators', function () {
    $legacyIndicator = EvaluationIndicator::create([
        'category' => 'Old Category',
        'sub_category' => 'Old Sub',
        'code' => 'IND-002',
        'question' => 'Legacy indicator?',
        'answer_type' => 'scale',
        'weight' => 3.00,
        'sort_order' => 1,
        'is_active' => true,
    ]);

    expect($this->superAdmin->can('migrate', $legacyIndicator))->toBeTrue();
});

test('cannot migrate non-legacy indicators', function () {
    $category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Test Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    $subCategory = $category->subCategories()->create([
        'code' => 'A.1',
        'name' => 'Test Sub Category',
        'display_order' => 1,
    ]);

    $hierarchicalIndicator = $subCategory->indicators()->create([
        'code' => 'IND-001',
        'question' => 'New indicator?',
        'answer_type' => 'boolean',
        'weight' => 5.00,
        'sort_order' => 1,
        'is_active' => true,
    ]);

    expect($this->superAdmin->can('migrate', $hierarchicalIndicator))->toBeFalse();
});
