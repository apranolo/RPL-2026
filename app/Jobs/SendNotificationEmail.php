<?php

namespace App\Jobs;

use App\Services\EmailNotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendNotificationEmail implements ShouldQueue
{
    use Queueable;

    protected array $emailData;

    /**
     * Create a new job instance.
     */
    public function __construct(array $emailData)
    {
        $this->emailData = $emailData;
    }

    /**
     * Execute the job.
     */
    public function handle(EmailNotificationService $service): void
    {
        $service->send($this->emailData);
    }
}
