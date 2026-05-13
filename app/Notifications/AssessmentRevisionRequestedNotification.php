<?php

namespace App\Notifications;

use App\Models\JournalAssessment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssessmentRevisionRequestedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public JournalAssessment $assessment,
        public string $adminNotes
    ) {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Assessment Revision Requested - '.$this->assessment->journal->title)
            ->markdown('emails.assessment-revision-requested', [
                'assessment' => $this->assessment,
                'adminNotes' => $this->adminNotes,
                'url' => route('user.assessments.edit', $this->assessment->id),
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'assessment_id' => $this->assessment->id,
            'journal_title' => $this->assessment->journal->title,
            'admin_notes' => $this->adminNotes,
            'message' => 'The administrator has requested revisions for your assessment.',
            'action_url' => route('user.assessments.edit', $this->assessment->id),
        ];
    }
}
