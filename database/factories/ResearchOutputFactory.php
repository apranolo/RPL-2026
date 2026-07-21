<?php

namespace Database\Factories;

use App\Models\ResearchOutput;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResearchOutput>
 */
class ResearchOutputFactory extends Factory
{
    protected $model = ResearchOutput::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'type' => $this->faker->randomElement(['Jurnal', 'Buku', 'HKI', 'Produk']),
            'year' => (string) $this->faker->year(),
            'status' => 'verified',
        ];
    }
}
