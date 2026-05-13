<?php

use App\Models\AccreditationTemplate;
use App\Models\EssayQuestion;
use App\Models\EvaluationCategory;

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

    $this->essay = $this->category->essayQuestions()->create([
        'code' => 'E-A-1',
        'question' => 'Jelaskan visi dan misi institusi Anda?',
        'guidance' => 'Sertakan bukti dokumen dan implementasi',
        'max_words' => 500,
        'is_required' => true,
        'display_order' => 1,
        'is_active' => true,
    ]);
});

test('essay question can be created', function () {
    expect($this->essay)->toBeInstanceOf(EssayQuestion::class)
        ->and($this->essay->question)->toBe('Jelaskan visi dan misi institusi Anda?')
        ->and($this->essay->max_words)->toBe(500)
        ->and($this->essay->is_required)->toBeTrue();
});

test('essay question has correct fillable attributes', function () {
    $fillable = (new EssayQuestion)->getFillable();

    expect($fillable)->toContain('category_id')
        ->and($fillable)->toContain('code')
        ->and($fillable)->toContain('question')
        ->and($fillable)->toContain('guidance')
        ->and($fillable)->toContain('max_words')
        ->and($fillable)->toContain('is_required')
        ->and($fillable)->toContain('display_order')
        ->and($fillable)->toContain('is_active');
});

test('essay question belongs to category', function () {
    expect($this->essay->category)->toBeInstanceOf(EvaluationCategory::class)
        ->and($this->essay->category->name)->toBe('Test Category');
});

test('active scope filters only active essays', function () {
    $this->category->essayQuestions()->create([
        'code' => 'E-A-2',
        'question' => 'Inactive question?',
        'max_words' => 300,
        'is_required' => false,
        'display_order' => 2,
        'is_active' => false,
    ]);

    $activeEssays = EssayQuestion::active()->get();

    expect($activeEssays)->toHaveCount(1)
        ->and($activeEssays->first()->is_active)->toBeTrue();
});

test('required scope filters only required essays', function () {
    $this->category->essayQuestions()->create([
        'code' => 'E-A-2',
        'question' => 'Optional question?',
        'max_words' => 300,
        'is_required' => false,
        'display_order' => 2,
        'is_active' => true,
    ]);

    $requiredEssays = EssayQuestion::required()->get();

    expect($requiredEssays)->toHaveCount(1)
        ->and($requiredEssays->first()->is_required)->toBeTrue();
});

test('ordered scope sorts by display_order', function () {
    $this->category->essayQuestions()->create([
        'code' => 'E-A-2',
        'question' => 'Second question?',
        'max_words' => 400,
        'is_required' => true,
        'display_order' => 2,
        'is_active' => true,
    ]);

    $essays = EssayQuestion::ordered()->get();

    expect($essays->first()->display_order)->toBe(1)
        ->and($essays->last()->display_order)->toBe(2);
});

test('for category scope filters by category id', function () {
    $otherCategory = $this->template->categories()->create([
        'code' => 'B',
        'name' => 'Other Category',
        'weight' => 30.00,
        'display_order' => 2,
    ]);

    $otherCategory->essayQuestions()->create([
        'code' => 'E-B-1',
        'question' => 'Other category question?',
        'max_words' => 400,
        'is_required' => true,
        'display_order' => 1,
        'is_active' => true,
    ]);

    $filteredEssays = EssayQuestion::forCategory($this->category->id)->get();

    expect($filteredEssays)->toHaveCount(1)
        ->and($filteredEssays->first()->category_id)->toBe($this->category->id);
});

test('get template returns template through category', function () {
    $template = $this->essay->getTemplate();

    expect($template)->toBeInstanceOf(AccreditationTemplate::class)
        ->and($template->name)->toBe('Test Template');
});

test('validate word count returns true for valid answer', function () {
    $validAnswer = str_repeat('word ', 400).'word'; // 401 words

    expect($this->essay->validateWordCount($validAnswer))->toBeTrue();
});

test('validate word count returns false for exceeding answer', function () {
    $exceedingAnswer = str_repeat('word ', 600).'word'; // 601 words

    expect($this->essay->validateWordCount($exceedingAnswer))->toBeFalse();
});

test('get word count returns correct count', function () {
    $answer = 'This is a test answer with exactly ten words here';

    expect($this->essay->getWordCount($answer))->toBe(10);
});

test('get word count strips html tags', function () {
    $answer = '<p>This is <strong>bold</strong> and <em>italic</em> text</p>';

    expect($this->essay->getWordCount($answer))->toBe(6);
});

test('soft delete works correctly', function () {
    $id = $this->essay->id;
    $this->essay->delete();

    expect(EssayQuestion::find($id))->toBeNull()
        ->and(EssayQuestion::withTrashed()->find($id))->not->toBeNull();
});
