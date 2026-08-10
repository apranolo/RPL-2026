# Issue #144 Implementation Plan: SystemLog Entity & Multi-Tenancy Alignment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyelaraskan entitas `SystemLog`, migrasi database, model `User`, dan `ProposalObserver` dengan kebutuhan Multi-Tenancy Isolation (`university_id`) dan spesifikasi frontend Inertia/React (`ActivityLogItem` dengan `actor_name`).

**Architecture:** Menambahkan kolom foreign key `university_id` dan indeks pada `system_logs` migrasi. Menambahkan atribut virtual `$appends = ['actor_name']`, accessor `getActorNameAttribute()`, dan relasi `university()` pada model `SystemLog`. Menambahkan relasi `systemLogs()` pada `User`, serta mengupdate `ProposalObserver` untuk menangkap `university_id`.

**Tech Stack:** PHP 8.2, Laravel 12.x, Eloquent ORM, MySQL 8.0, PHPUnit.

---

### Task 1: Update Migration `system_logs` Table

**Files:**
- Modify: `database/migrations/2026_05_14_000000_create_system_logs_table.php`

- [ ] **Step 1: Update migration file content**

Modify [`database/migrations/2026_05_14_000000_create_system_logs_table.php`](file:///c:/xampp/htdocs/RPL-2026/database/migrations/2026_05_14_000000_create_system_logs_table.php) to add `university_id` foreign key and index:

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
        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('university_id')->nullable()->constrained('universities')->nullOnDelete();
            $table->nullableMorphs('loggable');
            $table->string('action'); // e.g. 'created', 'updated', 'deleted'
            $table->text('description')->nullable();
            $table->json('changes')->nullable(); // to store old/new values
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->index('university_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_logs');
    }
};
```

- [ ] **Step 2: Verify syntax check**

Run: `php -l database/migrations/2026_05_14_000000_create_system_logs_table.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit migration change**

```bash
git add database/migrations/2026_05_14_000000_create_system_logs_table.php
git commit -m "refactor(database): tambah university_id dan indeks pada migrasi system_logs"
```

---

### Task 2: Update Model `SystemLog`

**Files:**
- Modify: `app/Models/SystemLog.php`

- [ ] **Step 1: Update `SystemLog.php` model**

Modify [`app/Models/SystemLog.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/SystemLog.php) to include `'university_id'` in `$fillable`, `$appends = ['actor_name']`, `getActorNameAttribute()`, and `university()` relationship:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class SystemLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'university_id',
        'loggable_type',
        'loggable_id',
        'action',
        'description',
        'changes',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'changes' => 'array',
    ];

    protected $appends = ['actor_name'];

    /**
     * Get the flat actor_name for frontend ActivityLogItem compatibility.
     */
    public function getActorNameAttribute(): string
    {
        return $this->user ? $this->user->name : 'System';
    }

    /**
     * Get the user that triggered the log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the university context of the log.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    /**
     * Get the parent loggable model.
     */
    public function loggable(): MorphTo
    {
        return $this->morphTo();
    }
}
```

- [ ] **Step 2: Verify syntax check**

Run: `php -l app/Models/SystemLog.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit Model changes**

```bash
git add app/Models/SystemLog.php
git commit -m "feat(model): selaraskan SystemLog dengan university_id dan accessor actor_name"
```

---

### Task 3: Update Model `User` Inverse Relation

**Files:**
- Modify: `app/Models/User.php`

- [ ] **Step 1: Add `systemLogs()` relation to `User.php`**

Modify [`app/Models/User.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/User.php) to include the `systemLogs(): HasMany` relationship:

```php
    /**
     * Get all system logs triggered by this user.
     */
    public function systemLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(SystemLog::class);
    }
```

- [ ] **Step 2: Verify syntax check**

Run: `php -l app/Models/User.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit User Model changes**

```bash
git add app/Models/User.php
git commit -m "feat(model): tambah relasi inverse systemLogs pada model User"
```

---

### Task 4: Update `ProposalObserver` Activity Logger

**Files:**
- Modify: `app/Observers/ProposalObserver.php`

- [ ] **Step 1: Update `ProposalObserver.php` logActivity method**

Modify [`app/Observers/ProposalObserver.php`](file:///c:/xampp/htdocs/RPL-2026/app/Observers/ProposalObserver.php) to capture `university_id`:

```php
<?php

