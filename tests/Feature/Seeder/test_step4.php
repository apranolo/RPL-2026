<?php

// Complete verification script for Step 4

require __DIR__.'/../../../vendor/autoload.php';

$app = require_once __DIR__.'/../../../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo '=== STEP 4: SEED VERIFICATION ==='.PHP_EOL;
echo PHP_EOL;

// 1. Templates
echo '📋 1. ACCREDITATION TEMPLATES'.PHP_EOL;
$templates = App\Models\AccreditationTemplate::all();
echo "  Total: {$templates->count()}".PHP_EOL;
foreach ($templates as $template) {
    $active = $template->is_active ? 'ACTIVE' : 'INACTIVE';
    echo "  • [{$active}] {$template->name} (type={$template->type}, version={$template->version})".PHP_EOL;
}
echo PHP_EOL;

// 2. Categories
echo '📊 2. EVALUATION CATEGORIES'.PHP_EOL;
$categories = App\Models\EvaluationCategory::with('template')->orderBy('template_id')->orderBy('display_order')->get();
echo "  Total: {$categories->count()}".PHP_EOL;
foreach ($categories->groupBy('template_id') as $templateId => $cats) {
    $templateName = $cats->first()->template->name;
    echo "  • Template: {$templateName}".PHP_EOL;
    foreach ($cats as $cat) {
        echo "    - {$cat->code}: {$cat->name} (weight={$cat->weight})".PHP_EOL;
    }
}
echo PHP_EOL;

// 3. Sub-Categories
echo '📑 3. EVALUATION SUB-CATEGORIES'.PHP_EOL;
$subCategories = App\Models\EvaluationSubCategory::with('category')->get();
echo "  Total: {$subCategories->count()}".PHP_EOL;
$grouped = $subCategories->groupBy('category.name');
foreach ($grouped as $categoryName => $subs) {
    echo "  • {$categoryName}: {$subs->count()} sub-categories".PHP_EOL;
}
echo PHP_EOL;

// 4. Indicators Migration Status
echo '🔄 4. INDICATORS MIGRATION STATUS'.PHP_EOL;
$totalIndicators = App\Models\EvaluationIndicator::count();
$hierarchical = App\Models\EvaluationIndicator::whereNotNull('sub_category_id')->count();
$legacy = App\Models\EvaluationIndicator::whereNull('sub_category_id')->count();
echo "  Total indicators: {$totalIndicators}".PHP_EOL;
echo "  • Hierarchical (v1.1): {$hierarchical}".PHP_EOL;
echo "  • Legacy (v1.0): {$legacy}".PHP_EOL;
echo PHP_EOL;

// 5. Essay Questions
echo '📝 5. ESSAY QUESTIONS'.PHP_EOL;
$essays = App\Models\EssayQuestion::with('category.template')->get();
echo "  Total: {$essays->count()}".PHP_EOL;
foreach ($essays->groupBy('category.template.name') as $templateName => $essayGroup) {
    $active = $essayGroup->where('is_active', true)->count();
    $inactive = $essayGroup->where('is_active', false)->count();
    echo "  • {$templateName}:".PHP_EOL;
    echo "    - Active: {$active}".PHP_EOL;
    echo "    - Inactive: {$inactive}".PHP_EOL;
}
echo PHP_EOL;

// 6. Hierarchical Structure Validation
echo '🔍 6. HIERARCHICAL STRUCTURE VALIDATION'.PHP_EOL;

// Check template -> category -> subcategory -> indicator chain
$banptTemplate = App\Models\AccreditationTemplate::where('type', 'akreditasi')->where('is_active', true)->first();
if ($banptTemplate) {
    $categoriesCount = $banptTemplate->categories()->count();
    $subCategoriesCount = App\Models\EvaluationSubCategory::whereHas('category', function ($q) use ($banptTemplate) {
        $q->where('template_id', $banptTemplate->id);
    })->count();

    $indicatorsCount = App\Models\EvaluationIndicator::whereHas('subCategory.category', function ($q) use ($banptTemplate) {
        $q->where('template_id', $banptTemplate->id);
    })->count();

    $essaysCount = App\Models\EssayQuestion::whereHas('category', function ($q) use ($banptTemplate) {
        $q->where('template_id', $banptTemplate->id);
    })->count();

    echo '  BAN-PT Template Hierarchy:'.PHP_EOL;
    echo "    Template → {$categoriesCount} Categories → {$subCategoriesCount} Sub-Categories → {$indicatorsCount} Indicators".PHP_EOL;
    echo "    Template → {$categoriesCount} Categories → {$essaysCount} Essay Questions".PHP_EOL;

    // Verify weight consistency
    $totalWeight = $banptTemplate->categories()->sum('weight');
    $indicatorWeight = App\Models\EvaluationIndicator::whereHas('subCategory.category', function ($q) use ($banptTemplate) {
        $q->where('template_id', $banptTemplate->id);
    })->sum('weight');

    echo "    Total category weight: {$totalWeight}".PHP_EOL;
    echo "    Total indicator weight: {$indicatorWeight}".PHP_EOL;

    $weightMatch = abs($totalWeight - $indicatorWeight) < 0.01;
    $status = $weightMatch ? '✓ VALIDATED' : '✗ MISMATCH';
    echo "    Weight consistency: {$status}".PHP_EOL;
}

echo PHP_EOL;

// 7. Sample Data Check
echo '📄 7. SAMPLE DATA CHECK'.PHP_EOL;
$sampleIndicator = App\Models\EvaluationIndicator::with('subCategory.category.template')->first();
if ($sampleIndicator) {
    echo "  Sample Indicator: {$sampleIndicator->code}".PHP_EOL;
    echo "    Question: {$sampleIndicator->question}".PHP_EOL;
    echo "    Weight: {$sampleIndicator->weight}".PHP_EOL;
    if ($sampleIndicator->subCategory) {
        echo "    Sub-Category: {$sampleIndicator->subCategory->name}".PHP_EOL;
        echo "    Category: {$sampleIndicator->subCategory->category->name}".PHP_EOL;
        echo "    Template: {$sampleIndicator->subCategory->category->template->name}".PHP_EOL;
    }
}

echo PHP_EOL;

// 8. Final Summary
echo '✅ STEP 4 VERIFICATION SUMMARY'.PHP_EOL;
echo "  ✓ Templates created: {$templates->count()}/2".PHP_EOL;
echo "  ✓ Categories created: {$categories->count()}/6".PHP_EOL;
echo "  ✓ Sub-categories created: {$subCategories->count()}/12".PHP_EOL;
echo "  ✓ Indicators migrated: {$hierarchical}/{$totalIndicators}".PHP_EOL;
echo "  ✓ Essays created: {$essays->count()}/6".PHP_EOL;
echo PHP_EOL;

$allPassed = $templates->count() === 2
    && $categories->count() === 6
    && $subCategories->count() === 12
    && $hierarchical === $totalIndicators
    && $legacy === 0
    && $essays->count() === 6;

if ($allPassed) {
    echo '🎉 ALL TESTS PASSED! Step 4 completed successfully!'.PHP_EOL;
} else {
    echo '⚠️  WARNING: Some validations failed. Please review above.'.PHP_EOL;
}
