<?php

namespace App\Models;

use Illuminate\Notifications\DatabaseNotification;

class Notification extends DatabaseNotification
{
    /**
     * Virtual attributes appended to array/JSON representation.
     */
    protected $appends = [
        'id_user',
        'title',
        'message',
        'url',
    ];

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getIdUserAttribute(): ?int
    {
        return is_numeric($this->notifiable_id) ? (int) $this->notifiable_id : null;
    }

    public function getTitleAttribute(): ?string
    {
        return $this->data['title'] ?? 'Notifikasi Baru';
    }

    public function getMessageAttribute(): ?string
    {
        return $this->data['message'] ?? '';
    }

    public function getUrlAttribute(): ?string
    {
        return $this->data['url'] ?? null;
    }
}
