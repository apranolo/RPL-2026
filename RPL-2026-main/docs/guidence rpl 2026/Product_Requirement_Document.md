# Product Requirement Document (PRD)
## Sistem Penelitian Terintegrasi

Dokumen ini berisi spesifikasi kebutuhan untuk 6 modul utama Sistem Penelitian Terintegrasi, disusun menggunakan standar format analisis kebutuhan (berdasarkan entitas modul utama).

---

### 1. Manajemen Proposal Penelitian

**1. Definisi Entitas / Deskripsi Awal**
Modul ini digunakan untuk memfasilitasi dan mengelola proses pengajuan proposal penelitian oleh dosen atau peneliti, dari mulai pembuatan *draft* hingga status akhir penerimaan atau penolakan.

**2. Data Requirements**
- `id_proposal` (Primary Key, Auto-increment)
- `id_pengusul` (Foreign Key ke tabel `users`, Required)
- `id_skema_pendanaan` (Foreign Key ke tabel `skema`, Required)
- `judul_penelitian` (String, Required, Max: 255 karakter, Unique per pengusul di tahun pendanaan yang sama)
- `abstrak` (Text, Required, Max: 2000 karakter)
- `latar_belakang` (Text, Required)
- `file_dokumen_proposal` (String/URL, Required)
- `status_proposal` (Enum: Draft, Submitted, Administrasi_Valid, Ditolak; Default: Draft)
- `tanggal_pengajuan` (Date, Auto-generated)

**3. Business Rules**
- Hanya pengguna dengan peran (role) **Peneliti/Dosen** yang dapat mengajukan proposal.
- Admin/Operator melakukan proses verifikasi kelengkapan administrasi sebelum proposal masuk tahapan *review*.
- Proposal hanya dapat diedit jika status masih *Draft* atau sedang dalam perbaikan administrasi (dikembalikan oleh Admin).
- Tidak diperbolehkan ada duplikasi judul penelitian dari pengusul yang sama dalam satu tahun pendanaan.

**4. Functional Requirements**
- **Create**: Formulir pembuatan pengajuan (input field metadata dan *upload file* proposal).
- **Read**: Menampilkan daftar riwayat proposal bagi Peneliti (hanya proposal miliknya) dan Admin (seluruh proposal dengan opsi filter).
- **Update**: Pemrosesan *edit* metadata dan pergantian *file upload* saat revisi draft/administrasi.
- **Delete**: Fasilitas *soft-delete* atau pembatalan pengajuan hanya saat berstatus *Draft*.

**5. Validation Rules**
- *Required*: Judul, Abstrak, Latar Belakang, Skema Pendanaan, File Dokumen wajib diisi. Pesan: "Field [Nama Field] tidak boleh kosong."
- *File Upload*: Ekstensi diwajibkan `.pdf` dengan ukuran maksimal 10MB. Pesan: "Dokumen harus berupa PDF maksimal 10MB."
- *Unique*: Judul duplikat. Pesan: "Anda sudah memiliki pengajuan dengan judul tersebut di periode ini."

**6. User Interface Requirements**
- **Peneliti**: Form *wizard* input pengajuan (Step-by-step), daftar riwayat proposal dalam tabel berfitur *pagination*, dilengkapi indikator/badge warna status (*Draft: Abu-abu, Submitted: Biru, Valid: Hijau*).
- **Admin**: Halaman verifikasi dokumen dengan tampilan *side-by-side* (*PDF viewer* interaktif di sebelah kiri, form *checklist* validasi di sebelah kanan).

**7. Integration Requirements**
- Terintegrasi secara data master pengguna (Dosen), Skema Pendanaan, dan menjadi penyuplai target data untuk Modul Reviewer dan Penilaian.

---

### 2. Manajemen Reviewer dan Penilaian

**1. Definisi Entitas / Deskripsi Awal**
Modul ini bertugas mengatur penunjukan (plotting) proposal ke reviewer, serta alur proses dan pengisian form evaluasi / penilaian (scoring rubrik) oleh pihak reviewer untuk memutuskan kelayakan suatu proposal riset.

