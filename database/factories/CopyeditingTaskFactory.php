<?php

namespace Database\Factories;

use App\Models\CopyeditingTask;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CopyeditingTaskFactory extends Factory
{
    protected $model = CopyeditingTask::class;

    public function definition(): array
    {
        return [
            'id_submission' => Submission::factory(),
            'id_copyeditor' => User::factory(),
            'status' => 'Assigned',
            'assigned_at' => now(),
            'completed_at' => null,
            'editor_note' => null,
            'copyeditor_note' => null,
            'original_file_path' => null,
            'original_file_name' => null,
            'copyedited_file_path' => null,
            'copyedited_file_name' => null,
            'author_approval_notes' => null,
            'author_approved_at' => null,
        ];
    }
}
