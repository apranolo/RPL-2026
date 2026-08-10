# Design Specification: Issue #188 — Pembuatan Entitas Data MonevSchedule (Modul 4)

**Date**: 2026-08-10  
**Target Issue**: #188  
**Author**: AI Assistant & kyASse  
**Status**: Approved Design

---

## 1. Overview & Objectives

Tujuan dari perbaikan ini adalah menyempurnakan entitas data **MonevSchedule** (`MonevSchedule.php`), menambahkan helper methods & accessors, mendefinisikan relasi dua arah (*inverse relations*) pada model `Contract.php` dan `User.php`, serta membuat unit test pendukung untuk memastikan Modul 4 (Laporan Kemajuan & Monev) siap diintegrasikan.

---

## 2. Requirements & Standards Alignment

1. **Skema Tabel `monev_schedules`**:
   - Berkas migrasi [`database/migrations/2026_05_10_000000_create_monev_schedules_table.php`](file:///c:/xampp/htdocs/RPL-2026/database/migrations/2026_05_10_000000_create_monev_schedules_table.php).
   - Kolom: `id`, `contract_id` (foreignKey `contracts`, nullable, `nullOnDelete`), `evaluator_id` (foreignKey `users`, `cascadeOnDelete`), `date`, `time`, `location`, `status` (enum: `scheduled`, `done`, `cancelled`), `timestamps()`.
2. **Model `MonevSchedule`**:
   - Berkas [`app/Models/MonevSchedule.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/MonevSchedule.php).
   - Relasi: `contract(): BelongsTo` dan `evaluator(): BelongsTo`.
   - Helper methods & accessors: `isScheduled()`, `isDone()`, `isCancelled()`, `getStatusLabelAttribute()`, `scopeForEvaluator()`.
3. **Inverse Relations**:
   - Model [`app/Models/Contract.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/Contract.php): `monevSchedules(): HasMany`.
   - Model [`app/Models/User.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/User.php): `monevSchedules(): HasMany` (sebagai evaluator).

---

## 3. Detailed Component Specifications

### 3.1 Model MonevSchedule
**File**: [`app/Models/MonevSchedule.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/MonevSchedule.php)

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
            default => $this->status,
        };
    }
}
```

### 3.2 Contract Model Inverse Relation
**File**: [`app/Models/Contract.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/Contract.php)

```php
/**
 * Get all monev schedules for this contract.
 */
public function monevSchedules(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(MonevSchedule::class, 'contract_id');
}
```

### 3.3 User Model Inverse Relation
**File**: [`app/Models/User.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/User.php)

```php
/**
 * Get all monev schedules assigned to this user as evaluator.
 */
public function monevSchedules(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(MonevSchedule::class, 'evaluator_id');
}
```

---

## 4. Verification & Testing Plan

1. **Syntax Check & Migration Execution**:
   - Memastikan `php -l` pada seluruh berkas yang dibuat/diubah.
   - Menjalankan `docker exec rpl2026-app php artisan migrate --force` untuk memastikan migrasi `monev_schedules` berjalan tanpa kendala.
2. **Automated Unit Testing**:
   - Membuat pengujian unit `tests/Unit/MonevScheduleTest.php` untuk memvalidasi pembuatan jadwal monev, relasi `contract()`, `evaluator()`, `Contract::monevSchedules()`, `User::monevSchedules()`, serta helper methods (`isScheduled`, `getStatusLabelAttribute`).
