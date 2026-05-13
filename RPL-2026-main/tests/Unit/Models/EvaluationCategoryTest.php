<?php

use App\Models\AccreditationTemplate;
use App\Models\EssayQuestion;
use App\Models\EvaluationCategory;
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
        'name' => 'Visi Misi',
        'description' => 'Category description',
        'weight' => 30.00,
        'display_order' => 1,
    ]);
});

test('evaluation category can be created', function () {
    expect($this->category)->toBeInstanceOf(EvaluationCategory::class)
        ->and($this->category->name)->toBe('Visi Misi')
        ->and($this->category->code)->toBe('A')
        ->and($this->category->weight)->toBe('30.00');
});

test('evaluation category has correct fillable attributes', function () {
    $fillable = (new EvaluationCategory)->getFillable();

    expect($fillable)->toContain('template_id')
        ->and($fillable)->toContain('code')
        ->and($fillable)->toContain('name')
        ->and($fillable)->toContain('description')
        ->and($fillable)->toContain('weight')
        ->and($fillable)->toContain('display_order');
});

test('evaluation category belongs to template', function () {
    expect($this->category->template)->toBeInstanceOf(AccreditationTemplate::class)
        ->and($this->category->template->name)->toBe('Test Template');
});

test('evaluation category has sub categories relationship', function () {
    $subCategory = $this->category->subCategories()->create([
        'code' => 'A.1',
        'name' => 'Sub Category 1',
        'display_order' => 1,
    ]);

    expect($this->category->subCategories)->toHaveCount(1)
        ->and($this->category->subCategories->first())->toBeInstanceOf(EvaluationSubCategory::class)
        ->and($this->category->subCategories->first()->name)->toBe('Sub Category 1');
});

test('evaluation category has essay questions relationship', function () {
    $essay = $this->category->essayQuestions()->create([
        'code' => 'E-A-1',
        'question' => 'Jelaskan visi misi institusi?',
        'max_words' => 500,
        'is_required' => true,
        'display_order' => 1,
        'is_active' => true,
    ]);

    expect($this->category->essayQuestions)->toHaveCount(1)
        ->and($this->category->essayQuestions->first())->toBeInstanceOf(EssayQuestion::class);
});

test('ordered scope sorts by display_order', function () {
    $this->template->categories()->create([
        'code' => 'B',
        'name' => 'Governance',
        'weight' => 20.00,
        'display_order' => 2,
    ]);

    $categories = EvaluationCategory::ordered()->get();

    expect($categories->first()->display_order)->toBe(1)
        ->and($categories->last()->display_order)->toBe(2);
});

test('for template scope filters by template id', function () {
    $otherTemplate = AccreditationTemplate::create([
        'name' => 'Other Template',
        'type' => 'indeksasi',
        'is_active' => true,
        'effective_date' => now(),
    ]);

    $otherTemplate->categories()->create([
        'code' => 'X',
        'name' => 'Other Category',
        'weight' => 50.00,
        'display_order' => 1,
    ]);

    $filteredCategories = EvaluationCategory::forTemplate($this->template->id)->get();

    expect($filteredCategories)->toHaveCount(1)
        ->and($filteredCategories->first()->template_id)->toBe($this->template->id);
});

test('get statistics returns correct counts', function () {
    $this->category->subCategories()->create([
        'code' => 'A.1',
        'name' => 'Sub Category 1',
        'display_order' => 1,
    ]);

    $this->category->essayQuestions()->create([
        'code' => 'E-A-1',
        'question' => 'Essay question?',
        'max_words' => 500,
        'is_required' => true,
        'display_order' => 1,
        'is_active' => true,
    ]);

    $stats = $this->category->getStatistics();

    expect($stats)->toHaveKey('sub_categories_count')
        ->and($stats)->toHaveKey('essay_questions_count')
        ->and($stats['sub_categories_count'])->toBe(1)
        ->and($stats['essay_questions_count'])->toBe(1);
});

test('can be deleted returns true when no submitted assessments', function () {
    expect($this->category->canBeDeleted())->toBeTrue();
});

test('soft delete works correctly', function () {
    $id = $this->category->id;
    $this->category->delete();

    expect(EvaluationCategory::find($id))->toBeNull()
        ->and(EvaluationCategory::withTrashed()->find($id))->not->toBeNull();
});
