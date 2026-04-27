# OAI-PMH Harvest Queue — Dashboard Button Implementation

**Tanggal Implementasi:** 2 Maret 2026  
**Status:** ✅ Production Ready

---

## Overview

Fitur ini menambahkan tombol **Sync Artikel (OAI-PMH)** pada halaman detail jurnal di dashboard Admin Kampus (LPPM). Ketika diklik, sistem akan mendispatch sebuah **background job** ke Laravel Queue sehingga proses harvesting berjalan secara asinkron tanpa memblokir halaman.

Sebelumnya, harvesting hanya bisa dilakukan melalui perintah Artisan di terminal:

```bash
php artisan journals:harvest-articles {journal_id}
```

Sekarang Admin Kampus dapat memicu proses yang sama langsung dari UI, dan halaman menampilkan status harvest terakhir secara real-time (refresh manual).

---

## Arsitektur

```
Browser (Admin Kampus)
  │
  │  POST /admin-kampus/journals/{id}/harvest
  ▼
JournalController@harvest
  │  dispatch job ke queue 'harvesting'
  ▼
jobs table (database queue)
  │
  │  php artisan queue:work --queue=harvesting
  ▼
HarvestJournalArticlesJob
  │  panggil OAIPMHHarvester::harvest()
  ▼
oai_harvesting_logs   articles
(log hasil)           (data artikel)
```

### Komponen yang Terlibat

| Layer      | File                                                          | Peran                                          |
| ---------- | ------------------------------------------------------------- | ---------------------------------------------- |
| Job        | `app/Jobs/HarvestJournalArticlesJob.php`                      | Background job dengan deduplication            |
| Controller | `app/Http/Controllers/AdminKampus/JournalController.php`      | Dispatch job, return flash                     |
| Route      | `routes/web.php`                                              | `POST admin-kampus/journals/{journal}/harvest` |
| Service    | `app/Services/OAIPMHHarvester.php`                            | Logika harvesting OAI-PMH (existing)           |
| Frontend   | `resources/js/pages/AdminKampus/Journals/Show.tsx`            | UI tombol + status                             |
| Types      | `resources/js/types/index.d.ts`                               | Interface `OaiHarvestingLog`                   |
| Migration  | `database/migrations/2026_03_02_000001_create_jobs_table.php` | Tabel `jobs` untuk queue                       |

---

## Detail Implementasi

### 1. Job Class: `HarvestJournalArticlesJob`

**File:** `app/Jobs/HarvestJournalArticlesJob.php`

```php
class HarvestJournalArticlesJob implements ShouldQueue, ShouldBeUnique
{
    public int $tries = 3;
    public int $timeout = 180;

    public function uniqueId(): string
    {
        return 'harvest-journal-' . $this->journal->id;
    }

    public function uniqueFor(): int
    {
        return 600; // lock 10 menit
    }
}
```

**Fitur penting:**

- **`ShouldBeUnique`** — Laravel menolak dispatch kedua jika job dengan `uniqueId` yang sama masih ada di antrian. Ini mencegah Admin menumpuk ratusan job untuk jurnal yang sama.
- **`uniqueId()`** — Format `harvest-journal-{id}` unik per jurnal. Dua jurnal berbeda bisa harvest secara bersamaan.
- **`uniqueFor(600)`** — Lock dilepas otomatis setelah 10 menit bahkan jika worker tidak berjalan, mencegah lock permanen.
- **`tries = 3`** — Job diulang hingga 3 kali jika gagal (network timeout, server down, dll).
- **`timeout = 180`** — Batas waktu 3 menit per attempt, cukup untuk endpoint lambat.
- **`failed()`** — Saat semua retry habis, mencatat ke `oai_harvesting_logs` dengan status `failed` sehingga Admin bisa melihat error di UI.
- **`tags()`** — Untuk monitoring dengan Laravel Horizon.

### 2. Route

**File:** `routes/web.php`

```php
Route::post('{journal}/harvest', [JournalController::class, 'harvest'])
    ->name('harvest');
```

Berada dalam grup `admin-kampus.journals.` sehingga nama lengkapnya `admin-kampus.journals.harvest`.

Dilindungi middleware `role:Admin Kampus`.

### 3. Controller: `harvest()` method

**File:** `app/Http/Controllers/AdminKampus/JournalController.php`

```php
public function harvest(Journal $journal): RedirectResponse
{
    $this->authorize('update', $journal);

    if (empty($journal->oai_pmh_url)) {
        return redirect()
            ->route('admin-kampus.journals.show', $journal)
            ->with('error', '...');
    }

    HarvestJournalArticlesJob::dispatch($journal)->onQueue('harvesting');

    return redirect()
        ->route('admin-kampus.journals.show', $journal)
        ->with('success', '...');
}
```

**Guard-guard:**

