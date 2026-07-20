<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use Illuminate\Database\Seeder;

class EmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Submission Submitted Notification',
                'event_trigger' => 'submission_submitted',
                'subject' => 'Submission Received: {{submission_title}}',
                'body' => "Dear {{author_name}},\n\nThank you for submitting your manuscript, \"{{submission_title}}\" to our journal.\n\nYour submission is now under review. You can track the status of your submission in the dashboard.\n\nBest regards,\nEditorial Office",
                'variables' => ['author_name', 'submission_title'],
                'description' => 'Email sent to authors after successful submission.',
                'is_active' => true,
            ],
            [
                'name' => 'Reviewer Assigned Notification',
                'event_trigger' => 'reviewer_assigned',
                'subject' => 'Invitation to Review: {{submission_title}}',
                'body' => "Dear {{reviewer_name}},\n\nYou have been assigned to review the manuscript titled \"{{submission_title}}\".\n\nPlease log in to the portal to view the details and submit your evaluation.\n\nThank you,\nEditorial Board",
                'variables' => ['reviewer_name', 'submission_title'],
                'description' => 'Email sent to reviewers when they are assigned a paper.',
                'is_active' => true,
            ],
            [
                'name' => 'Review Submitted Notification',
                'event_trigger' => 'review_submitted',
                'subject' => 'Review Submitted: {{submission_title}}',
                'body' => "Dear Editor,\n\nA review has been submitted for the manuscript \"{{submission_title}}\" by {{reviewer_name}}.\n\nPlease log in to review the decision and proceed with the workflow.\n\nBest regards,\nSystem Notification",
                'variables' => ['submission_title', 'reviewer_name'],
                'description' => 'Email sent to editors when a reviewer submits their review.',
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::create($template);
        }
    }
}
