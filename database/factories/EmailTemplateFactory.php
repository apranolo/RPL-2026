<?php

namespace Database\Factories;

use App\Models\EmailTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmailTemplate>
 */
class EmailTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'event_trigger' => $this->faker->randomElement(['submission_created', 'submission_approved', 'submission_rejected']),
            'subject' => $this->faker->sentence(),
            'body' => 'Dear {{author_name}}, your submission {{submission_title}} has been updated.',
            'variables' => ['author_name', 'submission_title'],
            'description' => $this->faker->sentence(),
            'is_active' => true,
        ];
    }
}
