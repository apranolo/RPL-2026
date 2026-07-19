<?php

function replace_in_file($path, $search, $replace) {
    if (!file_exists($path)) return;
    $content = file_get_contents($path);
    $new_content = str_replace($search, $replace, $content);
    if ($content !== $new_content) {
        file_put_contents($path, $new_content);
        echo "Updated $path\n";
    }
}

// 1. Fix PembinaanFactory
$pembinaan_factory = 'database/factories/PembinaanFactory.php';
$pf_content = file_get_contents($pembinaan_factory);
if (strpos($pf_content, "'created_by'") === false) {
    $pf_content = str_replace(
        "'status' => 'draft',",
        "'status' => 'draft',\n            'created_by' => \App\Models\User::factory(),\n            'updated_by' => \App\Models\User::factory(),",
        $pf_content
    );
    file_put_contents($pembinaan_factory, $pf_content);
    echo "Fixed PembinaanFactory.php\n";
}

// 2. Fix SchemaControllerTest (WithoutVite)
$schema_test = 'tests/Feature/SchemaControllerTest.php';
$st_content = file_get_contents($schema_test);
if (strpos($st_content, '$this->withoutVite()') === false) {
    $st_content = str_replace(
        "protected function setUp(): void\n    {\n        parent::setUp();",
        "protected function setUp(): void\n    {\n        parent::setUp();\n        \$this->withoutVite();",
        $st_content
    );
    file_put_contents($schema_test, $st_content);
    echo "Fixed SchemaControllerTest.php\n";
}

// 3. Fix RevisionCopyeditingTest
$rev_test = 'tests/Feature/RevisionCopyeditingTest.php';
$rt_content = file_get_contents($rev_test);
// Let's print out what is there around Role::firstOrCreate
$lines = explode("\n", $rt_content);
foreach($lines as $i => $line) {
    if (strpos($line, 'Role::') !== false) {
        echo "Line " . ($i+1) . ": " . $line . "\n";
    }
}

// 4. Fix MonevReportTest DB::table('contracts')
$monev_test = 'tests/Feature/MonevReportTest.php';
$mt_content = file_get_contents($monev_test);
// Replace DB::table('contracts')->insert with Contract::create or similar. Wait, it's easier to just add party_1 to the DB inserts if we do regex.
$mt_content = preg_replace('/(\'contract_number\'\s*=>\s*.*?,)/', "$1 'party_1' => 'Pihak 1', 'party_2' => 'Pihak 2', ", $mt_content);
// Also for the hardcoded one:
$mt_content = str_replace(
    "'contract_number' => 'C001', 'university_id' => 1,",
    "'contract_number' => 'C001', 'party_1' => 'A', 'party_2' => 'B', 'university_id' => 1,",
    $mt_content
);
$mt_content = str_replace(
    "'contract_number' => 'C002', 'university_id' => 2,",
    "'contract_number' => 'C002', 'party_1' => 'A', 'party_2' => 'B', 'university_id' => 2,",
    $mt_content
);
file_put_contents($monev_test, $mt_content);
echo "Fixed MonevReportTest.php\n";

