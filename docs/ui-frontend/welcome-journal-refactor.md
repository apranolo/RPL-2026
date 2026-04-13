# UI/UX Refactor: Welcome Page & Journals Page

## Ringkasan Eksekutif
Sesuai dengan saran dosen pembimbing, terdapat penyesuaian rancangan antarmuka pada tampilan awal (*Welcome Page*) dan halaman daftar jurnal (*Journals Page*) untuk menitikberatkan informasi secara lebih tepat guna.

### 1. Welcome Page (Home Page)
- **Komponen Diganti:** Card persentase atau rekapitulasi SINTA (dari 1–6) yang awalnya berada di tengah layar telah **dipindah sepenuhnya** ke halaman *Journals*.
- **Komponen Baru:** Ditambahkan *Statistical Cards* baru (3 kolom) yang merepresentasikan data akumulasi sistem:
  - **Total Journals**: Menghitung seluruh jurnal yang statusnya sedang `is_active = true`.
  - **Total Articles**: Menghitung seluruh kumpulan artikel yang ter-harvest atau tercatat di database (model `Article`).
  - **Total Universities**: Menghitung jumlah keseluruhan Perguruan Tinggi yang aktif dan telah memiliki **minimal 1 jurnal aktif**.

### 2. Journals Page
- **Penggabungan Card SINTA**: 6 Card SINTA (`SINTA 1` hingga `SINTA 6`) dihadirkan pada area tepat sebelum modul filter dan *search bar*. Pengguna bisa langsung meng-klik card tersebut untuk men-trigger pencarian list journal spesifik ke ranking SINTA tertentu.
- **Penambahan Indexation Cards**: Terdapat baris baru di bawahnya yang berisi 6 kartu representasi data integrasi indeksasi. Komponen card ini menonjolkan indeks database sebagai berikut:
  - Scopus
  - Web of Science (WOS)
  - DOAJ
  - Dimensions
  - EBSCO
  - ProQuest
- Kartu-kartu ini menggunakan skema dan komponen visual yang senada dengan Card SINTA dan mem-bypass query indexation ketika di-klik.

### 3. Backend & Services (Infrastruktur Data)
- Modifikasi logika query dilakukan pada layer `PublicHomeService.php`.
- Menambahkan method baru `getIndexationStats()` untuk menghitung perulangan status indexation (yang diselidiki melalui operan `whereJsonContains('indexations', $platform)` mengingat field tersebut di set array JSON di database).
- Modifikasi scope hitungan Total University `->whereHas('journals')` agar representatif dengan jumlah entitas kampus yang terintegrasi publikasinya.
- Controller `PublicJournalController.php` telah disesuaikan agar mengirimkan prop baru `$indexationStats` dan `$sintaStats` kepada Inertia Page (`Journals/Index`).

## Testing & Quality Assurance
Sudah dilengkapi dengan *Unit/Feature Tests* untuk memastikan logic response Inertia memiliki format yang benar. Berkas terkait: `tests/Feature/PublicJournalTest.php` dan update pada parameter asset *Home* di `tests/Feature/PublicHomeTest.php`. Semua test yang dieksekusi menghasilkan sinyal valid **🟢 PASS**.