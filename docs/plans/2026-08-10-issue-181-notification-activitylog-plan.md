# Issue #181 Implementation Plan: Notification & ActivityLog Entities (Modul 7)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memuat entitas data `Notification.php`, `ActivityLog.php`, migrasi `activity_logs`, dan relasi `activityLogs()` pada `User.php` untuk mendukung modul 7.

**Architecture:** Model `Notification` diturunkan dari `DatabaseNotification` dengan virtual accessors (`id_user`, `title`, `message`, `url`). Model `ActivityLog` diturunkan dari Eloquent `Model` dengan virtual accessors (`id_submission`, `id_user`, `user_name`, `action_type`, `activity_description`) dan relasi `user()` & `submission()`. Migrasi `activity_logs` menambahkan tabel pendukung log aktivitas.

**Tech Stack:** PHP 8.2, Laravel 12.x, Eloquent ORM, MySQL 8.0, Pest / PHPUnit.

---

### Task 1: Create Migration `activity_logs` Table

**Files:**
- Create: `database/migrations/2026_07_11_133000_create_activity_logs_table.php`

- [ ] **Step 1: Write migration file**

Create [`database/migrations/2026_07_11_133000_create_activity_logs_table.php`](file:///c:/xampp/htdocs/RPL-2026/database/migrations/2026_07_11_133000_create_activity_logs_table.php):

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

- [ ] **Step 2: Syntax check**

Run: `php -l database/migrations/2026_07_11_133000_create_activity_logs_table.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit migration**

```bash
git add database/migrations/2026_07_11_133000_create_activity_logs_table.php
git commit -m "feat(database): tambah migrasi tabel activity_logs untuk modul 7"
```

---

### Task 2: Create Model `Notification`

**Files:**
- Create: `app/Models/Notification.php`

- [ ] **Step 1: Write Model `Notification.php`**

Create [`app/Models/Notification.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/Notification.php):

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

- [ ] **Step 2: Syntax check**

Run: `php -l app/Models/Notification.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit Notification Model**

```bash
git add app/Models/Notification.php
git commit -m "feat(model): buat model Notification yang diturunkan dari DatabaseNotification"
```

---

### Task 3: Create Model `ActivityLog`

**Files:**
- Create: `app/Models/ActivityLog.php`

- [ ] **Step 1: Write Model `ActivityLog.php`**

Create [`app/Models/ActivityLog.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/ActivityLog.php):

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

- [ ] **Step 2: Syntax check**

Run: `php -l app/Models/ActivityLog.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit ActivityLog Model**

```bash
git add app/Models/ActivityLog.php
git commit -m "feat(model): buat model ActivityLog dengan relasi dan virtual accessors"
```

---

### Task 4: Update Model `User` Inverse Relation `activityLogs()`

**Files:**
- Modify: `app/Models/User.php`

- [ ] **Step 1: Add `activityLogs()` method to `User.php`**

Modify [`app/Models/User.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/User.php) to add `activityLogs(): HasMany`:

```php
    /**
     * Get all activity logs for this user.
     */
    public function activityLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
```

- [ ] **Step 2: Syntax check**

Run: `php -l app/Models/User.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit User Model changes**

```bash
git add app/Models/User.php
git commit -m "feat(model): tambah relasi activityLogs pada model User"
```

---

### Task 5: Write Unit Test & Run Verification in Docker Container

**Files:**
- Create: `tests/Unit/NotificationAndActivityLogTest.php`

- [ ] **Step 1: Create `tests/Unit/NotificationAndActivityLogTest.php`**

Create [`tests/Unit/NotificationAndActivityLogTest.php`](file:///c:/xampp/htdocs/RPL-2026/tests/Unit/NotificationAndActivityLogTest.php):

```php
<?php

namespace Tests\Unit;

use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationAndActivityLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_activity_log_appends_and_relations(): void
    {
        $role = Role::create([
            'name' => Role::USER,
            'display_name' => 'User',
        ]);

        $user = User::create([
            'name' => 'Ryan Ananda',
            'email' => 'ryan@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        $log = ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'created_discussion',
            'description' => 'User started a discussion.',
        ]);

        $this->assertEquals($user->id, $log->id_user);
        $this->assertEquals('Ryan Ananda', $log->user_name);
        $this->assertEquals('created_discussion', $log->action_type);
        $this->assertEquals('User started a discussion.', $log->activity_description);
        $this->assertEquals($user->id, $log->user->id);
        $this->assertTrue($user->activityLogs->contains($log));
        $this->assertArrayHasKey('user_name', $log->toArray());
    }

    public function test_notification_appends_and_accessors(): void
    {
        $role = Role::create([
            'name' => Role::USER,
            'display_name' => 'User',
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
        ]);

        $notification = Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'App\Notifications\DiscussionNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => [
                'title' => 'Pesan Baru',
                'message' => 'Anda menerima pesan baru.',
                'url' => '/dashboard',
            ],
        ]);

        $this->assertEquals($user->id, $notification->id_user);
        $this->assertEquals('Pesan Baru', $notification->title);
        $this->assertEquals('Anda menerima pesan baru.', $notification->message);
        $this->assertEquals('/dashboard', $notification->url);
        $this->assertArrayHasKey('title', $notification->toArray());
    }
}
```

- [ ] **Step 2: Run Unit Test inside Docker container**

Run: `docker exec rpl2026-app ./vendor/bin/pest tests/Unit/NotificationAndActivityLogTest.php`  
Expected: `PASSES` (2 tests)

- [ ] **Step 3: Run Database Refresh inside Docker container**

Run: `docker exec rpl2026-app php artisan migrate --force`  
Expected: `Migrating: 2026_07_11_133000_create_activity_logs_table` -> `Migrated`

- [ ] **Step 4: Commit Unit Test**

```bash
git add tests/Unit/NotificationAndActivityLogTest.php
git commit -m "test(unit): tambah pengujian unit untuk Notification dan ActivityLog"
```