1. **Policy `update`** — hanya Admin Kampus dari universitas yang sama.
2. **Cek `oai_pmh_url`** — jika kosong, redirect dengan pesan error.
3. **Redirect ke route eksplisit** — bukan `back()` yang bergantung pada header Referer.

### 4. Data yang dikirim ke frontend dari `show()`

Tiga prop baru ditambahkan ke `Inertia::render()`:

| Prop               | Tipe          | Keterangan                                |
| ------------------ | ------------- | ----------------------------------------- |
| `articlesCount`    | `int`         | Jumlah artikel yang sudah tersimpan       |
| `lastHarvestLog`   | `array\|null` | Baris terakhir dari `oai_harvesting_logs` |
| `isHarvestPending` | `bool`        | Apakah ada job harvest aktif di antrian   |

**`isHarvestPending` query:**

```php
DB::table('jobs')
    ->where('queue', 'harvesting')
    ->where('payload', 'like', '%HarvestJournalArticlesJob%')
    ->where('payload', 'like', '%i:'.$journal->id.';%')  // PHP serialized int
    ->exists();
```

> **Catatan teknis:** Laravel menyimpan model dalam payload job sebagai PHP serialized string, bukan JSON. Format integer dalam PHP serialize adalah `i:X;`, bukan `"id":X`.

### 5. Frontend UI

**File:** `resources/js/pages/AdminKampus/Journals/Show.tsx`

Seksi baru **"Artikel OAI-PMH"** ditambahkan di antara info jurnal dan assessment history. Berisi:

- **Badge** jumlah artikel tersimpan
- **Tombol "Sync Artikel"** dengan state:
    - Normal → bisa diklik
    - Loading (`harvesting` state) → spinner + disabled
    - Pending (`isHarvestPending`) → teks "Antrian Aktif" + disabled
    - Tidak ada URL → disabled + tooltip hint
- **OAI-PMH Endpoint URL** dengan link ke endpoint
- **Warning** jika URL belum dikonfigurasi (dengan link ke form edit)
- **Riwayat harvest terakhir** menampilkan:
    - Status badge (Berhasil / Sebagian / Gagal) dengan warna
    - Jumlah records found dan records imported
    - Timestamp harvest
    - Pesan error (jika gagal)

### 6. TypeScript Interface

**File:** `resources/js/types/index.d.ts`

```typescript
export interface OaiHarvestingLog {
    id: number;
    journal_id: number;
    harvested_at: string;
    records_found: number;
    records_imported: number;
    status: 'success' | 'partial' | 'failed';
    error_message?: string | null;
}
```

---

## Queue Configuration

**Driver:** `database` (default, tabel `jobs`)  
**Queue name:** `harvesting` (terpisah dari queue `default`)

Alasan menggunakan queue name terpisah `harvesting`:

- Mengisolasi job harvest dari job lain
- Bisa dikonfigurasi worker tersendiri dengan concurrency berbeda
- Mudah di-monitor dan di-pause secara independen

### Menjalankan Queue Worker

**Development (lokal):**

```bash
php artisan queue:work --queue=harvesting
```

**Production (disarankan):**  
Gunakan Supervisor untuk menjaga worker tetap berjalan.

Buat file `/etc/supervisor/conf.d/jurnal-mu-harvesting.conf`:

```ini
[program:jurnal-mu-harvesting]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/jurnal_mu/artisan queue:work database --queue=harvesting --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/jurnal_mu/storage/logs/harvesting-worker.log
```

```bash
supervisorctl reread
supervisorctl update
supervisorctl start jurnal-mu-harvesting:*
```

### Scheduled Harvesting (Opsional)

Untuk harvest otomatis harian, tambahkan di `routes/console.php`:

```php
Schedule::command('journals:harvest-articles --all')
    ->daily()
    ->at('02:00')
    ->onOneServer()
    ->runInBackground();
```

---

## Alur Lengkap (Happy Path)

1. Admin Kampus membuka halaman detail jurnal yang sudah punya `oai_pmh_url`
2. Melihat seksi "Artikel OAI-PMH" dengan info harvest terakhir
3. Klik tombol **Sync Artikel**
4. Frontend mengirim `POST /admin-kampus/journals/{id}/harvest` via Inertia
5. Controller memverifikasi policy + cek URL → dispatch `HarvestJournalArticlesJob` ke queue `harvesting`
6. Controller redirect ke halaman show → flash message `success` muncul
7. Job masuk ke tabel `jobs` (queue `database`)
8. Queue worker (`php artisan queue:work --queue=harvesting`) mengambil job
9. `OAIPMHHarvester::harvest()` dipanggil — fetch XML dari endpoint OAI-PMH, parse Dublin Core, upsert ke tabel `articles`, catat ke `oai_harvesting_logs`
10. Admin refresh halaman → melihat status harvest terbaru + jumlah artikel terupdate

