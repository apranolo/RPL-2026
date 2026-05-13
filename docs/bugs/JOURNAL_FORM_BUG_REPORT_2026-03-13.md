# Laporan Perbaikan Form Jurnal (Tambah dan Ubah)

## Temuan Bug
1. **Tanggal SK tidak bisa diupdate:** Gagal saat menggunakan metode input langsung maupun pilih dari fitur kalender, tanpa ada pesan error tertentu karena ditolak oleh server (masalah validasi Y-m-d dan timezone match).
2. **First Published Year salah simpan:** Pengisian pertama "2018" via ketik ter-record "2017". Namun setelah menggunakan fitur panah (spinner) bisa tersimpan ke tahun yang dipilih.
3. **Scope and Focus:** Batasan 1000 karakter dirasa terlalu sempit oleh pengguna (membutuhkan 2500 karakter).

## Analisis & Root Cause
- **Tanggal SK:** Terdapat inkonsistensi pada FormRequest backend. `UpdateJournalRequest` menggunakan rule `before_or_equal:today`, yang mana `today` di PHP/Laravel menggunakan referensi timezone server default sebelum `now()->timezone(...)` diaplikasikan, sehingga pada zona waktu tertentu tanggal "hari ini" dianggap sudah di masa depan (karena masih berada di hari sebelumnya di UTC).
- **First Published Year:** Perbedaan dalam coercion tipe. Controller/Request Laravel terkadang tidak auto-cast strict numeric operator (`integer`, `gte`) jika input tetap dalam wujud string. Hal ini menyebabkan error edge-case format/year-shift ketika diparse langsung dari string ke validasi min/max numeric.
- **Scope and Focus:** Limit di request backend (`max:1000`) dan property HTML di frontend (`maxLength={1000}`).

## Tindakan Perbaikan
1. **`app/Http/Requests/StoreJournalRequest.php` & `UpdateJournalRequest.php`**
   - Menambahkan method `prepareForValidation()` untuk secara proaktif memparsing dan menormalkan format tanggal (_cast_ ke Y-m-d) menggunakan timezone lokal (seperti Asia/Jakarta atau mengacu config), sehingga konsisten.
   - Mentransformasi (cast) nilai `first_published_year` secara tegas menjadi tipe data `integer` di `prepareForValidation()` sebelum validasi framework berjalan.
   - Mengubah rule validation string `scope` dari `max:1000` menjadi `max:2500`.
   - Mengubah rule validation `accreditation_sk_date` di `UpdateJournalRequest.php` agar selaras menggunakan parameter timezone dari `now()`.

2. **`resources/js/pages/User/Journals/Create.tsx` & `Edit.tsx`**
   - Mengubah properti parameter form `maxLength={1000}` menjadi `maxLength={2500}` pada kolom Scope.
   - Memperbarui label character counter di UI text area menjadi `/2500 characters`.
   - Sinkronisasi batas `max={currentYear + 1}` agar form input `first_published_year` memiliki batasan logis konsisten dengan validator di *backend*.

3. **`tests/Feature/User/JournalFormFixTest.php`**
   - Menambahkan unit testing untuk verifikasi regresi:
     - Input string `first_published_year="2018"` tersimpan menjadi nilai `Integer` secara otomatis (pass).
     - Input panjang scope karakter max edge batas 2500 bisa diterima (pass), namun 2501 karakter akan dikembalikan dengan error object (pass).
     - Submit `Tanggal SK` yang sama persis dengan tanggal hari ini di Environment lokal tidak lagi memicu error 'before_or_equal' dan lolos diterima sistem.

## Hasil Testing
- ✅ `scope can store up to 2500 characters`
- ✅ `scope fails if exceeds 2500 characters`
- ✅ `first published year can be string and stored as integer`
- ✅ `accreditation sk date today local timezone is accepted in store`
- ✅ `accreditation sk date today local timezone is accepted in update`

Semua test suite dan manual case form sudah berjalan sesuai ekspektasi. Modifikasi aman untuk di merged ke repository utama.

## Follow-up Temuan Setelah Deploy (14 Mar 2026)

### Gejala
- Nilai `Tanggal SK` pada edit jurnal "selalu kembali" ke `11/12/2024` setelah disimpan.

### Akar Masalah Lanjutan
- Ada **inkonsistensi antar halaman role**: flow `AdminKampus/Journals/Edit` masih memakai logika lama untuk nilai date input (`accreditation_sk_date: journal.accreditation_sk_date || ''`) dan batas `max` tanggal berbasis `toISOString()` (UTC), sehingga rentan mismatch nilai tanggal.
- Parsing backend sebelumnya menggunakan `Carbon::parse(...)` yang bersifat permisif; input tanggal non-standar berpotensi diparse ambigu (day/month swap) dan menghasilkan tanggal yang tidak diharapkan.

### Perbaikan Follow-up
- Request validation untuk `accreditation_sk_date` diperketat menjadi `date_format:Y-m-d` pada:
   - `app/Http/Requests/StoreJournalRequest.php`
   - `app/Http/Requests/UpdateJournalRequest.php`
- Normalisasi tanggal di `prepareForValidation()` diubah menjadi strict parser `Carbon::createFromFormat('Y-m-d', ...)`.
- Halaman Admin Kampus diperbaiki agar konsisten dengan User flow:
   - `resources/js/pages/AdminKampus/Journals/Edit.tsx`: normalisasi nilai awal date input (mendukung `YYYY-MM-DD`, ISO datetime, dan `DD/MM/YYYY`) dan gunakan `todayLocal` untuk `max`.
   - `resources/js/pages/AdminKampus/Journals/Create.tsx`: gunakan `todayLocal` untuk `max`.

### Tambahan Regression Test
- Ditambahkan test: `test_accreditation_sk_date_is_updated_to_new_value_not_stuck_on_old_date` pada:
   - `tests/Feature/User/JournalFormFixTest.php`

> Catatan verifikasi lokal: saat run terakhir, eksekusi test sempat terhambat karena koneksi MySQL test environment tidak aktif (`SQLSTATE[HY000] [2002] connection refused`). Setelah DB test aktif, jalankan ulang test untuk konfirmasi akhir.