**2. Data Requirements**
- `id_plot_reviewer` (Primary Key, Auto-increment)
- `id_proposal` (Foreign Key ke tabel `proposal`, Required)
- `id_reviewer` (Foreign Key ke tabel `users`, Required)
- `tanggal_mulai_review` (Date, Required)
- `tanggal_selesai_review` (Date, Required)
- `komponen_penilaian` (JSON/Tabel relasi skor indikator)
- `catatan_evaluasi` (Text, Required jika ada revisi/penolakan)
- `skor_total` (Numeric/Float, Default: 0)
- `keputusan_rekomendasi` (Enum: Diterima, Ditolak, Revisi)

**3. Business Rules**
- Pendelegasian (plotting) reviewer terhadap suatu proposal dilakukan mutlak oleh **Admin/LPPM**.
- Sebuah proposal dapat dinilai oleh lebih dari satu reviewer (nilai final akan dirata-rata).
- Reviewer terikat *timeline*; penilaian tidak dapat di-*submit* apabila tenggat waktu penilaian sudah lewat.
- Keputusan final persetujuan (Diterima/Ditolak) ada pada kewenangan pimpinan LPPM berdasarkan hasil skor reviewer.

**4. Functional Requirements**
- **Create**: Admin membuat penugasan reviewer. Reviewer mengisi format form rubrik nilai.
- **Read**: Daftar plot tugas penilaian (*To do list*) untuk akun Reviewer. Rekap kalkulasi hasil score untuk Admin.
- **Update**: Admin mengganti pendelegasian reviewer. Reviewer memperbarui nilai (*Save Draft*) sebelum batas waktu berakhir dan melakukan submit final.
- **Delete**: Admin bisa membatalkan/menghapus *assignment* reviewer dengan *soft-delete* apabila reviewer berhalangan.

**5. Validation Rules**
- *Required*: Setiap indikator penilaian form rubrik wajib diisi angka skor. Pesan: "Nilai indikator [Nama Indikator] harus diisi."
- *Range limit*: Skor indikator minimal 0 dan maksimal 100. Pesan: "Skor tidak sah, harus berada di angka 0 - 100."
- *Required (Conditional)*: Catatan evaluasi diwajibkan bila status rekomendasi adalah *Revisi* atau *Ditolak*.

**6. User Interface Requirements**
- **Reviewer**: Dashboard mini daftar penugasan evaluasi (*To-Do List*), *Dynamic rubrik form* dengan auto-kalkulasi skor agregat secara *real-time*.
- **Admin**: Matriks *plotting* tabel untuk pengawasan riwayat penugasan, matriks perbandingan nilai (jika *multiple reviewer*), dan tombol aksi "Keputusan Final".

**7. Integration Requirements**
- Mengubah otomatis `status_proposal` di Modul Proposal jika telah ada penetapan pimpinan.
- Mengirim notifikasi (email/in-app) kepada *Reviewer* (penugasan baru) dan *Peneliti* (hasil penilaian).

---

### 3. Manajemen Kontrak dan Pendanaan

**1. Definisi Entitas / Deskripsi Awal**
Modul untuk mengelola data kontrak, legalitas, rincian anggaran yang disetujui LPPM, penyusunan tahapan pencairan, serta pencatatan administrasi keuangan proyek riset yang bersangkutan (proposal lulus seleksi).

**2. Data Requirements**
- `id_kontrak` (Primary Key)
- `nomor_kontrak` (String, Required, Unique)
- `tanggal_kontrak` (Date, Required)
- `id_proposal_diterima` (Foreign Key, Required, Unique One-to-One)
- `pihak_1` (String, Required / Pihak LPPM)
- `pihak_2` (String, Required / Pihak Peneliti Utama)
- `total_pendanaan_disetujui` (Numeric/Decimal, Required)
- `termin_pencairan` (JSON/Relational Table - rincian tahapan: persentase, nominal, status)
- `bukti_dokumen_keuangan` (String/URL berkas Slip Transfer, Optional/Required Conditionally)
- `status_kontrak` (Enum: Aktif, Selesai, Ditangguhkan)

