# Design Specification: Issue #144 — Penyelarasan Entitas Data SystemLog dengan Spesifikasi Frontend dan Multi-Tenancy

**Date**: 2026-08-10  
**Target Issue**: #144  
**Author**: AI Assistant & kyASse  
**Status**: Approved Design

---

## 1. Overview & Objectives

Tujuan dari perbaikan ini adalah menyelaraskan struktur model Eloquent `SystemLog`, migrasi database `system_logs`, relasi model `User`, serta logika pencatatan di `ProposalObserver` dengan kebutuhan **Multi-Tenancy Isolation** (`university_id`) dan spesifikasi data **Frontend Inertia/React** (`ActivityLogItem` dengan atribut `actor_name`).

---

## 2. Requirements & Standards Alignment

1. **Multi-Tenancy**:
   - `system_logs` wajib menyimpan `university_id` untuk penyaringan log per universitas/kampus.
   - Indeks `university_id` harus ditambahkan untuk optimasi kueri filter.
2. **Frontend Type Alignment (`ActivityLogItem`)**:
   - Interface `ActivityLogItem` di [`kelas_b_modul_6_dashboard_reporting.md`](file:///c:/xampp/htdocs/RPL-2026/docs/guidence%20rpl%202026/specs/kelas_b_modul_6_dashboard_reporting.md) membutuhkan properti datar `actor_name` (string).
   - Menggunakan Eloquent Accessor Virtual (`$appends = ['actor_name']` dan `getActorNameAttribute()`) sesuai **Aturan Proyek #5** (Penyelarasan Bahasa Kolom & Eloquent Accessors).
3. **Two-Way Relationships**:
   - `SystemLog` `belongsTo` `University`
   - `SystemLog` `belongsTo` `User`
   - `User` `hasMany` `SystemLog`
4. **Automated Log Context Capture**:
   - Log yang dicatat via `ProposalObserver` otomatis menangkap `university_id` pengguna aktif (`Auth::user()?->university_id`) atau model (`$model->university_id`).

---

## 3. Detailed Component Specifications

### 3.1 Database Migration
**File**: [`database/migrations/2026_05_14_000000_create_system_logs_table.php`](file:///c:/xampp/htdocs/RPL-2026/database/migrations/2026_05_14_000000_create_system_logs_table.php)

Menambahkan `university_id` foreign key dan index:
```php
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
```

### 3.2 SystemLog Model
**File**: [`app/Models/SystemLog.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/SystemLog.php)

- Menambahkan `'university_id'` ke `$fillable`.
- Menambahkan `$appends = ['actor_name']`.
- Menambahkan method `getActorNameAttribute(): string`.
- Menambahkan method `university(): BelongsTo`.

```php
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

### 3.3 User Model Inverse Relation
**File**: [`app/Models/User.php`](file:///c:/xampp/htdocs/RPL-2026/app/Models/User.php)

Menambahkan relasi dua arah:
```php
/**
 * Get all system logs triggered by this user.
 */
public function systemLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
{
    return $this->hasMany(SystemLog::class);
}
```

### 3.4 ProposalObserver Context Capture
**File**: [`app/Observers/ProposalObserver.php`](file:///c:/xampp/htdocs/RPL-2026/app/Observers/ProposalObserver.php)

Perbarui `logActivity` agar menangkap `university_id`:
```php
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
```

---

## 4. Verification & Testing Plan

1. **Automated Unit / Feature Testing**:
   - Menjalankan `php artisan test --filter=ProposalTest` atau pengujian observer terkait.
   - Menjalankan `php artisan migrate:fresh --seed` di container Docker untuk memastikan skema migrasi dan seeder berjalan tanpa kendala.
2. **Data Integrity Check**:
   - Memastikan `SystemLog` baru menyimpan `university_id` sesuai user yang login.
   - Memastikan array JSON dari `SystemLog::first()->toArray()` memuat kunci `actor_name`.
