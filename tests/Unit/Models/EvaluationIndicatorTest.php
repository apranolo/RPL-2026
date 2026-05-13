<?php

use App\Models\AccreditationTemplate;
use App\Models\EvaluationIndicator;
use App\Models\EvaluationSubCategory;

beforeEach(function () {
    // Create hierarchy for testing
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
        'display_order' => 1,
    ]);

    // Create v1.1 hierarchical indicator
    $this->hierarchicalIndicator = EvaluationIndicator::create([
        'sub_category_id' => $this->subCategory->id,
        'code' => 'IND-001',
        'question' => 'Test hierarchical indicator?',
        'answer_type' => 'boolean',
        'weight' => 5.00,
        'sort_order' => 1,
        'is_active' => true,
    ]);

    // Create v1.0 legacy indicator (no sub_category_id)
    $this->legacyIndicator = EvaluationIndicator::create([
        'category' => 'Old Category',
        'sub_category' => 'Old Sub Category',
        'code' => 'IND-002',
        'question' => 'Test legacy indicator?',
        'answer_type' => 'scale',
        'weight' => 3.00,
        'sort_order' => 2,
        'is_active' => true,
    ]);
});

test('evaluation indicator has sub_category_id in fillable', function () {
    $fillable = (new EvaluationIndicator)->getFillable();

    expect($fillable)->toContain('sub_category_id')
        ->and($fillable)->toContain('category')  // Backward compatible
        ->and($fillable)->toContain('sub_category'); // Backward compatible
});

test('hierarchical indicator has sub category relationship', function () {
    expect($this->hierarchicalIndicator->subCategory)->toBeInstanceOf(EvaluationSubCategory::class)
        ->and($this->hierarchicalIndicator->subCategory->name)->toBe('Test Sub Category');
});

test('is hierarchical returns true for v1.1 indicators', function () {
    expect($this->hierarchicalIndicator->isHierarchical())->toBeTrue();
});

test('is legacy returns false for v1.1 indicators', function () {
    expect($this->hierarchicalIndicator->isLegacy())->toBeFalse();
});

test('is hierarchical returns false for v1.0 indicators', function () {
    expect($this->legacyIndicator->isHierarchical())->toBeFalse();
});

test('is legacy returns true for v1.0 indicators', function () {
    expect($this->legacyIndicator->isLegacy())->toBeTrue();
});

test('get template returns template through hierarchy', function () {
    $template = $this->hierarchicalIndicator->getTemplate();

    expect($template)->toBeInstanceOf(AccreditationTemplate::class)
        ->and($template->name)->toBe('Test Template');
});

test('get template returns null for legacy indicators', function () {
    expect($this->legacyIndicator->getTemplate())->toBeNull();
});

test('by sub category scope filters correctly', function () {
    $indicators = EvaluationIndicator::bySubCategory($this->subCategory->id)->get();

    expect($indicators)->toHaveCount(1)
        ->and($indicators->first()->id)->toBe($this->hierarchicalIndicator->id);
});

test('by category id scope filters through relationship', function () {
    $indicators = EvaluationIndicator::byCategoryId($this->category->id)->get();

    expect($indicators)->toHaveCount(1)
        ->and($indicators->first()->id)->toBe($this->hierarchicalIndicator->id);
});

test('active scope filters only active indicators', function () {
    EvaluationIndicator::create([
        'sub_category_id' => $this->subCategory->id,
        'code' => 'IND-003',
        'question' => 'Inactive indicator?',
        'answer_type' => 'boolean',
        'weight' => 2.00,
        'sort_order' => 3,
        'is_active' => false,
    ]);

    $activeIndicators = EvaluationIndicator::active()->get();

    expect($activeIndicators)->toHaveCount(2); // Only the 2 active ones
});

test('ordered scope sorts by sort_order', function () {
    $indicators = EvaluationIndicator::ordered()->get();

    expect($indicators->first()->sort_order)->toBe(1)
        ->and($indicators->last()->sort_order)->toBe(2);
});

test('calculate score works for boolean type', function () {
    $score = $this->hierarchicalIndicator->calculateScore(true);

    expect($score)->toBe(5.0);

    $scoreZero = $this->hierarchicalIndicator->calculateScore(false);
    expect($scoreZero)->toBe(0.0);
});

test('calculate score works for scale type', function () {
    $score = $this->legacyIndicator->calculateScore(5);

    expect($score)->toBe(3.0); // (5/5) * 3.00 = 3.0

    $scoreHalf = $this->legacyIndicator->calculateScore(3);
    expect($scoreHalf)->toEqualWithDelta(1.8, 0.01); // (3/5) * 3.00 = 1.8 (with floating point tolerance)
});

test('legacy get categories method still works', function () {
    $categories = EvaluationIndicator::getCategories();

    expect($categories)->toBeArray()
        ->and($categories)->toContain('Old Category');
});
