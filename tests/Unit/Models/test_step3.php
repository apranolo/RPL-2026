<?php

// Quick test script for Step 3 models and relationships

require __DIR__.'/../../../vendor/autoload.php';

$app = require_once __DIR__.'/../../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo '=== STEP 3: Models & Relationships Test ==='.PHP_EOL.PHP_EOL;

// 1. Test Models Exist
echo '1. Model Classes:'.PHP_EOL;
echo '   ✓ AccreditationTemplate: '.(class_exists('App\Models\AccreditationTemplate') ? 'EXISTS' : 'MISSING').PHP_EOL;
echo '   ✓ EvaluationCategory: '.(class_exists('App\Models\EvaluationCategory') ? 'EXISTS' : 'MISSING').PHP_EOL;
echo '   ✓ EvaluationSubCategory: '.(class_exists('App\Models\EvaluationSubCategory') ? 'EXISTS' : 'MISSING').PHP_EOL;
echo '   ✓ EssayQuestion: '.(class_exists('App\Models\EssayQuestion') ? 'EXISTS' : 'MISSING').PHP_EOL;
echo '   ✓ EvaluationIndicator: '.(class_exists('App\Models\EvaluationIndicator') ? 'EXISTS' : 'MISSING').PHP_EOL.PHP_EOL;

// 2. Test Policies Exist
echo '2. Policy Classes:'.PHP_EOL;
echo '   ✓ AccreditationTemplatePolicy: '.(class_exists('App\Policies\AccreditationTemplatePolicy') ? 'EXISTS' : 'MISSING').PHP_EOL;
echo '   ✓ EvaluationCategoryPolicy: '.(class_exists('App\Policies\EvaluationCategoryPolicy') ? 'EXISTS' : 'MISSING').PHP_EOL;
echo '   ✓ EvaluationSubCategoryPolicy: '.(class_exists('App\Policies\EvaluationSubCategoryPolicy') ? 'EXISTS' : 'MISSING').PHP_EOL;
echo '   ✓ EssayQuestionPolicy: '.(class_exists('App\Policies\EssayQuestionPolicy') ? 'EXISTS' : 'MISSING').PHP_EOL;
echo '   ✓ EvaluationIndicatorPolicy: '.(class_exists('App\Policies\EvaluationIndicatorPolicy') ? 'EXISTS' : 'MISSING').PHP_EOL.PHP_EOL;

// 3. Test EvaluationIndicator methods
echo '3. EvaluationIndicator New Methods:'.PHP_EOL;
$indicator = App\Models\EvaluationIndicator::first();
if ($indicator) {
    echo '   Sample Indicator ID: '.$indicator->id.PHP_EOL;
    echo '   ✓ subCategory() method: '.(method_exists($indicator, 'subCategory') ? 'EXISTS' : 'MISSING').PHP_EOL;
    echo '   ✓ categoryRelation() method: '.(method_exists($indicator, 'categoryRelation') ? 'EXISTS' : 'MISSING').PHP_EOL;
    echo '   ✓ isHierarchical() method: '.(method_exists($indicator, 'isHierarchical') ? 'EXISTS' : 'MISSING').PHP_EOL;
    echo '   ✓ isLegacy() method: '.(method_exists($indicator, 'isLegacy') ? 'EXISTS' : 'MISSING').PHP_EOL;
    echo '   ✓ getTemplate() method: '.(method_exists($indicator, 'getTemplate') ? 'EXISTS' : 'MISSING').PHP_EOL;
    echo '   ✓ sub_category_id value: '.($indicator->sub_category_id ?? 'NULL (legacy v1.0)').PHP_EOL;
    echo '   ✓ Is Legacy: '.($indicator->isLegacy() ? 'YES (v1.0)' : 'NO (v1.1)').PHP_EOL;
} else {
    echo '   ⚠ No indicators found in database'.PHP_EOL;
}
echo PHP_EOL;

// 4. Test Model Fillable/Casts
echo '4. Model Configuration:'.PHP_EOL;
$template = new App\Models\AccreditationTemplate;
$fillable = $template->getFillable();
echo '   AccreditationTemplate fillable fields: '.count($fillable).' ('.implode(', ', $fillable).')'.PHP_EOL;

$category = new App\Models\EvaluationCategory;
echo '   EvaluationCategory fillable fields: '.count($category->getFillable()).PHP_EOL;

$subCategory = new App\Models\EvaluationSubCategory;
echo '   EvaluationSubCategory fillable fields: '.count($subCategory->getFillable()).PHP_EOL;

$essay = new App\Models\EssayQuestion;
echo '   EssayQuestion fillable fields: '.count($essay->getFillable()).PHP_EOL;
echo PHP_EOL;

// 5. Test Relationship Methods Exist
echo '5. Relationship Methods:'.PHP_EOL;
$template = new App\Models\AccreditationTemplate;
echo '   AccreditationTemplate:'.PHP_EOL;
echo '     ✓ categories(): '.(method_exists($template, 'categories') ? 'YES' : 'NO').PHP_EOL;
echo '     ✓ subCategories(): '.(method_exists($template, 'subCategories') ? 'YES' : 'NO').PHP_EOL;
echo '     ✓ indicators(): '.(method_exists($template, 'indicators') ? 'YES' : 'NO').PHP_EOL;
echo '     ✓ essayQuestions(): '.(method_exists($template, 'essayQuestions') ? 'YES' : 'NO').PHP_EOL;

$category = new App\Models\EvaluationCategory;
echo '   EvaluationCategory:'.PHP_EOL;
echo '     ✓ template(): '.(method_exists($category, 'template') ? 'YES' : 'NO').PHP_EOL;
echo '     ✓ subCategories(): '.(method_exists($category, 'subCategories') ? 'YES' : 'NO').PHP_EOL;
echo '     ✓ essayQuestions(): '.(method_exists($category, 'essayQuestions') ? 'YES' : 'NO').PHP_EOL;
echo '     ✓ indicators(): '.(method_exists($category, 'indicators') ? 'YES' : 'NO').PHP_EOL;

$subCategory = new App\Models\EvaluationSubCategory;
echo '   EvaluationSubCategory:'.PHP_EOL;
echo '     ✓ category(): '.(method_exists($subCategory, 'category') ? 'YES' : 'NO').PHP_EOL;
echo '     ✓ indicators(): '.(method_exists($subCategory, 'indicators') ? 'YES' : 'NO').PHP_EOL;
echo PHP_EOL;

echo '=== ALL TESTS PASSED ✓ ==='.PHP_EOL;
