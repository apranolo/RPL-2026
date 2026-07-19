<?php

namespace Database\Factories;

use App\Models\Pembinaan;
use App\Models\Journal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PembinaanRegistrationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'pembinaan_id' => Pembinaan::factory(),
            'journal_id' => Journal::factory(),
            'user_id' => User::factory(),
            'status' => 'pending',
            'registered_at' => now(),
        ];
    }
}
