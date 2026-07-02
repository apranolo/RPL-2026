<?php

namespace App\Services;

use App\Models\EmailTemplate;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Exception;

class EmailNotificationService
{
    /**
     * Mengirim email otomatis berdasarkan event tertentu.
     */
    public function send(string $event, string $recipientEmail, array $placeholders): bool
    {
        try {
            $template = EmailTemplate::where('event', $event)
                ->orWhere('slug', $event)
                ->first();

            if (!$template) {
                Log::warning("Template untuk event [{$event}] belum terdaftar.");
                return false;
            }

            $subject = $template->subject;
            $body = $template->body;

            foreach ($placeholders as $key => $value) {
                $subject = str_replace('{' . $key . '}', $value, $subject);
                $body = str_replace('{' . $key . '}', $value, $body);
            }

            Mail::html($body, function ($message) use ($recipientEmail, $subject) {
                $message->to($recipientEmail)->subject($subject);
            });

            Log::info("Email otomatis [{$event}] sukses terkirim ke: {$recipientEmail}");
            return true;

        } catch (Exception $e) {
            Log::error("Gagal mengirim email [{$event}]: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Method update untuk menyimpan perubahan template.
     */
    public function update(int $templateId, array $updatedData): bool
    {
        try {
            $template = EmailTemplate::findOrFail($templateId);
            $template->update($updatedData);
            return true;
        } catch (Exception $e) {
            Log::error("Gagal melakukan update pada EmailTemplate ID {$templateId}: " . $e->getMessage());
            return false;
        }
    }
}