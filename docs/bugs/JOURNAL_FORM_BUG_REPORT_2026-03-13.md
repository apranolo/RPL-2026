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