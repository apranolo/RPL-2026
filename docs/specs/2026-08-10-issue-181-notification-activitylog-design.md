# Design Specification: Issue #181 — Pembuatan Entitas Data Notification & ActivityLog (Modul 7)

**Date**: 2026-08-10  
**Target Issue**: #181  
**Author**: AI Assistant & kyASse  
**Status**: Approved Design

---

## 1. Overview & Objectives

Tujuan dari perbaikan ini adalah menyediakan entitas data **Notification** (`Notification.php`) dan **ActivityLog** (`ActivityLog.php`) beserta migrasi tabel `activity_logs` dan relasi pada model `User.php`. Entitas data ini sangat mendesak (*urgent*) untuk mendukung pengerjaan controller, service, dan antarmuka visual Modul 7 (Notifikasi, Komunikasi & Diskusi Internal).

---

## 2. Requirements & Standards Alignment

1. **Model `Notification`**:
   - Turunan dari `Illuminate\Notifications\DatabaseNotification`.
   - Menggunakan tabel dasar `notifications` (migrasi [`2026_02_03_002813_create_notifications_table.php`](file:///c:/xampp/htdocs/RPL-2026/database/migrations/2026_02_03_002813_create_notifications_table.php) sudah ada).
   - Menyiapkan Virtual Accessor `$appends = ['id_user', 'title', 'message', 'url']`.
2. **Model `ActivityLog`**:
   - Model Eloquent standar.
   - `$fillable = ['submission_id', 'user_id', 'action', 'description']`.
   - Virtual Accessor `$appends = ['id_submission', 'id_user', 'user_name', 'action_type', 'activity_description']`.
   - Relasi `user(): BelongsTo` dan `submission(): BelongsTo`.
3. **Database Migration `activity_logs`**:
   - Berkas migrasi `database/migrations/2026_07_11_133000_create_activity_logs_table.php`.
   - Tabel `activity_logs` berisi kolom `id`, `submission_id` (nullable, index), `user_id` (constrained `users`, cascadeOnDelete), `action` (string), `description` (text, nullable), `timestamps()`.
4. **User Model Inverse Relation**:
   - Menambahkan relasi `activityLogs(): HasMany` di model [`User.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/User.php).

---

## 3. Detailed Component Specifications

### 3.1 Model Notification
**File**: [`app/Models/Notification.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/Notification.php)

```php
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
```

### 3.2 Model ActivityLog
**File**: [`app/Models/ActivityLog.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/ActivityLog.php)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'user_id',
        'action',
        'description',
    ];

    /**
     * Virtual attributes appended to array/JSON representation.
     */
    protected $appends = [
        'id_submission',
        'id_user',
        'user_name',
        'action_type',
        'activity_description',
    ];

    /**
     * Relasi ke User yang melakukan aktivitas
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi ke Submission (jika ada)
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getIdSubmissionAttribute(): ?int
    {
        return $this->submission_id;
    }

    public function getIdUserAttribute(): ?int
    {
        return $this->user_id;
    }

    public function getUserNameAttribute(): string
    {
        return $this->user?->name ?? 'System';
    }

    public function getActionTypeAttribute(): string
    {
        return $this->action;
    }

    public function getActivityDescriptionAttribute(): ?string
    {
        return $this->description;
    }
}
```

### 3.3 Database Migration `activity_logs`
**File**: [`database/migrations/2026_07_11_133000_create_activity_logs_table.php`](file:///c:/xampp/htdocs/RPL-2026/database/migrations/2026_07_11_133000_create_activity_logs_table.php)

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->nullable()->index();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
```

### 3.4 User Model Inverse Relation
**File**: [`app/Models/User.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/User.php)

Menambahkan relasi:
```php
/**
 * Get all activity logs for this user.
 */
public function activityLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(ActivityLog::class);
}
```

---

## 4. Verification & Testing Plan

1. **Syntax Check & Migration Execution**:
   - Memastikan `php -l` pada seluruh berkas yang dibuat/diubah.
   - Menjalankan `docker exec rpl2026-app php artisan migrate --force` untuk memastikan migrasi `activity_logs` berjalan tanpa error.
2. **Automated Unit Testing**:
   - Membuat pengujian unit `tests/Unit/NotificationAndActivityLogTest.php` untuk memvalidasi atribut virtual, relasi `user()`, `submission()`, `activityLogs()`, dan instansiasi `Notification`.
