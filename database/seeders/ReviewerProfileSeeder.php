<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ReviewerProfile;


class ReviewerProfileSeeder extends Seeder
{
     public function run(): void
    {
        $user = User::first();

        if (!$user) {
            return;
        }

        ReviewerProfile::updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'research_interests' => [
                    'Laravel',
                    'React',
                    'Machine Learning',
                ],
                'total_reviews' => 10,
                'completed_reviews' => 8,
                'biography' => 'Experienced reviewer in software engineering and information systems.',
            ]
        );
    }

}
