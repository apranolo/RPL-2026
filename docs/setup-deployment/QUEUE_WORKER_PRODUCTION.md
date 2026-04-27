# Queue Worker Production Setup

**Berlaku untuk:** Production Server  
**Server yang Didukung:** Hostinger Shared Hosting, VPS Linux, Dedicated Server  
**Fitur terkait:** [OAI-PMH Harvest Queue](../features/OAI_PMH_HARVEST_QUEUE.md)  
**Last Updated:** Maret 2026

---

## Overview

Fitur **Sync Artikel OAI-PMH** di dashboard Admin Kampus mendispatch job ke Laravel Queue. Cara queue tersebut diproses bergantung pada jenis server yang digunakan:

| Metode                   | Platform                 | Teknik                                 |
| ------------------------ | ------------------------ | -------------------------------------- |
| **A — Cron-Based Queue** | Hostinger Shared Hosting | CPanel Cron Jobs + `--stop-when-empty` |
| **B — Supervisor**       | VPS / Dedicated Server   | `supervisord` persistent process       |

Shared Hosting **tidak mendukung persistent process** (seperti `queue:work` tanpa flag atau Horizon), sehingga pendekatan Cron-Based digunakan: cron menjalankan `queue:work --stop-when-empty` setiap menit, memproses semua job yang ada, lalu berhenti sendiri.

> **Admin tidak perlu melakukan apapun selain klik tombol Sync.** Setup ini dilakukan **sekali saja** oleh sysadmin/DevOps.

---

## Prasyarat

**Semua platform:**

- PHP 8.2+ tersedia di server
- Laravel sudah ter-deploy dan `.env` terkonfigurasi
- Database queue aktif: `QUEUE_CONNECTION=database`
- Tabel `jobs` sudah ada (via `php artisan migrate`)

**Khusus Metode B (VPS/Dedicated):**

- Linux server (Ubuntu/Debian/CentOS)
- Akses `sudo` untuk install Supervisor

---

## Metode A: Hostinger Shared Hosting — Cron-Based Queue

> Gunakan metode ini jika Anda menggunakan **Hostinger Shared Hosting** (Business, Premium, Starter).

Shared Hosting mematikan proses PHP segera setelah request HTTP selesai, sehingga persistent worker seperti `queue:work` atau `php artisan horizon` **tidak bisa berjalan**. Solusinya adalah menjalankan `queue:work --stop-when-empty` melalui CPanel Cron Jobs setiap menit — worker berjalan, memproses semua job, lalu berhenti sendiri.

> **Apa itu latensi?** Job yang di-dispatch akan diproses dalam maksimal 1 menit. Untuk fitur harvest artikel yang sifatnya background, ini sepenuhnya acceptable.

### Mengapa Bukan Laravel Horizon?

Laravel Horizon adalah monitoring dashboard + process manager, namun ia **tetap membutuhkan persistent process** (`php artisan horizon`) untuk berjalan — sama persis dengan `queue:work`. Horizon juga mengharuskan **Redis** sebagai queue driver, yang tidak tersedia di Shared Hosting. Oleh karena itu, Horizon bukan solusi untuk keterbatasan Shared Hosting.

