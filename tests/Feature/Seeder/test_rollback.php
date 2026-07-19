<?php

use App\Models\EvaluationIndicator;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Schema;

// Quick script to check database state after rollback

require __DIR__.'/../../../vendor/autoload.php';

$app = require_once __DIR__.'/../../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

echo '=== AFTER ROLLBACK CHECK ==='.PHP_EOL;
echo PHP_EOL;

// Check tables existence
$tables = [
    'accreditation_templates',
    'evaluation_categories',
    'evaluation_sub_categories',
    'essay_questions',
    'evaluation_indicators',
];

echo '📊 Table Existence Check:'.PHP_EOL;
foreach ($tables as $table) {
    $exists = Schema::hasTable($table);
    $status = $exists ? '✓ EXISTS' : '✗ DROPPED';
    echo "  {$status}: {$table}".PHP_EOL;
}

echo PHP_EOL;

// Check evaluation_indicators structure
if (Schema::hasTable('evaluation_indicators')) {
    echo '📋 Evaluation Indicators Table:'.PHP_EOL;

    $hasSubCategoryId = Schema::hasColumn('evaluation_indicators', 'sub_category_id');
    echo '  • sub_category_id column: '.($hasSubCategoryId ? '✓ EXISTS' : '✗ REMOVED').PHP_EOL;

    $count = EvaluationIndicator::count();
    echo "  • Total indicators: {$count}".PHP_EOL;

    if ($count > 0) {
        $sample = EvaluationIndicator::first();
        echo "  • Sample indicator code: {$sample->code}".PHP_EOL;
        echo "  • Sample indicator category: {$sample->category}".PHP_EOL;

        if ($hasSubCategoryId) {
            echo '  • Sample sub_category_id: '.($sample->sub_category_id ?? 'NULL').PHP_EOL;
        }
    }
}

echo PHP_EOL;
echo '✨ Rollback verification complete!'.PHP_EOL;
