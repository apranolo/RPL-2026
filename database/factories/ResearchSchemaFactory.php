<?php

namespace Database\Factories;

use App\Models\ResearchSchema;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResearchSchema>
 */
class ResearchSchemaFactory extends Factory
{
    protected $model = ResearchSchema::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->randomElement([
                'Penelitian Dasar',
                'Penelitian Terapan',
                'Penelitian Pengembangan',
                'Penelitian Kebijakan',
            ]).' '.$this->faker->unique()->numberBetween(1, 9999),
            'description' => $this->faker->sentence,
            'max_funding' => $this->faker->numberBetween(10000000, 500000000),
            'is_active' => true,
        ];
    }
}
