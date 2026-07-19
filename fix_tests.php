<?php
$files = [
    'tests/Feature/AdminKampus/AgendaTest.php',
    'tests/Feature/Editorial/ShowDetailTest.php',
    'tests/Feature/EditorialShowTest.php',
    'tests/Feature/MonevReportTest.php',
    'tests/Feature/ReviewSummaryTest.php',
    'tests/Feature/User/FundingTest.php'
];
foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $content = preg_replace('/->roles\(\)->attach\(([^,]+?)\);/', '->roles()->syncWithoutDetaching([$1]);', $content);
        file_put_contents($file, $content);
        echo 'Fixed ' . $file . PHP_EOL;
    }
}
