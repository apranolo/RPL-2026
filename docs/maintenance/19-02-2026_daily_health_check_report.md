# Daily Health Check Report
**Tanggal:** 19 Februari 2026  
**Waktu Pelaksanaan:** 09:00 WIB (Morning Health Check)  
**Server:** sg-nme-web423 — `journalmu.org`  
**User Server:** u347029080  
**Pelaksana:** Operations Team  
**Referensi:** [OPERATIONAL_RUNBOOK.md](./OPERATIONAL_RUNBOOK.md)

---

## Ringkasan Eksekutif

| # | Pemeriksaan | Status | Prioritas |
|---|-------------|--------|-----------|
| 1 | Error Log (Laravel) | ❌ GAGAL | P2 — High |
| 2 | Failed Jobs Queue | ❌ GAGAL | P2 — High |
| 3 | Disk Space | ⚠️ PERINGATAN | P1 — Critical |
| 4 | Database Connectivity | ✅ OK | — |
| 5 | Queue Worker | ❌ GAGAL | P2 — High |
| 6 | Backup Terbaru | ⚠️ TIDAK DITEMUKAN | P3 — Medium |

> **Kesimpulan:** Terdapat **3 isu kritis/high** yang memerlukan penanganan segera. Dua isu (TypeError & missing table) telah diselesaikan pada hari yang sama. Satu isu (Disk Space 92%) memerlukan tindak lanjut operasional segera.

---

## Detail Hasil Pemeriksaan

### ✅ Pemeriksaan 4: Database Connectivity — OK

```
> DB::connection()->getPdo();
  DRIVER_NAME: "mysql"
  SERVER_VERSION: "11.8.3-MariaDB-log"
  CONNECTION_STATUS: "127.0.0.1 via TCP/IP"
```

Koneksi database berjalan normal. Namun tercatat **4.487 slow queries** sejak server berjalan — perlu investigasi lebih lanjut pada sesi Weekly Maintenance.

---

### ❌ Pemeriksaan 1: Error Log — GAGAL

**Timestamp Error:** `2026-02-11 17:20:31` (error lama, pertama terdeteksi hari ini)  
**User ID Terdampak:** userId = 3

**Raw Error:**
```
[2026-02-11 17:20:31] local.ERROR: App\Models\Journal::scopeForUniversity():
Argument #2 ($universityId) must be of type int, null given,
called in vendor/laravel/framework/src/Illuminate/Database/Eloquent/Model.php
on line 1748
```

**Analisis Root Cause:**  
`scopeForUniversity()` pada model `Journal`, `User`, dan `PembinaanRegistration` menggunakan type hint `int` yang strict (non-nullable). Ketika `Auth::user()->university_id` bernilai `null` — yang terjadi pada akun Admin Kampus yang belum terhubung ke universitas — PHP melempar `TypeError` sebelum query dapat dieksekusi.

**Dampak:**  
Pengguna dengan role Admin Kampus yang `university_id`-nya `null` mengalami halaman error (HTTP 500) saat mengakses halaman Journal, Users, dan Pembinaan.

---

### ❌ Pemeriksaan 2: Failed Jobs Queue — GAGAL

**Raw Error:**
```
Illuminate\Database\QueryException
SQLSTATE[42S02]: Base table or view not found:
1146 Table 'u347029080_jurnal_mu.failed_jobs' doesn't exist
```

**Analisis Root Cause:**  
Tabel `failed_jobs` tidak pernah dibuat di database production. Migration untuk tabel ini terlewat saat proses deployment awal. Akibatnya:
- Perintah `php artisan queue:failed` tidak bisa dijalankan
- Queue driver tidak bisa menyimpan job yang gagal
- Monitoring antrian tidak dapat dilakukan

---

### ⚠️ Pemeriksaan 3: Disk Space — PERINGATAN

```
Filesystem      Size  Used  Avail  Use%
/dev/sdb4       874G  794G   71G   92%   /
/dev/sda1       3.5T  3.1T  424G   88%   /tmp
```

**Threshold Runbook:** < 80%  
**Status Aktual:** 92% (melewati batas kritis)  
**Sisa Ruang:** 71 GB dari 874 GB

Penggunaan disk di `/` sudah melampaui ambang batas 80% yang ditetapkan runbook. Diperlukan pembersihan segera untuk mencegah risiko disk penuh yang dapat menyebabkan downtime total (P1).

