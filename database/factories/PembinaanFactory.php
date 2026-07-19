<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class PembinaanFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'Program Pembinaan ' . $this->faker->year(),
            'description' => $this->faker->paragraph(),
            'category' => 'akreditasi',
            'registration_start' => now()->subDays(10),
            'registration_end' => now()->addDays(10),
            'assessment_start' => now()->addDays(11),
            'assessment_end' => now()->addDays(20),
            'quota' => 50,
            'status' => 'draft',
            'created_by' => \App\Models\User::factory(),
            'updated_by' => \App\Models\User::factory(),
        ];
    }
}
