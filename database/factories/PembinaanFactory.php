<?php

namespace Database\Factories;

use App\Models\Pembinaan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pembinaan>
 */
class PembinaanFactory extends Factory
{
    protected $model = Pembinaan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'category' => $this->faker->randomElement(['akreditasi', 'indeksasi']),
            'registration_start' => now()->subDays(5),
            'registration_end' => now()->addDays(5),
            'assessment_start' => now()->addDays(6),
            'assessment_end' => now()->addDays(15),
            'quota' => 10,
            'status' => 'active',
            'created_by' => \App\Models\User::factory(),
        ];
    }
}