**3. Business Rules**
- Modul Kontrak ini eksklusif untuk proposal yang sudah diputuskan "Diterima" oleh LPPM.
- Total kumulatif nominal per tahap termin jika dijumlahkan **wajib** sama persis (100%) dengan angka `total_pendanaan_disetujui`.
- Fitur administrasi pelunasan (input slip dan mengubah status tahapan dana) eksklusif untuk bagian **Keuangan / Operator / LPPM**.
- Pencairan untuk termin-termin lanjutan (misal: Tahap 2, Tahap 3) akan tertahan apabila *prerequisite* Laporan Kemajuan (Antara) belum disetujui di Modul Monev.

**4. Functional Requirements**
- **Create**: *Generate* / pembuatan draf kontrak baru dan penentuan alokasi pembayaran termin pencairan.
- **Read**: Tabel list seluruh data administrasi riset beserta riwayat / progres mutasi pembayarannya.
- **Update**: *Upload* nota kuitansi pencairan dana (oleh keuangan) dan pengubahan status termin.
- **Delete**: Sangat dibatasi (Hanya fitur *Suspend/Ditangguhkan*), guna menjaga integritas data kontrak riil.

**5. Validation Rules**
- *Unique*: `nomor_kontrak` tidak boleh ganda di database. Pesan: "Nomor Kontrak sudah terdaftar sebelumnya."
- *Calculated Allocation*: Nominal tahapan jika di-sum nilainya di bawah/di atas nilai total dana → error message: "Total alokasi termin pencairan tidak sama dengan 100% total pendanaan yang disetujui."
- *File Upload*: File bukti pencairan hanya boleh berformat `.jpg`, `.png`, atau `.pdf` dengan ukuran maksimal 5MB. 

**6. User Interface Requirements**
- Halaman *Digital Agreement* / Detil Kontrak dilengkapi tombol *download*/cetak dokumen PDF.
- *Progress bar* status serapan keuangan peneliti untuk melacak persentase serapan dana (yang sudah cair vs sisa).
- *Confirmation Dialog box* konfirmasi aksi pelunasan termin setiap kali staf keuangan memproses tahap pencairan.

**7. Integration Requirements**
- Terintegrasi erat dengan penyelesaian target di **Modul Monev** (Laporan Antara) yang memvalidasi pembukaan akses pencairan termin lanjutan.

---

### 4. Monitoring dan Evaluasi (Monev) Penelitian

**1. Definisi Entitas / Deskripsi Awal**
Modul ini memfasilitasi pelaporan operasional riset di lapangan (*progress tracking*). Pemantauannya dilakukan secara berkala menggunakan logbook dan laporan (Laporan Kemajuan & Laporan Akhir) untuk menjamin akuntabilitas serta pemenuhan roadmap kegiatan.

**2. Data Requirements**
- `id_monev` (Primary Key)
- `id_kontrak` (Foreign Key ke tabel `kontrak`, Required)
- `jenis_laporan` (Enum: Logbook, Laporan_Kemajuan, Laporan_Akhir, Required)
- `tanggal_pelaporan` (Date, Required)
- `persentase_progres` (Numeric, Range 0-100, Required)
- `deskripsi_kegiatan` (Text, Required)
- `file_dokumen_lampiran` (String/URL, Required)
- `catatan_evaluator` (Text, Optional)
- `status_monev` (Enum: Pending, Direview, Diterima, Ditolak; Default: Pending)

**3. Business Rules**
- Setiap peneliti wajib mendokumentasikan progres historis melalui entri logbook.
- Persetujuan terhadap dokumen *Laporan Kemajuan / Laporan Antara* merupakan prasyarat mutlak untuk pencairan termin pendanaan berikutnya (terintegrasi ke Modul 3).
- Proses validasi atau evaluasi laporan dilakukan oleh evaluator yang ditunjuk oleh LPPM (atau reviewer bawaan).
- Pergeseran `persentase_progres` dari entri logbook yang baru tidak boleh mundur nilainya dari riwayat input sebelumnya (progres proyek harus terakumulasi maju).

