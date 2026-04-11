<?php

namespace Database\Factories;

use App\Models\Agenda;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Agenda>
 */
class AgendaFactory extends Factory
{
    protected $model = Agenda::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'university_id' => University::factory(),
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(4),
            'slug' => $this->faker->unique()->slug(),
            'type' => $this->faker->randomElement(['Seminar', 'Workshop', 'Conference', 'Training']),
            'description' => $this->faker->paragraphs(3, true),
            'thumbnail' => null,
            'date_start' => now()->addDays(rand(1, 30))->format('Y-m-d'),
            'date_end' => now()->addDays(rand(31, 35))->format('Y-m-d'),
            'time_start' => '09:00',
            'time_end' => '15:00',
            'location_type' => $this->faker->randomElement(['Online', 'Offline', 'Hybrid']),
            'location_venue' => $this->faker->company(),
            'location_link' => 'https://zoom.us/j/' . $this->faker->randomNumber(9),
            'registration_link' => $this->faker->url(),
            'price' => $this->faker->randomElement([0, 50000, 150000]),
            'contact_person_name' => $this->faker->name(),
            'contact_person_phone' => $this->faker->phoneNumber(),
            'contact_person_email' => $this->faker->safeEmail(),
            'is_active' => true,
            'is_featured' => false,
        ];
    }
}
