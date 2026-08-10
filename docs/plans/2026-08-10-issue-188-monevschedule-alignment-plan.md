# Issue #188 Implementation Plan: MonevSchedule Entity Alignment (Modul 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyempurnakan entitas `MonevSchedule.php`, menambahkan relasi `monevSchedules()` pada `Contract.php` dan `User.php`, menambahkan helper methods, dan menulis unit test pendukung.

**Architecture:** Model `MonevSchedule` terhubung ke `Contract` (`contract_id`) dan `User` (`evaluator_id`). Relasi balik dua arah ditambahkan pada `Contract` (`hasMany`) dan `User` (`hasMany`). Helper methods `isScheduled()`, `isDone()`, `isCancelled()`, `getStatusLabelAttribute()`, dan `scopeForEvaluator()` ditambahkan pada `MonevSchedule`.

**Tech Stack:** PHP 8.2, Laravel 12.x, Eloquent ORM, MySQL 8.0, Pest / PHPUnit.

---

### Task 1: Update Model `MonevSchedule.php`

**Files:**
- Modify: `app/Models/MonevSchedule.php`

- [ ] **Step 1: Update `MonevSchedule.php`**

Modify [`app/Models/MonevSchedule.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/MonevSchedule.php):

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonevSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'evaluator_id',
        'date',
        'time',
        'location',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the contract associated with the schedule.
     */
    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class, 'contract_id');
    }

    /**
     * Get the evaluator associated with the schedule.
     */
    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    /**
     * Scope to filter schedules by evaluator.
     */
    public function scopeForEvaluator($query, int $evaluatorId)
    {
        return $query->where('evaluator_id', $evaluatorId);
    }

    /**
     * Check if status is scheduled.
     */
    public function isScheduled(): bool
    {
        return $this->status === 'scheduled';
    }

    /**
     * Check if status is done.
     */
    public function isDone(): bool
    {
        return $this->status === 'done';
    }

    /**
     * Check if status is cancelled.
     */
    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get human-readable status label.
     */
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'scheduled' => 'Terjadwal',
            'done' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            default => (string) $this->status,
        };
    }
}
```

- [ ] **Step 2: Syntax check**

Run: `php -l app/Models/MonevSchedule.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit MonevSchedule changes**

```bash
git add app/Models/MonevSchedule.php
git commit -m "feat(model): tambah return type, helper methods, dan accessors pada MonevSchedule"
```

---

### Task 2: Update Model `Contract.php` Inverse Relation

**Files:**
- Modify: `app/Models/Contract.php`

- [ ] **Step 1: Add `monevSchedules()` to `Contract.php`**

Modify [`app/Models/Contract.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/Contract.php) to add `monevSchedules(): HasMany`:

```php
    /**
     * Get all monev schedules for this contract.
     */
    public function monevSchedules(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MonevSchedule::class, 'contract_id');
    }
```

- [ ] **Step 2: Syntax check**

Run: `php -l app/Models/Contract.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit Contract Model changes**

```bash
git add app/Models/Contract.php
git commit -m "feat(model): tambah relasi inverse monevSchedules pada model Contract"
```

---

### Task 3: Update Model `User.php` Inverse Relation

**Files:**
- Modify: `app/Models/User.php`

- [ ] **Step 1: Add `monevSchedules()` to `User.php`**

Modify [`app/Models/User.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/User.php) to add `monevSchedules(): HasMany`:

```php
    /**
     * Get all monev schedules assigned to this user as evaluator.
     */
    public function monevSchedules(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MonevSchedule::class, 'evaluator_id');
    }
```

- [ ] **Step 2: Syntax check**

Run: `php -l app/Models/User.php`  
Expected: `No syntax errors detected`

- [ ] **Step 3: Commit User Model changes**

```bash
git add app/Models/User.php
git commit -m "feat(model): tambah relasi inverse monevSchedules pada model User"
```

---

### Task 4: Write Unit Test & Run Verification in Docker Container

**Files:**
- Create: `tests/Unit/MonevScheduleTest.php`

- [ ] **Step 1: Create `tests/Unit/MonevScheduleTest.php`**

Create [`tests/Unit/MonevScheduleTest.php`](file:///c:/xampp/htdocs/RPL-2026/tests/Unit/MonevScheduleTest.php):

```php
<?php

namespace Tests\Unit;

use App\Models\Contract;
use App\Models\MonevSchedule;
use App\Models\Proposal;
use App\Models\ResearchSchema;
use App\Models\Role;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MonevScheduleTest extends TestCase
{
    use RefreshDatabase;

    public function test_monev_schedule_creation_and_relations(): void
    {
        $university = University::create([
            'name' => 'Universitas Ahmad Dahlan',
            'code' => 'UAD',
            'city' => 'Yogyakarta',
            'is_active' => true,
        ]);

        $userRole = Role::create([
            'name' => Role::USER,
            'display_name' => 'User',
        ]);

        $evaluator = User::create([
            'name' => 'Prof. Dr. Budi',
            'email' => 'evaluator@uad.ac.id',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $university->id,
        ]);

        $dosen = User::create([
            'name' => 'Dr. Andi',
            'email' => 'dosen@uad.ac.id',
            'password' => bcrypt('password'),
            'role_id' => $userRole->id,
            'university_id' => $university->id,
        ]);

        $schema = ResearchSchema::create([
            'name' => 'Riset Dasar',
            'description' => 'Deskripsi',
        ]);

        $proposal = Proposal::create([
            'title' => 'Penelitian IoT',
            'user_id' => $dosen->id,
            'research_schema_id' => $schema->id,
            'status_proposal' => 'Diterima',
        ]);

        $contract = Contract::create([
            'contract_number' => 'KON-2026-999',
            'title' => 'Kontrak Hibah Riset',
            'proposal_id' => $proposal->id,
            'university_id' => $university->id,
            'contract_value' => 100000000,
            'status' => 'active',
            'party_1' => 'LPPM',
            'party_2' => 'Dr. Andi',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
        ]);

        $schedule = MonevSchedule::create([
            'contract_id' => $contract->id,
            'evaluator_id' => $evaluator->id,
            'date' => '2026-06-15',
            'time' => '09:00:00',
            'location' => 'Ruang Rapat LPPM',
            'status' => 'scheduled',
        ]);

        $this->assertEquals($contract->id, $schedule->contract->id);
        $this->assertEquals($evaluator->id, $schedule->evaluator->id);
        $this->assertTrue($schedule->isScheduled());
        $this->assertFalse($schedule->isDone());
        $this->assertEquals('Terjadwal', $schedule->status_label);
        $this->assertTrue($contract->monevSchedules->contains($schedule));
        $this->assertTrue($evaluator->monevSchedules->contains($schedule));
    }
}
```

- [ ] **Step 2: Run Unit Test inside Docker container**

Run: `docker exec rpl2026-app ./vendor/bin/pest tests/Unit/MonevScheduleTest.php`  
Expected: `PASSES` (1 test)

- [ ] **Step 3: Run Database Migration inside Docker container**

Run: `docker exec rpl2026-app php artisan migrate --force`  
Expected: `Nothing to migrate` or migration status clean

- [ ] **Step 4: Commit Unit Test**

```bash
git add tests/Unit/MonevScheduleTest.php
git commit -m "test(unit): tambah pengujian unit untuk entitas MonevSchedule"
```
