# Laporan Implementasi & Testing Sinkronisasi OAI-PMH (Harvesting)

## 1. Ringkasan Fitur
Fitur Sinkronisasi OAI-PMH telah diperbarui untuk mengakomodasi dua kebutuhan baru:
1. **Admin Kampus**: Kemampuan untuk melakukan sinkronisasi massal (Bulk Sync) untuk beberapa jurnal sekaligus dalam universitas yang sama.
2. **User (Pengelola Jurnal)**: Hak akses untuk memicu proses sinkronisasi (Harvesting) jurnal miliknya sendiri secara mandiri.

Semua proses sinkronisasi diarahkan ke antrean (queue) khusus bernama `harvesting`. Hal ini mencegah server kelebihan beban (overload) ketika banyak jurnal melakukan sinkronisasi secara bersamaan, sehingga job dieksekusi secara berurutan di latar belakang (background).

---

## 2. Detail Implementasi

### A. Backend (Controller & Route)
- **Route Baru**: 
  - `POST /admin-kampus/journals/harvest/bulk` (`admin-kampus.journals.harvest.bulk`) untuk Admin Kampus.
  - `POST /user/journals/{journal}/harvest` (`user.journals.harvest`) untuk Pengelola Jurnal.
- **Admin Kampus Controller (`AdminKampus\JournalController@bulkHarvest`)**:
  - Menerima kumpulan (array) `journal_ids`.
  - Melakukan validasi kepemilikan mengacu pada `university_id` Admin Kampus.
  - Memasukkan `HarvestJournalArticlesJob` ke dalam antrean `harvesting` untuk setiap jurnal valid tanpa menghapus data sebelumnya secara default.
- **User Controller (`User\JournalController@harvest`)**:
  - Diberikan otorisasi menggunakan Policy untuk memastikan pengguna hanya bisa mensinkronkan jurnal miliknya sendiri.
  - Pengecekan status `oai_pmh_url`. Jika kosong, sistem memberikan respons error kepada pengguna.
  - `show` method diperbarui untuk menyediakan properti `lastHarvestLog` dan `isHarvestPending`.

### B. Frontend (Inertia & React)
- **Admin Kampus (`AdminKampus/Journals/Index.tsx`)**:
  - Integrasi komponen Checkbox untuk menyeleksi beberapa jurnal sekaligus (multi-select).
  - Penambahan form `bulkHarvest` dan komponen tombol yang menghitung jumlah seleksi (`selectedJournals.length`).
- **User (`User/Journals/Show.tsx`)**:
  - Implementasi komponen Card/Panel untuk sinkronisasi OAI-PMH Harvest yang menampilkan informasi proses background dan riwayat log.
  - Terdapat dukungan _force sync_ jika dibutuhkan.

---

## 3. Laporan Testing (Pest PHP)

Untuk memastikan kelancaran fitur dan keamanan hak akses, testing (Feature Tests) menggunakan kerangka **Pest PHP** telah dibuat dan berhasil dijalankan.

### A. Uji Coba Admin Kampus (`Tests\Feature\AdminKampus\JournalHarvestTest`)
✅ **it can bulk harvest journals from same university** (Berhasil)
- Memastikan Admin bisa men-trigger sync dari 2 jurnal berbeda dalam universitas yang sama dan memastikan Job masuk ke queue.

✅ **it cannot bulk harvest journals from different university** (Berhasil)
- Memastikan Access Denied jika ID jurnal yang dikirim bukan berasal dari universitas Admin Kampus terkait.

✅ **it fails validation on empty array** (Berhasil)
- Memastikan pencegahan proses bila form di-submit tanpa memilih list jurnal (`journal_ids` kosong).

✅ **it fails validation on invalid ids** (Berhasil)
- Memastikan validasi bahwa payload `journal_ids` merupakan format list array valid dalam tabel database.

### B. Uji Coba User (`Tests\Feature\User\JournalHarvestTest`)
✅ **it can trigger harvest for own journal** (Berhasil)
- Memastikan User biasa dapat melakukan sinkronisasi untuk jurnal dimana ia berkedudukan sebagai `user_id`, disusul pengiriman status ke queue `harvesting`.

✅ **it cannot trigger harvest for someone elses journal** (Berhasil)
- Terdapat sistem _authorization block_ jika User yang sedang login bermaksud menyentuh OAI Sync dari jurnal orang lain atau universitas lain.

✅ **it cannot trigger harvest if oai_pmh_url is missing** (Berhasil)
- Memberikan verifikasi ketat dimana form request OAI-PMH tidak akan dilanjutkan apabila jurnal target tidak mendaftarkan OAI url (field berupa empty/null).

---

## 4. Kesimpulan
Semua kebutuhan (issue) sinkronisasi OAI-PMH massal Admin Kampus dan OAI-PMH mandiri User telah berhasil ditambahkan, diuji, dan aman dari kerentanan integritas data (Database Integrity Constraint) setelah penyesuaian simulasi _Factoy_.

Status Eksekusi QA: **100% PASS** `(7/7 Assertions sukses pada modul terkait)`