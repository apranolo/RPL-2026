<?php

namespace Database\Factories;

use App\Models\BookOutput;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BookOutput>
 */
class BookOutputFactory extends Factory
{
    protected $model = BookOutput::class;

    public function definition(): array
    {
        return [
            'isbn' => '978-' . fake()->numerify('###-#-##-#####-#'),
            'publisher' => fake()->company(),
            'pages' => fake()->numberBetween(50, 500),
        ];
    }
}