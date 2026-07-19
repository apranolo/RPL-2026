<?php

namespace Database\Factories;

use App\Models\Journal;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    public function definition(): array
    {
        return [
            'journal_id' => Journal::factory(),
            'author_id' => User::factory(),
            'title' => $this->faker->sentence(),
            'abstract' => $this->faker->paragraph(),
            'keywords' => implode(', ', $this->faker->words(4)),
            'status' => 'submitted',
            'file_path' => null,
            'author_notes' => null,
        ];
    }
}
