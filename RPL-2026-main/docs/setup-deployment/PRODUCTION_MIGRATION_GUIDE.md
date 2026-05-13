# Production Migration Guide

## Checklist Sebelum Migrate di Production

### 1. Backup Database
```bash
# Full backup
mysqldump -u root -p jurnal_mu > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Backup dengan kompresi
mysqldump -u root -p jurnal_mu | gzip > backups/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 2. Test di Staging/Local
```bash
# Pastikan migration berjalan lancar di environment staging
php artisan migrate --pretend  # Lihat SQL yang akan dijalankan
php artisan migrate
```

### 3. Cek Status Migration
```bash
php artisan migrate:status
```

### 4. Jalankan Migration di Production
```bash
# Maintenance mode (optional tapi disarankan)
php artisan down --message="Database update in progress"

# Jalankan migration
php artisan migrate --force

# Keluar dari maintenance mode
php artisan up
```

## Troubleshooting

### Error: "Table already exists"

**Penyebab:** Tabel sudah ada di database tapi belum tercatat di tabel `migrations`.

**Solusi 1 - Manual Insert:**
```sql
-- Login ke MySQL
mysql -u root -p jurnal_mu

-- Insert migration record
INSERT INTO migrations (migration, batch) 
VALUES ('NAMA_FILE_MIGRATION', (SELECT IFNULL(MAX(batch), 0) + 1 FROM migrations m));

exit;
```

**Solusi 2 - Skip Migration Tertentu:**
```bash
# Jika tabel sudah sesuai, tandai sebagai sudah dijalankan
php artisan migrate:status  # Catat nomor batch terakhir
# Kemudian insert manual ke tabel migrations
```

### Error: "Column already exists"

**Solusi:** Buat migration rollback atau update yang memeriksa keberadaan kolom:

```php
// Contoh migration yang aman
if (!Schema::hasColumn('table_name', 'column_name')) {
    Schema::table('table_name', function (Blueprint $table) {
        $table->string('column_name');
    });
}
```

## Restore Database dari Backup

Jika terjadi kesalahan dan perlu restore:

```bash
# Restore dari backup
mysql -u root -p jurnal_mu < backups/backup_20260205_120000.sql

# Jika menggunakan backup terkompresi
gunzip < backups/backup_20260205_120000.sql.gz | mysql -u root -p jurnal_mu
```

## Best Practices

1. ✅ **Selalu backup** sebelum migrate di production
2. ✅ **Test di local/staging** terlebih dahulu
3. ✅ **Gunakan `--pretend`** untuk preview SQL yang akan dijalankan
4. ✅ **Aktifkan maintenance mode** saat migrate
5. ✅ **Periksa migration status** setelah selesai
6. ✅ **Simpan backup** minimal 30 hari
7. ❌ **Jangan gunakan `migrate:fresh`** di production
8. ❌ **Jangan hapus file migration** yang sudah dijalankan

## Monitoring Setelah Migration

```bash
# Cek status migration
php artisan migrate:status

# Cek log errors
tail -f storage/logs/laravel.log

# Cek koneksi database
php artisan db:show
```

## Rollback (Jika Diperlukan)

```bash
# Rollback migration terakhir
php artisan migrate:rollback

# Rollback batch tertentu
php artisan migrate:rollback --batch=5

# Rollback step tertentu
php artisan migrate:rollback --step=1
```

## Automated Backup Script

Buat file `backup-db.sh` atau `backup-db.bat`:

```batch
@echo off
REM Windows Batch Script untuk Backup Database

set DB_USER=root
set DB_NAME=jurnal_mu
set BACKUP_DIR=C:\xampp\htdocs\jurnal_mu\backups
set MYSQL_BIN=C:\xampp\mysql\bin

REM Buat folder backup jika belum ada
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Backup dengan timestamp
set TIMESTAMP=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

echo Backing up database %DB_NAME%...
"%MYSQL_BIN%\mysqldump" -u %DB_USER% -p %DB_NAME% > "%BACKUP_DIR%\backup_%TIMESTAMP%.sql"

echo Backup completed: backup_%TIMESTAMP%.sql

REM Hapus backup lama (lebih dari 30 hari)
forfiles /p "%BACKUP_DIR%" /s /m *.sql /d -30 /c "cmd /c del @path" 2>nul

pause
```

Jalankan sebelum setiap migration:
```batch
backup-db.bat
```
