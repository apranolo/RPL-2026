<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReviewerNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public array $data
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
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->data['title'] ?? 'Notifikasi Reviewer',
            'message' => $this->data['message'] ?? '',
            'action_url' => $this->data['action_url'] ?? null,
            'type' => $this->data['type'] ?? 'reviewer_general',
            'source_id' => $this->data['source_id'] ?? null,
            'source_type' => $this->data['source_type'] ?? null,
        ];
    }
}