---

## Penanganan Error

| Skenario                    | Penanganan                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `oai_pmh_url` kosong        | Flash `error`, redirect ke show page                                                  |
| Job sudah di antrian        | `ShouldBeUnique` menolak dispatch silently, flash `success` tetap muncul (idempotent) |
| Network timeout ke endpoint | Job diulang otomatis hingga 3x                                                        |
| Semua retry habis           | `failed()` mencatat ke `oai_harvesting_logs` dengan status `failed` + error message   |
| XML tidak valid             | `OAIPMHHarvester` catches exception, log ke `oai_harvesting_logs` status `failed`     |
| Worker tidak berjalan       | Job tetap tersimpan di tabel `jobs`, akan diproses saat worker aktif kembali          |

---

## Bug yang Diperbaiki Selama Implementasi

### Bug 1: `redirect()->back()` — 302 tanpa tujuan jelas

**Masalah:** `redirect()->back()` bergantung pada HTTP `Referer` header. Jika header tidak ada (REST client, tab baru, dll), Laravel redirect ke `/` yang kemudian diredirect ke `/dashboard` — chain 302 yang membingungkan.  
**Solusi:** Diganti dengan `redirect()->route('admin-kampus.journals.show', $journal)`.

### Bug 2: `isHarvestPending` LIKE query — selalu `false`

**Masalah:** Query menggunakan `%"id":X%` (format JSON) tapi Laravel serialize model Job sebagai **PHP serialized string** (`i:X;`), bukan JSON.  
**Solusi:** Diubah ke `%i:X;%` yang sesuai dengan format PHP serialize.

### Bug 3: Tidak ada proteksi duplicate job

**Masalah:** Manual check bisa race-condition (dua request simultan lolos).  
**Solusi:** Job mengimplementasikan `ShouldBeUnique` dengan `uniqueId()` — Laravel's built-in atomic lock via cache.

---

## Testing Manual

### Setup

```sql
-- Pastikan ada jurnal dengan oai_pmh_url
UPDATE journals
SET oai_pmh_url = 'https://journal.unnes.ac.id/journals/inapes/oai'
WHERE id = 1;
```

### Steps

1. Login sebagai Admin Kampus
2. Buka **Journals → [nama jurnal]**
3. Scroll ke seksi "Artikel OAI-PMH"
4. Klik **Sync Artikel** — pastikan flash message muncul
5. Cek tabel `jobs`: `SELECT * FROM jobs WHERE queue = 'harvesting';`
6. Jalankan worker: `php artisan queue:work --queue=harvesting --once`
7. Refresh halaman — cek status harvest terbaru dan jumlah artikel

### Verifikasi Database

```sql
-- Cek job masuk antrian
SELECT id, queue, JSON_UNQUOTE(JSON_EXTRACT(payload, '$.displayName')) as job_class
FROM jobs WHERE queue = 'harvesting';

-- Cek hasil harvest
SELECT * FROM oai_harvesting_logs WHERE journal_id = 1 ORDER BY harvested_at DESC LIMIT 1;
SELECT COUNT(*) as total_articles FROM articles WHERE journal_id = 1;
```

### Test Double-Dispatch

1. Klik **Sync Artikel** dua kali cepat (atau dua tab)
2. Cek tabel `jobs` — hanya boleh ada **satu** job untuk journal tersebut (`ShouldBeUnique`)

---

## File yang Diubah / Dibuat

| File                                                          | Status    | Keterangan                                 |
| ------------------------------------------------------------- | --------- | ------------------------------------------ |
| `app/Jobs/HarvestJournalArticlesJob.php`                      | ✨ Baru   | Job class dengan ShouldBeUnique            |
| `database/migrations/2026_03_02_000001_create_jobs_table.php` | ✨ Baru   | Tabel `jobs` dan `job_batches`             |
| `routes/web.php`                                              | 📝 Diubah | Tambah route `POST harvest`                |
| `app/Http/Controllers/AdminKampus/JournalController.php`      | 📝 Diubah | Tambah method `harvest()`, update `show()` |
| `resources/js/types/index.d.ts`                               | 📝 Diubah | Tambah interface `OaiHarvestingLog`        |
| `resources/js/pages/AdminKampus/Journals/Show.tsx`            | 📝 Diubah | Seksi UI baru "Artikel OAI-PMH"            |

---

## Referensi

- [OAI_PMH_IMPLEMENTATION.md](OAI_PMH_IMPLEMENTATION.md) — Dokumentasi sistem harvesting lengkap (fase sebelumnya)
- [Laravel Queue Documentation](https://laravel.com/docs/queues)
- [Laravel ShouldBeUnique](https://laravel.com/docs/queues#preventing-job-overlaps)
- [Inertia.js Form Submissions](https://inertiajs.com/forms)
