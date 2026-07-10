<?php

namespace Database\Factories;

use App\Models\JournalOutput;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\JournalOutput>
 */
class JournalOutputFactory extends Factory
{
    protected $model = JournalOutput::class;

    public function definition(): array
    {
        return [
            'doi' => '10.' . fake()->numerify('####/#####'),
            'journal_name' => fake()->company() . ' Journal',
            'volume' => fake()->numerify('##'),
            'number' => fake()->numerify('##'),
            'url' => fake()->url(),
        ];
    }
}