**4. Functional Requirements**
- **Create**: *Submit* unggah entri logbook harian/mingguan dan laporan kemajuan proyek. 
- **Read**: *Timeline* histori jejak pelaporan kegiatan (logbook list) yang dapat dipantau oleh Admin LPPM.
- **Update**: Penambahan catatan *feedback*/revisi evaluator pada logbook/laporan yang sudah di-*submit*. 
- **Delete**: Mengoreksi atau membatalkan draf logbook hanya dalam rentang waktu yang diizinkan (misal: 24 jam setelah input).

**5. Validation Rules**
- *Number Range*: `persentase_progres` harus berada di nilai integer 0 - 100. Pesan: "Nilai progres harus antara rentang 0 hingga 100."
- *File Upload Required*: Setiap *submit* Laporan Kemajuan / Akhir wajib menyertakan bukti. Pesan: "Bukti file dokumentasi laporan wajib dilampirkan."
- *Logical Validation*: Persentase entri logbook terbaru harus >= record logbook sebelumnya untuk ID Kontrak yang sama.

**6. User Interface Requirements**
- **Peneliti**: Dashboard *Monev* dilengkapi presentasi visual *Gantt Chart* atau grafik progress. Antarmuka input form logbook dibuat mobile-friendly agar entri lapangan mudah diproses.
- **LPPM**: Tabel pemantauan data grid *Monev* yang menampilkan peringatan visual/badge bagi proyek yang progres-nya sangat lambat / stagnan, serta ditunjang oleh *real-time live search*.

**7. Integration Requirements**
- Menjadi kunci / saklar trigger pada sistem Modul 3 (Kontrak dan Pendanaan) untuk *unlock* termin pencairan lanjutan.

---

### 5. Manajemen Luaran Penelitian

**1. Definisi Entitas / Deskripsi Awal**
Modul pencatatan seluruh rekam jejak capaian akhir produk atau karya intelektual (output fungsional riset) yang dihasilkan dari sebuah penelitian (seperti Publikasi, Buku, Paten, atau Prototipe).

**2. Data Requirements**
- `id_luaran` (Primary Key)
- `id_kontrak` (Foreign Key, Required)
- `jenis_luaran` (Enum: Jurnal_Nasional, Jurnal_Internasional, Prosiding, HKI, Buku, Prototipe, Required)
- `judul_luaran` (String, Max 255, Required)
- `tahun_capaian` (Year, Required)
- `penulis_atau_pencipta` (String/Text, Required)
- `tautan_publikasi` (String URL / DOI; Required conditionally berdasar jenis luaran)
- `file_sertifikat_atau_cover` (String/URL dokumen otentikasi, Required)
- `status_verifikasi` (Enum: Draft, Menunggu_Verifikasi, Terverifikasi_LPPM, Ditolak)

**3. Business Rules**
- Target luaran penelitian wajib dipenuhi sesuai dengan roadmap usulan proposal awal.
- Peneliti mendatar luaran sebagai *Draft* / *Pending*. Pihak LPPM wajib melakukan *Verified / Approve* proses tersebut sebelum poin kinerja luaran tersebut masuk ke pencatatan sistem agregat universitas.
- Aturan validasi (verifikasi LPPM) dikerjakan secara eksklusif untuk mencegah klaim tumpang-tindih (duplikasi) dari penelitian-penelitian ganda.

**4. Functional Requirements**
- **Create**: Formulir untuk mendeklarasikan wujud pencapaian *output*.
- **Read**: Membangun katalog arsip atau etalase portofolio produk karya ilmiah, bisa di-*filter* berdasarkan peneliti, jenis, dan rentang tahun.
- **Update**: Peneliti mengedit field tautan dan berkas meta jika ditolak keabsahannya (dikembalikan statusnya) oleh verifikator LPPM.
- **Delete**: Pembatalan / hapus draf pengusulan luaran sebelum sempat diverifikasi.

**5. Validation Rules**
- *Dependency Validation*: Apabila `jenis_luaran` bernilai Jurnal / Prosiding, maka field `tautan_publikasi` wajib berbentuk URL (Regex validator tautan HTTP/HTTPS/DOI) yang valid. Pesan: "Tautan URL Jurnal / DOI invalid atau kosong."
- *File Validation*: Dokumen sertifikat atau sampul PDF/Gambar wajib kurang dari 5MB.