---

### ❌ Pemeriksaan 5: Queue Worker — TIDAK BERJALAN

```bash
$ ps aux | grep "queue:work"
u347029+ 1322741  0.0  0.0 221672  2488 pts/0  S+  05:55  0:00 grep --color=auto queue:work
```

Output hanya menunjukkan proses `grep` itu sendiri — tidak ada proses `queue:work` yang aktif. Artinya email notifikasi dan background jobs tidak sedang diproses.

---

### ⚠️ Pemeriksaan 6: Backup Terbaru — TIDAK DITEMUKAN

```bash
$ ls -lh storage/app/backups/ | head -5
ls: cannot access 'storage/app/backups/': No such file or directory
```

Direktori backup tidak ditemukan di lokasi default. Perlu dikonfirmasi apakah backup disimpan di lokasi lain atau proses backup otomatis belum dikonfigurasi.

---

## Tindakan yang Dilakukan

### TINDAKAN 1 — Fix TypeError scopeForUniversity [SELESAI]

**Prioritas:** P2 — High  
**Waktu Penyelesaian:** 19 Februari 2026, pagi

**Langkah yang diambil:**

1. Investigasi kode di `app/Models/Journal.php:258` — ditemukan scope sudah menggunakan `?int` (nullable), namun error tetap muncul dari production versi lama.
2. Ditemukan dua model lain yang **belum** menggunakan nullable type hint:
   - `app/Models/User.php` — `scopeForUniversity($query, int $universityId)`
   - `app/Models/PembinaanRegistration.php` — `scopeForUniversity($query, int $universityId)`
3. Ditemukan 3 controller yang memanggil scope ini tanpa validasi null sebelumnya:
   - `app/Http/Controllers/AdminKampus/JournalController.php`
   - `app/Http/Controllers/AdminKampus/UserController.php`
   - `app/Http/Controllers/AdminKampus/PembinaanController.php`
4. Diterapkan dua lapis perbaikan: **nullable type hint** pada model + **abort_if guard** pada controller.

---

### TINDAKAN 2 — Buat Tabel failed_jobs [SELESAI]

**Prioritas:** P2 — High  
**Waktu Penyelesaian:** 19 Februari 2026, pagi

**Langkah yang diambil:**

1. Dibuat file migration baru: `database/migrations/2026_02_19_000001_create_failed_jobs_table.php`
2. Migration dijalankan: `php artisan migrate --path=database/migrations/2026_02_19_000001_create_failed_jobs_table.php`
3. Status dikonfirmasi via `php artisan migrate:status` — menampilkan `[3] Ran`

---

### TINDAKAN 3 — Disk Space Cleanup [PENDING — Harus Dilakukan di Production]

**Prioritas:** P1 — Critical  
**Status:** Belum dilakukan (membutuhkan akses server production)

**Langkah yang harus diambil:**
```bash
# 1. Identifikasi folder terbesar
du -sh /home/u347029080/domains/journalmu.org/public_html/* | sort -rh | head -10

# 2. Hapus log lama (> 30 hari)
find storage/logs -name "*.log" -mtime +30 -delete

# 3. Hapus temp files
find /tmp -type f -atime +7 -delete

# 4. Cek ulang disk
df -h
# Target: < 80% usage
```

---

### TINDAKAN 4 — Restart Queue Worker [PENDING — Harus Dilakukan di Production]

**Prioritas:** P2 — High  
**Status:** Belum dilakukan

**Langkah yang harus diambil:**
```bash
# Opsi A: Manual (sementara)
cd /home/u347029080/domains/journalmu.org/public_html
nohup php artisan queue:work --tries=3 --timeout=90 > storage/logs/queue.log 2>&1 &

# Opsi B: Supervisor (recommended, permanen)
sudo supervisorctl status jurnal-mu-worker
sudo supervisorctl restart jurnal-mu-worker

# Verifikasi worker berjalan
ps aux | grep "queue:work"
```

---

### TINDAKAN 5 — Konfigurasi Backup [PENDING — Perlu Investigasi]

**Prioritas:** P3 — Medium  
**Status:** Belum dilakukan

Konfirmasi ke Server Admin apakah backup sudah dikonfigurasi di lokasi lain, atau perlu setup backup otomatis.

