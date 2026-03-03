# Queue Worker Production Setup

**Berlaku untuk:** Production Server (Linux + SSH)  
**Fitur terkait:** [OAI-PMH Harvest Queue](../features/OAI_PMH_HARVEST_QUEUE.md)  
**Last Updated:** Maret 2026

---

## Overview

Fitur **Sync Artikel OAI-PMH** di dashboard Admin Kampus mendispatch job ke Laravel Queue. Agar job tersebut diproses secara otomatis di production tanpa perlu SSH manual, server harus dikonfigurasi dengan **Supervisor** — sebuah process manager Linux yang menjaga `queue:work` berjalan terus-menerus, bahkan setelah crash atau server restart.

> **Admin tidak perlu melakukan apapun selain klik tombol Sync.** Setup ini dilakukan **sekali saja** oleh sysadmin/DevOps.

---

## Prasyarat

- Linux server (Ubuntu/Debian/CentOS)
- PHP 8.2+ tersedia di server
- Laravel sudah ter-deploy dan `.env` terkonfigurasi
- Database queue aktif: `QUEUE_CONNECTION=database`
- Tabel `jobs` sudah ada (via `php artisan migrate`)

---

## 1. Install Supervisor

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

## 2. Konfigurasi Queue Worker untuk Harvesting

Buat file konfigurasi Supervisor untuk queue `harvesting`:

```bash
sudo nano /etc/supervisor/conf.d/jurnal_mu-harvesting.conf
```

Isi dengan:

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

| Parameter | Nilai | Keterangan |
|---|---|---|
| `command` | `queue:work database --queue=harvesting` | Proses hanya job di queue bernama `harvesting` |
| `autostart` | `true` | Otomatis start saat Supervisor dimulai |
| `autorestart` | `true` | Restart otomatis jika proses crash |
| `user` | `www-data` | Jalankan sebagai user web server, sesuaikan jika berbeda |
| `numprocs` | `1` | Cukup 1 worker untuk harvesting |
| `--sleep=3` | 3 detik | Jeda sebelum poll ulang jika queue kosong |
| `--max-time=3600` | 1 jam | Worker restart sendiri setiap 1 jam (mencegah memory leak) |
| `stopwaitsecs` | 180 | Tunggu 3 menit agar job yang sedang berjalan selesai sebelum kill |

> ⚠️ **Sesuaikan path** `/var/www/jurnal_mu/` dengan path deployment aktual di server.

---

## 3. Aktifkan dan Jalankan

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

## 4. Setup Laravel Scheduler (Cron)

Scheduler diperlukan untuk dua hal:
1. **Harvest otomatis harian** setiap malam tanpa klik manual
2. Mengelola scheduled tasks Laravel lainnya di masa depan

### Tambahkan ke Crontab Server

```bash
sudo crontab -e -u www-data
```

Tambahkan baris berikut:
```cron
* * * * * cd /var/www/jurnal_mu && php artisan schedule:run >> /dev/null 2>&1
```

> Cron ini berjalan setiap menit dan menyerahkan kontrol ke Laravel Scheduler yang akan menentukan task mana yang perlu dijalankan.

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

## 5. Verifikasi Setup Lengkap

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

Setiap kali deploy kode baru ke production, **queue worker harus di-restart** agar menggunakan kode PHP terbaru:

```bash
sudo supervisorctl restart jurnal_mu-harvesting:*
```

> Jika menggunakan deployment pipeline (CI/CD), tambahkan command ini di akhir deployment script.

---

## 7. Commands Supervisor — Referensi Cepat

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

### Worker tidak mau start
```bash
# Cek error Supervisor
sudo supervisorctl tail jurnal_mu-harvesting stderr

# Cek permission
ls -la /var/www/jurnal_mu/storage/logs/
sudo chown -R www-data:www-data /var/www/jurnal_mu/storage/
```

### Job tidak diproses meski worker berjalan
```bash
# Cek apakah job ada di antrian
php artisan queue:monitor database:harvesting

# Cek failed jobs
php artisan queue:failed

# Retry semua failed jobs
php artisan queue:retry all
```

### Worker terus restart (looping)
Biasanya karena error di kode atau config. Cek log:
```bash
tail -50 /var/www/jurnal_mu/storage/logs/worker-harvesting.log
tail -50 /var/www/jurnal_mu/storage/logs/laravel.log
```

### Harvest gagal (status `failed` di UI)
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

| | Staging (XAMPP Windows) | Production (SSH Linux) |
|---|---|---|
| **Queue Driver** | `database` | `database` |
| **Worker** | Manual `php artisan queue:work` | Supervisor (otomatis permanen) |
| **Auto-restart** | ❌ Tidak | ✅ Ya |
| **Scheduled Harvest** | Windows Task Scheduler (`run-scheduler.bat`) | Cron → Laravel Scheduler |
| **Admin perlu SSH?** | ❌ Tidak | ❌ Tidak |
| **Setup oleh** | Developer | Sysadmin/DevOps (sekali saja) |
| **Log worker** | `storage/logs/scheduler.log` | `storage/logs/worker-harvesting.log` |

---

## Referensi

- [OAI_PMH_HARVEST_QUEUE.md](../features/OAI_PMH_HARVEST_QUEUE.md) — Implementasi fitur Sync Artikel
- [Laravel Queue Documentation](https://laravel.com/docs/queues)
- [Supervisor Documentation](http://supervisord.org/configuration.html)
- [Laravel Deployment](https://laravel.com/docs/deployment)
