<?php

namespace Database\Factories;

use App\Models\HkiOutput;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HkiOutput>
 */
class HkiOutputFactory extends Factory
{
    protected $model = HkiOutput::class;

    public function definition(): array
    {
        return [
            'patent_number' => fake()->bothify('IDP#######'),
            'patent_type' => fake()->randomElement(['Paten', 'Paten Sederhana']),
            'inventors' => fake()->name() . ', ' . fake()->name(),
        ];
    }
}