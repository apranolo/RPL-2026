# Dokumentasi Implementasi Dukungan Multi-OAI & Sinkronisasi Super Admin

## Deskripsi Pengerjaan
Pembaruan ini mencakup perombakan pada fitur sinkronisasi *Open Archives Initiative Protocol for Metadata Harvesting* (OAI-PMH). Fitur ini ditujukan untuk mengakomodir kebutuhan sebuah jurnal yang memiliki lebih dari satu alamat URL OAI-PMH (misal: akibat migrasi domain atau versi OJS), serta memberikan utilitas pemantauan dan pemicu sinkronisasi langsung (Sync) bagi peran **Super Admin**.

---

## 1. Perubahan Backend (Sistem & Database)

### Perubahan Struktur Data
- **Tabel `journals`**: Mengubah (migrasi) tipe kolom `oai_pmh_url` yang sebelumnya bernilai *string (VARCHAR)* menjadi kolom `oai_urls` bertipe data `JSON` (array string).
- **Proses Migrasi Backwards-Compatible**: Script migrasi database memastikan nilai `oai_pmh_url` tunggal peninggalan lama dibaca dan dibungkus ulang otomatis ke dalam format JSON Array `["http://..."]` sehingga tidak ada data yang hilang.

### Pembaruan Skema Codebase (Laravel)
- **Model `Journal.php`**: `oai_urls` disetalkan ke property `$fillable` dan dicasting dengan `$casts = ['oai_urls' => 'array']`.
- **Validasi (`StoreJournalRequest`, `UpdateJournalRequest`)**: Memperbarui regulasi payload JSON dari string `oai_pmh_url` menjadi `oai_urls` berjenis validasi *array* dan `oai_urls.*` dengan format validasi *url*.
- **OAI Harvester (`app/Services/OAIPMHHarvester.php`)**:
  - Mesin sinkronisasi dimutasi agar mengeksekusi rotasi berulang (`foreach`) untuk menyapu semua URL di dalam array `oai_urls`.
  - Sistem mengagregasi total pencarian (found) dan impor (imported) dari seluruh kumpulan OAI menjadi satu pencatatan (*Single Batch Log*).
  - Peringatan error per-endpoint ditangkap dan disatukan (concatenated) guna ditunjukkan di bagian status *Partial* atau *Failed* dalam _harvesting log_.
- **Sistem Antrian (`app/Jobs/HarvestJournalArticlesJob.php`)**: Pendekatan logika tetap menjaga integritas entitas jurnal yang tunggal ketika menempatkannya ke antrian, namun kini bergantung pada panjang array URL-nya.

---

## 2. Perubahan Tampilan Tabel Artikel & Fungsionalitas Tiap Role

Untuk memvisualisasikan fitur ini, komponen form formulir input pada bagian Create dan Edit (`Create.tsx`, `Edit.tsx`) milik **User** maupun **AdminKampus** telah direkayasa menggunakan *dynamic mapping input*. Pengguna bebas menekan tombol ikon (tong sampah) untuk menghapus ataupun menambahkan kolom teks URL OAI tak terbatas. 

Pemecahan detail halaman (*Journal Show Page*) untuk setiap tingkatan diubah sedemikian rupa:

### A. Role: Public (Pencari Informasi / Guest)
- **View File**: `resources/js/pages/Journals/Show.tsx`
- **Output Multi-OAI**: Jika jurnal memuat lebih dari 1 OAI Endpoint, deretan link tersebut akan di-_generate_ ke bilah samping (sidebar menu) secara bertingkat: *OAI Link 1*, *OAI Link 2*, dan seterusnya yang dapat diklik untuk menavigasi ke laman *backend* XML jurnal terkait.

### B. Role: User (Pengelola Jurnal Internal)
- **View File**: `resources/js/pages/User/Journals/Show.tsx`
- **Overview Area**: Kolom informasi OAI kini di-"render" dalam bentuk rincian *bullet list* tautan luar, menggantikan baris alamat tunggal versi lama.
- **Tabel Artikel**: Tabel tidak dipisah antar endpoint, melainkan artikel digabung ke dalam satu wadah kesatuan terpusat. Apabila artikel telah berhasil dipanen (*harvested*), ia akan langsung tampil selaras meliputi nama Jurnal, Penulis (Authors), dan Tanggal Terbit.
- **Tombol Aksi**: Indikator *Sync* & *Force Sync* secara reaktif mengevaluasi ketersediaan data pada *array* `oai_urls`. Jika belum ada satupun OAI yang ditambahkan, tombol ditangguhkan (disabled).

### C. Role: Admin Kampus (Pengawas PTMA)
- **View File**: `resources/js/pages/AdminKampus/Journals/Show.tsx`
- **Integrasi**: Berbagi kesepadanan UI dengan role User. Admin Kampus menggunakan antarmuka tab tabulasi (Tabs) `Overview`, `Artikel`, hingga jejak rekam *Last Harvest Log* yang merangkum gabungan impor artikel.
- **Kesimpulan Fungsional**: Memiliki kemampuan untuk meninjau secara mendalam bagaimana kondisi tabel artikel yang didapat di masing-masing platform jurnal di universitasnya tanpa disaring oleh filter khusus OAI.

### D. Role: Super Admin
- **View File**: `resources/js/pages/Admin/Journals/Show.tsx` & `app/Http/Controllers/Admin/JournalController.php`
- **Penambahan Tab UI Baru**: Sebelumnya, Super Admin tidak memiliki kapabilitas melirik maupun melakukan sinkronisasi artikel. Kini halaman `Show` milik Admin ditingkatkan dengan modul *Tabular Component* (Tab `"Overview"` dan Tab `"Artikel"`).
- **Aksi Operasional Baru**: Area tab "Artikel" ditambahkan deretan _Button Control_ untuk "**Sync Artikel**" dan "**Force Sync**", yang didukung oleh penambahan metode akses API di file `JournalController@harvest`.
- **Tabel Artikel**: Layaknya User dan Admin Kampus, Super Admin bisa meneliti rincian langsung keberadaan seluruh artikel di tabel terkait. Juga disematkan statistik rekaman proses (Logs) pada komponen atas daftar tabel.
