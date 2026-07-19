<?php

namespace Database\Factories;

use App\Models\RevisionRound;
use App\Models\Submission;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RevisionRound>
 */
class RevisionRoundFactory extends Factory
{
    protected $model = RevisionRound::class;

    public function definition(): array
    {
        return [
            'id_submission' => Submission::factory(),
            'round_number' => 1,
            'due_date' => now()->addDays(14),
            'editor_decision_note' => null,
            'status' => 'Submitted',
        ];
    }
}
