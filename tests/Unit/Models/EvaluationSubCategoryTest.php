<?php

use App\Models\AccreditationTemplate;
use App\Models\EvaluationCategory;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;

beforeEach(function () {
    $this->template = AccreditationTemplate::create([
        'name' => 'Test Template',
        'type' => 'akreditasi',
        'is_active' => true,
        'effective_date' => now(),
    ]);

    $this->category = $this->template->categories()->create([
        'code' => 'A',
        'name' => 'Test Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    $this->subCategory = $this->category->subCategories()->create([
        'code' => 'A.1',
        'name' => 'Test Sub Category',
        'description' => 'Sub category description',
        'display_order' => 1,
    ]);
});

test('evaluation sub category can be created', function () {
    expect($this->subCategory)->toBeInstanceOf(EvaluationSubCategory::class)
        ->and($this->subCategory->name)->toBe('Test Sub Category')
        ->and($this->subCategory->code)->toBe('A.1');
});

test('evaluation sub category has correct fillable attributes', function () {
    $fillable = (new EvaluationSubCategory)->getFillable();

    expect($fillable)->toContain('category_id')
        ->and($fillable)->toContain('code')
        ->and($fillable)->toContain('name')
        ->and($fillable)->toContain('description')
        ->and($fillable)->toContain('display_order');
});

test('evaluation sub category belongs to category', function () {
    expect($this->subCategory->category)->toBeInstanceOf(EvaluationCategory::class)
        ->and($this->subCategory->category->name)->toBe('Test Category');
});

test('evaluation sub category has indicators relationship', function () {
    $indicator = $this->subCategory->indicators()->create([
        'code' => 'IND-001',
        'question' => 'Test indicator?',
        'answer_type' => 'boolean',
        'weight' => 5.00,
        'sort_order' => 1,
        'is_active' => true,
    ]);

    expect($this->subCategory->indicators)->toHaveCount(1)
        ->and($this->subCategory->indicators->first())->toBeInstanceOf(EvaluationIndicator::class);
});

test('ordered scope sorts by display_order', function () {
    $this->category->subCategories()->create([
        'code' => 'A.2',
        'name' => 'Second Sub Category',
        'display_order' => 2,
    ]);

    $subCategories = EvaluationSubCategory::ordered()->get();

    expect($subCategories->first()->display_order)->toBe(1)
        ->and($subCategories->last()->display_order)->toBe(2);
});

test('for category scope filters by category id', function () {
    $otherCategory = $this->template->categories()->create([
        'code' => 'B',
        'name' => 'Other Category',
        'weight' => 30.00,
        'display_order' => 2,
    ]);

    $otherCategory->subCategories()->create([
        'code' => 'B.1',
        'name' => 'Other Sub Category',
        'display_order' => 1,
    ]);

    $filteredSubCategories = EvaluationSubCategory::forCategory($this->category->id)->get();

    expect($filteredSubCategories)->toHaveCount(1)
        ->and($filteredSubCategories->first()->category_id)->toBe($this->category->id);
});

test('get template returns template through category', function () {
    $template = $this->subCategory->getTemplate();

    expect($template)->toBeInstanceOf(AccreditationTemplate::class)
        ->and($template->name)->toBe('Test Template');
});

test('can be deleted returns true when no submitted assessments', function () {
    expect($this->subCategory->canBeDeleted())->toBeTrue();
});

test('move to category works within same template', function () {
    $newCategory = $this->template->categories()->create([
        'code' => 'B',
        'name' => 'New Category',
        'weight' => 40.00,
        'display_order' => 2,
    ]);

    $result = $this->subCategory->moveToCategory($newCategory->id);

    expect($result)->toBeTrue()
        ->and($this->subCategory->fresh()->category_id)->toBe($newCategory->id);
});

test('move to category throws exception for different template', function () {
    $differentTemplate = AccreditationTemplate::create([
        'name' => 'Different Template',
        'type' => 'indeksasi',
        'is_active' => true,
        'effective_date' => now(),
    ]);

    $differentCategory = $differentTemplate->categories()->create([
        'code' => 'X',
        'name' => 'Different Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    expect(fn () => $this->subCategory->moveToCategory($differentCategory->id))
        ->toThrow(Exception::class, 'Cannot move sub-category to a category in a different template');
});

test('soft delete works correctly', function () {
    $id = $this->subCategory->id;
    $this->subCategory->delete();

    expect(EvaluationSubCategory::find($id))->toBeNull()
        ->and(EvaluationSubCategory::withTrashed()->find($id))->not->toBeNull();
});