> Ironisnya, [dokumentasi resmi Horizon](https://laravel.com/docs/horizon#deploying-horizon) sendiri merekomendasikan penggunaan Supervisor untuk menjalankan Horizon di production.

### Langkah 1: Pahami Interface Hostinger

Hostinger menggunakan interface Cron Job yang **otomatis menangani PHP path**. Di panel Hostinger, Anda akan melihat:

```
/usr/bin/php /home/u[ID_ANDA]/public_html/[perintah]
```

**Yang perlu Anda isi: Hanya bagian setelah `/home/u[ID_ANDA]/`**

Contoh:

- Jangan isi: `/usr/bin/php /home/u347029080/public_html/jurnal_mu/artisan queue:work ...`
- **Isi saja**: `public_html/jurnal_mu/artisan queue:work ...`

> Hostinger sudah otomatis menambahkan prefix `/usr/bin/php /home/u[ID]/` untuk Anda.

### Langkah 2: Tambah Cron Job Queue Worker

1. Login ke **Panel Hostinger** → pilih website Anda
2. Klik **Tingkat Lanjut** (atau **Advanced**) → **Cron Job**
3. Mode: Pilih **PHP** (default)
4. **Opsi umum (opsional)**: Pilih `Once per minute` (atau isi manual di bawah)
5. **Perintah untuk dijalankan**, isi:

    ```
    public_html/jurnal_mu/artisan queue:work database --queue=harvesting --stop-when-empty --tries=3 --max-time=55
    ```

    > **TIDAK perlu** `cd`, **TIDAK perlu** `/usr/bin/php`, **TIDAK perlu** `>> /dev/null`
    > Hostinger sudah handle itu otomatis

6. **Schedule (jika tidak pakai preset)**:
    - Menit: `*` (setiap menit)
    - Jam: `*` (setiap jam)
    - Hari: `*` (setiap tanggal)
    - Bulan: `*` (setiap bulan)
    - Hari Kerja (weekDay): `*` (setiap hari)

7. Klik **Buat Cron Job Baru** (atau **Create**)

**Penjelasan flag penting:**

| Flag                 | Keterangan                                                                      |
| -------------------- | ------------------------------------------------------------------------------- |
| `--stop-when-empty`  | Worker berhenti sendiri jika queue kosong — **kunci utama** metode cron-based   |
| `--queue=harvesting` | Proses hanya job di queue `harvesting`                                          |
| `--tries=3`          | Retry maksimal 3 kali jika job gagal                                            |
| `--max-time=55`      | Batas 55 detik — cron berikutnya berjalan di detik 60, jadi 55 detik cukup safe |

> **Mengapa 55 detik bukan 60?** Cron berjalan setiap 60 detik. Dengan `--max-time=55`, worker pasti selesai 5 detik sebelum cron berikutnya berjalan — mencegah dua worker overlap.

### Langkah 3: Tambah Cron Job Laravel Scheduler

Tambah cron job kedua untuk scheduler (agar harvest otomatis harian berjalan):

1. Klik **Buat Cron Job Baru** lagi
2. Mode: **PHP**
3. **Opsi umum**: Pilih `Once per minute`
4. **Perintah untuk dijalankan**, isi:
    ```
    public_html/jurnal_mu/artisan schedule:run
    ```
5. Schedule: Setiap menit (seperti Langkah 2)
6. Klik **Buat Cron Job Baru**

### Langkah 4: Verifikasi

1. Login sebagai Admin Kampus di aplikasi
2. Buka detail jurnal yang punya `oai_pmh_url`
3. Klik tombol **Sync Artikel**
4. Verifikasi job masuk queue (via phpMyAdmin di CPanel):
    ```sql
    SELECT id, queue, available_at FROM jobs WHERE queue = 'harvesting';
    ```
5. Tunggu maksimal 1 menit, refresh halaman — status harvest harus terupdate
6. Cek log via CPanel → File Manager:
    - Navigate ke `storage/logs/`
    - Buka `laravel.log` untuk melihat output job

### Langkah 5: Prosedur Setelah Deploy Baru

Cron-based queue tidak membutuhkan restart worker karena worker tidak persistent. Setiap kali cron berjalan, ia membaca kode PHP terbaru secara otomatis. **Tidak ada tindakan khusus** yang diperlukan setelah deploy.

---

## Metode B: VPS / Dedicated Server — Supervisor

> Gunakan metode ini jika Anda menggunakan **VPS atau Dedicated Server** dengan akses root/sudo.

### 1. Install Supervisor

```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install supervisor -y

# CentOS / RHEL
sudo yum install supervisor -y

# Verifikasi
supervisord --version
```

---

### 2. Konfigurasi Supervisor

> Seksi ini hanya berlaku untuk **Metode B (VPS/Dedicated)**.

#### Langkah 1: Tentukan Path dan User

Ubah placeholder berikut sesuai server Anda:

| Placeholder      | Nilai                                  |
| ---------------- | -------------------------------------- |
| `{PROJECT_PATH}` | `/var/www/jurnal_mu`                   |
| `{APP_USER}`     | `www-data` (atau user web server Anda) |

#### Langkah 2: Buat File Konfigurasi

```bash
sudo nano /etc/supervisor/conf.d/jurnal_mu-harvesting.conf
```

#### Langkah 3: Template Konfigurasi

```ini
[program:jurnal_mu-harvesting]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/jurnal_mu/artisan queue:work database --queue=harvesting --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/var/www/jurnal_mu/storage/logs/worker-harvesting.log
stdout_logfile_maxbytes=10MB
stdout_logfile_backups=5
stopwaitsecs=180
```

**Penjelasan parameter penting:**

| Parameter         | Nilai                                    | Keterangan                                                        |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| `command`         | `queue:work database --queue=harvesting` | Proses hanya job di queue bernama `harvesting`                    |
| `autostart`       | `true`                                   | Otomatis start saat Supervisor dimulai                            |
| `autorestart`     | `true`                                   | Restart otomatis jika proses crash                                |
| `user`            | `www-data`                               | Jalankan sebagai user web server                                  |
| `numprocs`        | `1`                                      | Cukup 1 worker untuk harvesting                                   |
| `--sleep=3`       | 3 detik                                  | Jeda sebelum poll ulang jika queue kosong                         |
| `--max-time=3600` | 1 jam                                    | Worker restart sendiri setiap 1 jam (mencegah memory leak)        |
| `stopwaitsecs`    | 180                                      | Tunggu 3 menit agar job yang sedang berjalan selesai sebelum kill |

---

### 3. Aktifkan dan Jalankan (VPS/Dedicated)

```bash
# Baca ulang konfigurasi baru
sudo supervisorctl reread

# Update Supervisor dengan konfigurasi terbaru
sudo supervisorctl update

# Mulai worker harvesting
sudo supervisorctl start jurnal_mu-harvesting:*

# Verifikasi berjalan
sudo supervisorctl status
```

Output yang diharapkan:

```
jurnal_mu-harvesting:jurnal_mu-harvesting_00   RUNNING   pid 12345, uptime 0:00:10
```

---

### 4. Setup Laravel Scheduler (VPS/Dedicated)

```bash
sudo crontab -e -u www-data
```

Tambahkan baris berikut:

```cron
* * * * * cd /var/www/jurnal_mu && php artisan schedule:run >> /dev/null 2>&1
```

> Cron ini berjalan setiap menit dan menyerahkan kontrol ke Laravel Scheduler yang menentukan task mana yang perlu dijalankan. Untuk Hostinger Shared Hosting, cron job scheduler sudah tercakup di **Metode A — Langkah 3**.

### Jadwal yang Dikonfigurasi

File `routes/console.php` sudah dikonfigurasi dengan:

```php
// Auto-harvest semua jurnal setiap hari pukul 02:00 WIB
Schedule::command('journals:harvest-articles --all')
    ->dailyAt('02:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo(storage_path('logs/auto-harvest.log'));
```

Artinya setiap hari pukul 02:00 WIB, sistem secara otomatis memperbarui artikel untuk **semua jurnal** yang memiliki `oai_pmh_url`, tanpa perlu tindakan dari Admin.

---

## 5. Verifikasi (Metode B — VPS/Dedicated)

### Cek Supervisor running

```bash
sudo supervisorctl status
# Expected: jurnal_mu-harvesting:jurnal_mu-harvesting_00   RUNNING
```

### Cek Cron terdaftar

```bash
sudo crontab -l -u www-data
# Expected: * * * * * cd /var/www/jurnal_mu && php artisan schedule:run ...
```

### Test End-to-End

1. Login sebagai Admin Kampus di aplikasi
2. Buka detail jurnal yang punya `oai_pmh_url`
3. Klik tombol **Sync Artikel**
4. Verifikasi job masuk queue:
    ```sql
    SELECT id, queue, available_at FROM jobs WHERE queue = 'harvesting';
    ```
5. Tunggu beberapa detik, refresh halaman
6. Status harvest terakhir harus terupdate

### Cek Log Worker

```bash
tail -f /var/www/jurnal_mu/storage/logs/worker-harvesting.log
```

---

## 6. Prosedur Setelah Deploy Baru

### Hostinger Shared Hosting (Metode A)

**Tidak diperlukan tindakan khusus.** Cron-based queue tidak menggunakan persistent process — setiap kali cron berjalan, PHP di-load ulang dari awal sehingga otomatis menggunakan kode terbaru.

### VPS / Dedicated Server (Metode B)

Setiap kali deploy kode baru, **Supervisor harus di-restart** agar worker menggunakan kode PHP terbaru:

```bash
sudo supervisorctl restart jurnal_mu-harvesting:*
```

> Jika menggunakan deployment pipeline (CI/CD), tambahkan command ini di akhir deployment script.

---

## 7. Commands Referensi Cepat

### Hostinger Shared Hosting (Metode A) — via CPanel

| Aksi                  | Cara                                               |
| --------------------- | -------------------------------------------------- |
| Cek cron job aktif    | CPanel → Cron Jobs → lihat daftar                  |
| Edit command cron     | CPanel → Cron Jobs → edit                          |
| Pause queue sementara | CPanel → Cron Jobs → hapus cron job queue worker   |
| Cek job di antrian    | phpMyAdmin → tabel `jobs`                          |
| Cek failed jobs       | phpMyAdmin → tabel `failed_jobs`                   |
| Cek log               | CPanel → File Manager → `storage/logs/laravel.log` |

```bash
# Jika ada akses SSH — retry failed jobs
php artisan queue:retry all

# Flush semua failed jobs
php artisan queue:flush

# Cek job di antrian
php artisan queue:monitor database:harvesting
```

### VPS / Dedicated Server (Metode B) — Supervisor

```bash
# Cek status semua worker
sudo supervisorctl status

# Start worker harvesting
sudo supervisorctl start jurnal_mu-harvesting:*

# Stop worker harvesting
sudo supervisorctl stop jurnal_mu-harvesting:*

# Restart worker harvesting (wajib setelah deploy)
sudo supervisorctl restart jurnal_mu-harvesting:*

# Reload semua konfigurasi Supervisor
sudo supervisorctl reread && sudo supervisorctl update

# Lihat log real-time
tail -f /var/www/jurnal_mu/storage/logs/worker-harvesting.log

# Bersihkan old logs
> /var/www/jurnal_mu/storage/logs/worker-harvesting.log
```

---

## 8. Troubleshooting

### FAQ: Mengapa Tidak Menggunakan Laravel Horizon?

**Horizon membutuhkan persistent process dan Redis.** Perintah `php artisan horizon` bersifat long-running — sama persis dengan `queue:work`. Shared Hosting (Hostinger, dll.) mematikan proses PHP segera setelah request HTTP selesai, sehingga Horizon pun tidak bisa berjalan tanpa Supervisor.

Selain itu, Horizon mengharuskan **Redis** sebagai queue driver (`QUEUE_CONNECTION=redis`), sementara kita menggunakan `database`. Hostinger Shared Hosting tidak menyediakan Redis yang bisa digunakan sebagai queue driver.

> **Kesimpulan:** Horizon bukan pengganti Supervisor di Shared Hosting. Horizon adalah monitoring dashboard yang justru dijalankan **dengan** Supervisor menurut [dokumentasi resminya](https://laravel.com/docs/horizon#deploying-horizon). Jika ingin menggunakan Horizon, upgrade ke VPS.

---

### Job tidak diproses (Metode A — Cron)

1. Cek apakah cron job aktif: CPanel → Cron Jobs → pastikan ada dua entry (queue worker + scheduler)
2. Cek `available_at` job di phpMyAdmin — pastikan waktunya sudah lewat
3. Cek apakah PHP path benar:
    ```bash
    # Via SSH (jika tersedia)
    which php
    /usr/local/bin/php -v
    ```
4. Cek log error di `storage/logs/laravel.log` via CPanel File Manager
5. Test manual via SSH:
    ```bash
    cd /home/username/public_html/jurnal_mu
    /usr/local/bin/php artisan queue:work database --queue=harvesting --stop-when-empty --tries=3
    ```

### Worker tidak mau start (Metode B — Supervisor)

```bash
# Cek error Supervisor
sudo supervisorctl tail jurnal_mu-harvesting stderr

# Cek permission
ls -la /var/www/jurnal_mu/storage/logs/
sudo chown -R www-data:www-data /var/www/jurnal_mu/storage/
```

### Job tidak diproses meski worker berjalan (Metode B)

```bash
# Cek apakah job ada di antrian
php artisan queue:monitor database:harvesting

# Cek failed jobs
php artisan queue:failed

# Retry semua failed jobs
php artisan queue:retry all
```

### Worker terus restart/looping (Metode B)

Biasanya karena error di kode atau config. Cek log:

```bash
tail -50 /var/www/jurnal_mu/storage/logs/worker-harvesting.log
tail -50 /var/www/jurnal_mu/storage/logs/laravel.log
```

### Harvest gagal (status `failed` di UI — semua metode)

```sql
-- Lihat detail error
SELECT journal_id, status, error_message, harvested_at
FROM oai_harvesting_logs
WHERE status = 'failed'
ORDER BY harvested_at DESC
LIMIT 10;
```

---

## Perbedaan Staging vs Production

|                         | Staging (XAMPP Windows)         | Production Hostinger Shared        | Production VPS/Dedicated             |
| ----------------------- | ------------------------------- | ---------------------------------- | ------------------------------------ |
| **Queue Driver**        | `database`                      | `database`                         | `database`                           |
| **Metode Worker**       | Manual `php artisan queue:work` | Cron + `--stop-when-empty`         | Supervisor (persistent)              |
| **Latensi Proses Job**  | Instan                          | Max 1 menit                        | ~0 detik                             |
| **Auto-restart**        | ❌ Tidak                        | N/A (stateless)                    | ✅ Ya (Supervisor)                   |
| **Bisa Pakai Horizon?** | ⚠️ Butuh Redis                  | ❌ Tidak (no Redis, no persistent) | ✅ Ya (butuh Redis)                  |
| **Scheduled Harvest**   | Windows Task Scheduler          | Cron via CPanel                    | Cron → Laravel Scheduler             |
| **Admin perlu SSH?**    | ❌ Tidak                        | ❌ Tidak                           | ❌ Tidak                             |
| **Setup oleh**          | Developer                       | CPanel user (sekali saja)          | Sysadmin/DevOps (sekali saja)        |
| **Log access**          | Local files                     | CPanel File Manager                | SSH                                  |
| **Log path**            | `storage/logs/laravel.log`      | `storage/logs/laravel.log`         | `storage/logs/worker-harvesting.log` |

---

## Quick Start untuk Hostinger Shared Hosting

**Checklist Setup (Metode A — Cron-Based Queue):**

- [ ] Sudah deploy Laravel ke `/home/u[ID]/public_html/jurnal_mu`
- [ ] Database sudah migrate: `php artisan migrate`
- [ ] `.env` terkonfigurasi dengan `QUEUE_CONNECTION=database`
- [ ] Akses panel Hostinger → pilih website → Tingkat Lanjut → Cron Job
- [ ] Tambah Cron Job #1: mode PHP, perintah `public_html/jurnal_mu/artisan queue:work database --queue=harvesting --stop-when-empty --tries=3 --max-time=55`, schedule "Every minute"
- [ ] Tambah Cron Job #2: mode PHP, perintah `public_html/jurnal_mu/artisan schedule:run`, schedule "Every minute"
- [ ] Verifikasi kedua cron job muncul di daftar
- [ ] Test: Klik tombol Sync di aplikasi
- [ ] Tunggu maksimal 1-2 menit, refresh halaman — status harvest harus terupdate
- [ ] Jika tidak berubah: Cek `storage/logs/laravel.log` via File Manager

**Ringkasan: Dua cron job yang harus dibuat di Hostinger:**

| #     | Mode | Perintah                                                                                                         | Schedule     |
| ----- | ---- | ---------------------------------------------------------------------------------------------------------------- | ------------ |
| **1** | PHP  | `public_html/jurnal_mu/artisan queue:work database --queue=harvesting --stop-when-empty --tries=3 --max-time=55` | Every minute |
| **2** | PHP  | `public_html/jurnal_mu/artisan schedule:run`                                                                     | Every minute |

> **Full command yang dijalankan Hostinger di belakang layar:**

```bash
# Cron Job 1
/usr/bin/php /home/u[ID]/public_html/jurnal_mu/artisan queue:work database --queue=harvesting --stop-when-empty --tries=3 --max-time=55

# Cron Job 2
/usr/bin/php /home/u[ID]/public_html/jurnal_mu/artisan schedule:run
```

> Namun di UI Hostinger, Anda hanya isi bagian **setelah** `/home/u[ID]/`

## Referensi

- [OAI_PMH_HARVEST_QUEUE.md](../features/OAI_PMH_HARVEST_QUEUE.md) — Implementasi fitur Sync Artikel
- [Laravel Queue Documentation](https://laravel.com/docs/queues)
- [Supervisor Documentation](http://supervisord.org/configuration.html)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- [Hostinger SSH Access](https://support.hostinger.com/en/articles/4195639-how-to-connect-to-your-account-via-ssh)