namespace App\Observers;

use App\Models\SystemLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ProposalObserver
{
    /**
     * Handle the "created" event.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     */
    public function created($model): void
    {
        $this->logActivity('created', $model);
    }

    /**
     * Handle the "updated" event.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     */
    public function updated($model): void
    {
        $this->logActivity('updated', $model);
    }

    /**
     * Handle the "deleted" event.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     */
    public function deleted($model): void
    {
        $this->logActivity('deleted', $model);
    }

    /**
     * Record the activity to system_logs.
     *
     * @param  \Illuminate\Database\Eloquent\Model  $model
     */
    protected function logActivity(string $action, $model): void
    {
        SystemLog::create([
            'user_id' => Auth::id(),
            'university_id' => Auth::user()?->university_id ?? $model->university_id ?? null,
            'loggable_type' => get_class($model),
            'loggable_id' => $model->id,
            'action' => $action,
            'description' => class_basename($model)." has been {$action}.",
            'changes' => $action === 'updated' ? $model->getChanges() : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
```

- [ ] **Step 2: Verify syntax check**

Run: `php -l app/Observers/ProposalObserver.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit ProposalObserver changes**

```bash
git add app/Observers/ProposalObserver.php
git commit -m "feat(observer): tangkap university_id secara otomatis pada ProposalObserver"
```

---

### Task 5: Write Unit Test & Execute Database Refresh Verification

**Files:**
- Create: `tests/Unit/SystemLogTest.php`

- [ ] **Step 1: Write Unit Test `tests/Unit/SystemLogTest.php`**

Create [`tests/Unit/SystemLogTest.php`](file:///c:/xampp/htdocs/RPL-2026/tests/Unit/SystemLogTest.php) with tests for `university_id`, `actor_name` accessor, and user relation:

```php
<?php

namespace Tests\Unit;

use App\Models\Role;
use App\Models\SystemLog;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SystemLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_system_log_appends_actor_name_correctly(): void
    {
        $university = University::create([
            'name' => 'Universitas Ahmad Dahlan',
            'code' => 'UAD',
            'city' => 'Yogyakarta',
            'is_active' => true,
        ]);

        $role = Role::create([
            'name' => Role::USER,
            'display_name' => 'User',
        ]);

        $user = User::create([
            'name' => 'Dr. Andi Prasetyo',
            'email' => 'andi@uad.ac.id',
            'password' => bcrypt('password'),
            'role_id' => $role->id,
            'university_id' => $university->id,
        ]);

        $log = SystemLog::create([
            'user_id' => $user->id,
            'university_id' => $university->id,
            'action' => 'created',
            'description' => 'Proposal created.',
        ]);

        $this->assertEquals('Dr. Andi Prasetyo', $log->actor_name);
        $this->assertEquals($university->id, $log->university_id);
        $this->assertEquals($user->id, $log->user->id);
        $this->assertTrue($user->systemLogs->contains($log));
        $this->assertArrayHasKey('actor_name', $log->toArray());
    }

    public function test_system_log_actor_name_defaults_to_system_when_no_user(): void
    {
        $log = SystemLog::create([
            'action' => 'system_cleanup',
            'description' => 'Automated cleanup.',
        ]);

        $this->assertEquals('System', $log->actor_name);
    }
}
```

- [ ] **Step 2: Run Unit Test inside Docker Container**

Run: `docker exec rpl2026-app php artisan test --filter=SystemLogTest`  
Expected: `PASSES` (2 tests, 5 assertions)

- [ ] **Step 3: Run Database Refresh and Seeder inside Container**

Run: `docker exec rpl2026-app php artisan migrate:fresh --seed --force`  
Expected: `Database seeding completed successfully!`

- [ ] **Step 4: Commit Unit Test**

```bash
git add tests/Unit/SystemLogTest.php
git commit -m "test(unit): tambah pengujian unit untuk SystemLog dan atribut actor_name"
```
