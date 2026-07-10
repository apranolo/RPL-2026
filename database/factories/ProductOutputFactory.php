<?php

namespace Database\Factories;

use App\Models\ProductOutput;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProductOutput>
 */
class ProductOutputFactory extends Factory
{
    protected $model = ProductOutput::class;

    public function definition(): array
    {
        return [
            'partner_institution' => fake()->company(),
            'benefits_description' => fake()->paragraph(),
        ];
    }
}