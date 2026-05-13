<?php

namespace Database\Factories;

use App\Models\Contract;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Contract>
 */
class ContractFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'researcher_id' => User::factory(),
            'contract_number' => 'KTK-' . date('Y') . '-' . str_pad(fake()->unique()->numberBetween(1, 9999), 4, '0', STR_PAD_LEFT),
            'contract_date' => fake()->dateTimeBetween('-6 months'),
            'party_1' => 'LPPM Universitas ' . fake()->company(),
            'party_2' => fake()->name(),
            'total_approved_funding' => fake()->numberBetween(50000000, 500000000), // 50M - 500M
            'contract_status' => fake()->randomElement(['aktif', 'selesai', 'ditangguhkan']),
            'created_by' => 1,
        ];
    }

    /**
     * Indicate that the contract is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'contract_status' => 'aktif',
        ]);
    }

    /**
     * Indicate that the contract is finished.
     */
    public function finished(): static
    {
        return $this->state(fn (array $attributes) => [
            'contract_status' => 'selesai',
        ]);
    }

    /**
     * Indicate that the contract is suspended.
     */
    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'contract_status' => 'ditangguhkan',
        ]);
    }
}
