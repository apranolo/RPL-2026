<?php

namespace Database\Seeders;

use App\Models\ResearchSchema;
use Illuminate\Database\Seeder;

class ResearchSchemaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ResearchSchema::create([
            'name' => 'Penelitian Dasar',
            'description' => 'Penelitian dasar',
        ]);

        ResearchSchema::create([
            'name' => 'Penelitian Terapan',
            'description' => 'Penelitian terapan',
        ]);
    }
}
