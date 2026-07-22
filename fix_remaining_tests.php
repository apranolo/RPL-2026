<?php

function replace_in_file($path, $search, $replace)
{
    if (! file_exists($path)) {
        return;
    }
    $content = file_get_contents($path);
    $new_content = str_replace($search, $replace, $content);
    if ($content !== $new_content) {
        file_put_contents($path, $new_content);
        echo "Updated $path\n";
    }
}

// 1. MonevReportTest: add contract_number
$monev = 'tests/Feature/MonevReportTest.php';
replace_in_file($monev,
    "'university_id' => \$this->univA->id,",
    "'contract_number' => 'CTR-001', 'university_id' => \$this->univA->id,"
);
replace_in_file($monev,
    "'university_id' => \$this->univB->id,",
    "'contract_number' => 'CTR-002', 'university_id' => \$this->univB->id,"
);
replace_in_file($monev,
    "'university_id' => \$univA->id,",
    "'contract_number' => 'CTR-001', 'university_id' => \$univA->id,"
);
replace_in_file($monev,
    "'university_id' => \$univB->id,",
    "'contract_number' => 'CTR-002', 'university_id' => \$univB->id,"
);
// In test: it allows admin kampus to change research status using delay
replace_in_file($monev,
    "DB::table('contracts')->insert([",
    "DB::table('contracts')->insert([\n        ['contract_number' => 'C001', 'university_id' => 1, 'proposal_id' => 1, 'title' => 'Penelitian Univ A', 'status' => 'active', 'contract_value' => 10000000, 'created_at' => now(), 'updated_at' => now()],\n    ]);\n    /*"
);
// This is fragile. A better way for MonevReportTest is to just search and replace the manual DB::table inserts to include contract_number.

// Let's do regex for DB::table('contracts')->insert
$c = file_get_contents($monev);
$c = preg_replace('/(\'university_id\'\s*=>\s*.*?,)/', "'contract_number' => 'CTR-' . rand(1000,9999), $1", $c);
file_put_contents($monev, $c);
echo "Regex updated $monev\n";

// 2. EvaluationControllerTest: fix proposal create
$eval = 'tests/Feature/EvaluationControllerTest.php';
$c = file_get_contents($eval);
$c = str_replace(
    "'user_id' => \$this->dosen->id,\n            'judul' => 'Proposal Test',\n            'deskripsi' => 'Deskripsi test',",
    "'user_id' => \$this->dosen->id,\n            'research_schema_id' => \App\Models\ResearchSchema::create(['name'=>'S', 'max_funding'=>1])->id,\n            'title' => 'Proposal Test',\n            'description' => 'Deskripsi test',", $c
);
file_put_contents($eval, $c);
echo "Updated $eval\n";

// 3. ProposalEntityTest
$prop = 'tests/Feature/ProposalEntityTest.php';
replace_in_file($prop,
    "'title' => 'Implementasi Machine Learning Pada IoT',",
    "'title' => 'Implementasi Machine Learning Pada IoT',\n        'description' => 'Desc',"
);
