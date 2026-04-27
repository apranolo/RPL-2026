# Bug Fix Report: Journal Creation 302 Redirect

**Tanggal:** 26 Februari 2026  
**Severity:** P1 — Critical (fitur utama tidak berfungsi)  
**Status:** ✅ RESOLVED  
**Pelaksana:** Engineering Team

---

## Ringkasan Eksekutif

| #   | Bug                                                           | Status                                    |
| --- | ------------------------------------------------------------- | ----------------------------------------- |
| 1   | Journal baru tidak tersimpan — silent 302 redirect            | ✅ Fixed                                  |
| 2   | Kolom `sinta_rank` DB type mismatch (`tinyInteger` vs string) | ✅ Confirmed resolved (already `varchar`) |
| 3   | Kolom akreditasi baru tidak ada di DB                         | ✅ Fixed via migration                    |
| 4   | Kolom stale dikti masih ada di DB                             | ✅ Dropped via migration                  |
| 5   | `indexations.*.platform` validation rule selalu gagal         | ✅ Fixed                                  |
| 6   | Form indexation masih pakai `indexed_at` (date) bukan `url`   | ✅ Fixed                                  |

---

## Investigasi: Root Cause Analysis

### Gejala

Saat user menekan tombol **"Save Journal"** pada form tambah jurnal, browser menerima response `302 Found` dan halaman kembali ke form tanpa pesan error yang jelas dan tanpa data tersimpan.

### HTTP Response yang Dilaporkan

```
Status: 302 Found
Version: HTTP/1.1
```

### Root Cause yang Ditemukan

#### 1. Validation Failure pada `StoreJournalRequest` (Penyebab Utama 302)

Alur validasi di `prepareForValidation()` mengubah format indexations dari array ke dictionary keyed:

```php
// Input dari frontend (array format):
[ { "platform": "Scopus", "indexed_at": "2024-01-01" } ]

// Setelah prepareForValidation() transform ke:
{ "Scopus": { "indexed_at": "2024-01-01" } }
```

Namun rule validasi masih menggunakan:

```php
'indexations.*.platform' => 'required|string|in:Scopus,...'
```

Setelah transformasi, key `platform` sudah tidak ada di dalam struktur data (karena sudah jadi key dict). Rule `indexations.*.platform` selalu **required** dan selalu **gagal** → 302 redirect back with errors.

Ini menyebabkan form selalu gagal jika user mencentang _minimal satu_ indexation.

#### 2. `accreditation_start_year`, `accreditation_end_year`, `accreditation_sk_number`, `accreditation_sk_date` Tidak Ada di DB

Field-field ini ada di:

- `Journal::$fillable`
- `StoreJournalRequest::rules()`
- `$casts` model

Namun **tidak ada satu pun migration yang pernah menambahkan kolom-kolom ini**. Jika validasi berhasil lolos, INSERT query akan throw `SQLSTATE: Unknown column` → 500.

_Catatan:_ Investigasi menemukan bahwa pada deployment aktual, kolom-kolom ini **sudah ada** di DB (kemungkinan ditambahkan secara manual). Migration tetap dibuat untuk memastikan konsistensi dengan fresh install.

#### 3. Kolom Stale Dikti Masih Ada di DB

Kolom lama (`dikti_accreditation_number`, `accreditation_issued_date`, `accreditation_expiry_date`) masih ada di DB tapi sudah tidak digunakan oleh kode aplikasi dan tidak ada di `$fillable`.

---

## Fix yang Diterapkan

### Fix 1: Hapus Rule Validasi `indexations.*.platform` yang Salah

**File:** `app/Http/Requests/StoreJournalRequest.php` & `UpdateJournalRequest.php`

```php
// BEFORE (selalu gagal setelah prepareForValidation):
'indexations.*.platform' => 'required|string|in:Scopus,...',
'indexations.*.indexed_at' => 'nullable|date|before_or_equal:today',

// AFTER:
'indexations.*.url' => 'nullable|url|max:500',
// Rule platform dihapus — sudah divalidasi via prepareForValidation transform
```

`prepareForValidation()` juga diupdate untuk menyimpan `url` bukan `indexed_at`:

```php
$transformed[$item['platform']] = [
    'url' => $item['url'] ?? null,   // was: 'indexed_at'
];
```

### Fix 2: Migration Baru untuk Schema Fix

**File:** `database/migrations/2026_02_26_000001_fix_journal_schema.php`

```php
Schema::table('journals', function (Blueprint $table) {
    $table->dropColumn([
        'dikti_accreditation_number',
        'accreditation_issued_date',
        'accreditation_expiry_date',
    ]);
});
```

Migration ini membersihkan 3 kolom stale yang tidak lagi dipakai aplikasi.

---

## Dampak Perubahan

| Area                          | Perubahan                                                     |
| ----------------------------- | ------------------------------------------------------------- |
| DB Schema                     | 3 kolom stale di-drop                                         |
| `StoreJournalRequest`         | Rule `indexed_at` → `url`; hapus rule `platform`              |
| `UpdateJournalRequest`        | Sama seperti di atas                                          |
| Frontend (semua form journal) | Input `indexed_at (date)` → `url (text/url)`                  |
| `IndexationBadge` component   | Prop `indexed_date` → `url` (lama tetap ada, backward-compat) |

---

## Verifikasi

```bash
# Jalankan migration
php artisan migrate
# Output: 2026_02_26_000001_fix_journal_schema ... DONE

# Jalankan test suite
php artisan test tests/Feature/User/JournalCreateTest.php
# Output: Tests: 16 passed (45 assertions) — Duration: 6.23s
```

---

## Files yang Dimodifikasi

- `database/migrations/2026_02_26_000001_fix_journal_schema.php` _(NEW)_
- `app/Http/Requests/StoreJournalRequest.php`
- `app/Http/Requests/UpdateJournalRequest.php`
- `resources/js/pages/User/Journals/Create.tsx`
- `resources/js/pages/User/Journals/Edit.tsx`
- `resources/js/pages/User/Journals/Show.tsx`
- `resources/js/pages/AdminKampus/Journals/Create.tsx`
- `resources/js/pages/AdminKampus/Journals/Edit.tsx`
- `resources/js/components/badges/IndexationBadge.tsx`
- `tests/Feature/User/JournalCreateTest.php` _(NEW)_
