<?php

namespace Database\Factories;

use App\Models\Announcement;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence();

        return [
            'university_id' => University::factory(),
            'journal_id' => null,
            'user_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title),
            'content' => fake()->paragraphs(3, true),
            'description' => fake()->sentence(),
            'thumbnail' => null,
            'published_at' => now(),
            'expires_at' => now()->addDays(30),
            'is_active' => true,
            'is_featured' => false,
        ];
    }
}