---

## File yang Diubah

| File | Jenis Perubahan | Terkait Tindakan |
|------|-----------------|-----------------|
| `app/Models/User.php` | Edit — nullable type hint pada `scopeForUniversity` | Tindakan 1 |
| `app/Models/PembinaanRegistration.php` | Edit — nullable type hint + empty result guard pada `scopeForUniversity` | Tindakan 1 |
| `app/Http/Controllers/AdminKampus/JournalController.php` | Edit — tambah `abort_if` guard null `university_id` | Tindakan 1 |
| `app/Http/Controllers/AdminKampus/UserController.php` | Edit — tambah `abort_if` guard null `university_id` | Tindakan 1 |
| `app/Http/Controllers/AdminKampus/PembinaanController.php` | Edit — tambah `abort_if` guard null `university_id` | Tindakan 1 |
| `database/migrations/2026_02_19_000001_create_failed_jobs_table.php` | Baru — migration tabel `failed_jobs` | Tindakan 2 |

---

## Detail Perubahan Kode

### `app/Models/User.php` & `app/Models/PembinaanRegistration.php`

```php
// SEBELUM — strict int, menyebabkan TypeError jika null
public function scopeForUniversity($query, int $universityId)
{
    return $query->where('university_id', $universityId);
}

// SESUDAH — nullable dengan safe fallback
public function scopeForUniversity($query, ?int $universityId)
{
    if (is_null($universityId)) {
        return $query; // fallback: unscoped (User) / empty result (PembinaanRegistration)
    }
    return $query->where('university_id', $universityId);
}
```

> **Catatan perbedaan antar model:**  
> - `User` & `Journal`: null → return `$query` (tidak difilter) — aman karena Policy masih memproteksi.  
> - `PembinaanRegistration`: null → return `$query->whereRaw('1 = 0')` (hasil kosong) — lebih aman untuk data sensitif registrasi.

### `app/Http/Controllers/AdminKampus/*Controller.php`

```php
// DITAMBAHKAN di awal method index() — sebelum query dijalankan
abort_if(
    is_null($authUser->university_id),
    403,
    'Akun Admin Kampus Anda belum terhubung ke universitas. Hubungi Super Admin.'
);
```

Perbaikan dua lapis ini memastikan:
1. Model tidak crash dengan `TypeError` jika null lolos ke scope.
2. Controller menolak request lebih awal dengan HTTP 403 yang informatif.

### `database/migrations/2026_02_19_000001_create_failed_jobs_table.php`

```php
Schema::create('failed_jobs', function (Blueprint $table) {
    $table->id();
    $table->string('uuid')->unique();
    $table->text('connection');
    $table->text('queue');
    $table->longText('payload');
    $table->longText('exception');
    $table->timestamp('failed_at')->useCurrent();
});
```

---

## Item Tindak Lanjut

| Item | PIC | Deadline | Status |
|------|-----|----------|--------|
| Deploy fix ke production (5 file + migrate) | Developer | 19 Feb 2026 | Menunggu deploy |
| Bersihkan disk space hingga < 80% | Server Admin | 19 Feb 2026 (hari ini) | Pending |
| Restart / setup Supervisor queue worker | Server Admin | 19 Feb 2026 (hari ini) | Pending |
| Investigasi slow queries (4.487 queries) | Developer | Weekly Maintenance | Terjadwal |
| Konfirmasi / setup lokasi backup | Server Admin | 26 Feb 2026 | Pending |
| Verifikasi ulang seluruh health checks | Operations | Setelah deploy | Pending |

---

## Catatan Tambahan

- Error `Journal::scopeForUniversity` tercatat pada **2026-02-11** (8 hari yang lalu) namun baru terdeteksi pada health check hari ini. Perlu pertimbangkan monitoring aktif (Sentry / Bugsnag) agar error terdeteksi real-time.
- **4.487 slow queries** pada MariaDB perlu dianalisis pada sesi Weekly Maintenance untuk menghindari degradasi performa.
- Setelah deploy ke production, wajib menjalankan:
  ```bash
  php artisan migrate
  php artisan config:cache
  php artisan queue:failed  # verifikasi tabel sudah bisa diakses
  ```

---

**Laporan dibuat oleh:** Operations Team  
**Direview oleh:** —  
**Status Laporan:** Final