**6. User Interface Requirements**
- **Form Input Dinamis**: Field isian bereaksi secara reaktif / dinamis bergantung pada state pilihan drop-down `jenis_luaran`. (Misal: tidak menanyakan tautan DOI jika yang dipilih jenis "Prototipe", tapi menampilkan input "Deskripsi Prototipe").
- Tampilan Katalog atau Galeri Portofolio dalam *Grid/Bento* layout atau *Table* dilengkapi alat *filter* untuk pencarian cepat jenis *output*.

**7. Integration Requirements**
- Modul ini adalah pemasok data pokok bagi statistik kinerja dan luaran pada Modul Eksekutif / Modul Dashboard Pelaporan.

---

### 6. Dashboard dan Pelaporan

**1. Definisi Entitas / Deskripsi Awal**
Modul analitik konklusif dan representasi grafis tingkat tinggi di platform. Dashboard berfokus memberikan metrik, pelaporan rekapitulasi, dan statistik performa penelitian berdasar pada data nyata (real-time) sehingga mendongkrak kemampuan *Decision Making* bagi pimpinan maupun memonitor portofolio individual dosen.

**2. Data Requirements**
Sebagai entitas *Read-Only Data View* (agregasi fungsional dari query antar modul di atas):
- Data Statistik Pengajuan: Total Proposal, Diterima, Ditolak (COUNT filter berdasar Skema & Tahun).
- Partisi Data Kontrak: Proposal Aktif berjalan, Skema Ditangguhkan, dan Selesai.
- Data Metrik Finansial: Serapan Anggaran Keseluruhan vs Disetujui (SUM termin).
- Indikator Luaran: Hitungan Pie Chart total sebaran Jenis Luaran (HKI, Jurnal, dsb).

**3. Business Rules**
- Dibatasi oleh *Tenant-scoping* atau hierarki RBAC:
  - **Pimpinan Universitas / LPPM**: Bisa memantau cakupan laporan statistik penuh seluruh fakultas / universitas.
  - **Dosen / Peneliti**: Hanya diperbolehkan memantau panel analitik capaian kinerjanya miliknya sendiri (H-index mandiri, jumlah riset pribadi didanai, persentase keberhasilan individunya).
- Kinerja dapat dikalkulasi basis per tahun, sehingga fungsi cetak laporan tahunan berjalan krusial.

**4. Functional Requirements**
- **Create**: Mem-produksi dan mengekspor dokumen laporan statik (Generate ke `.pdf`, `.xls`, `.csv`). 
- **Read**: Menampilkan angka metrik indikator kinerja, rekapitulasi data *Query JOIN* terurut tanpa memungkinkan mutasi data di sisi ini.
- **Update**: Tidak terpakai (Hanya merubah filter state tahun / parameter *client side*).
- **Delete**: Tidak terpakai.

**5. Validation Rules**
- *Filter Date Validation*: Batas limit opsi pencarian parameter *range* waktu. Tahun `Filter Awal` tidak boleh lebih lambat daripada `Filter Akhir`. Pesan: "Periode waktu awal dan akhir pencarian data tidak valid."
- *Data Scope Verification*: Setiap reuest API Dashboard mem-validasi kembali via middleware `user_id` session auth, periksa relasi dosen terkait agar terhindar bypass celah keamanan pengikatan institusi fakultas.

**6. User Interface Requirements**
- **KPI Score Cards**: Posisi teratas dashboard meletakkan *Top Metric Blok* (Highlight angka esensial terangkum).
- **Interactive Data Visualization**: *Client-side charting* (Line, Bar, Doughnut chart) berbasis pada lib grafik, di mana saat tooltip di-hover menunjukkan data interaktif.
- **Tabel Pelaporan Generik**: Menampilkan *Data Grid* yang memiliki kolom serbaguna dan utilitas faset pencarian _Advanced Filter_ multifungsi (Dropdown, Checkbox centang status, Pilihan skema). Semua *grid search* selaras dengan tombol "Eksport Laporan".

**7. Integration Requirements**
- Memanfaatkan dan mengkonsolidasikan data secara murni *Read Only* dari Modul Spesifik 1, Modul 2, Modul 3, Modul 4, hingga Modul 5.
