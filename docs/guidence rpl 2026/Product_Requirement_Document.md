# Product Requirement Document (PRD)

## Sistem Penelitian Terintegrasi

Dokumen ini berisi spesifikasi kebutuhan untuk 6 modul utama Sistem Penelitian Terintegrasi, disusun menggunakan standar format analisis kebutuhan (berdasarkan entitas modul utama). Dokumen ini telah diselaraskan dengan spesifikasi teknis dan antarmuka pada file penugasan.

---

### Manajemen Hak Akses (RBAC)
Sistem ini menggunakan mekanisme Role-Based Access Control (RBAC) dengan pembagian peran yang ketat untuk menjaga keamanan dan alur bisnis. Terdapat beberapa peran utama dalam sistem:
- **Super Admin**: Memiliki hak akses penuh (*global*) ke sistem. Mengelola pengaturan identitas aplikasi (`SettingsCtrl`) dan memantau seluruh log aktivitas sistem (`LogController`).
- **Admin Kampus (LPPM)**: Mengelola operasi dan alur akademik penelitian (Path: `Admin/`). Tugasnya meliputi verifikasi awal proposal, mem-plotting/menunjuk Reviewer, mengatur jadwal dan kriteria Monev, serta memverifikasi pengajuan Luaran Dosen.
- **Admin Keuangan**: Secara spesifik menangani alur dana penelitian (Path: `Finance/`). Bertugas me-generate kontrak, mengatur termin pencairan, dan melakukan validasi bukti transfer.
- **Reviewer**: Pakar yang ditugaskan (diplot) oleh Admin Kampus untuk mengevaluasi substansi proposal dan memberikan rekomendasi Diterima/Ditolak/Revisi.
- **Peneliti / Dosen**: Pengguna reguler yang mengajukan proposal, melaporkan progres (Monev), mengklaim pengeluaran dana, dan menyumbangkan luaran penelitian.

---

### 1. Manajemen Proposal Penelitian

**1. Definisi Entitas / Deskripsi Awal**
Modul ini digunakan untuk memfasilitasi dan mengelola proses pengajuan proposal penelitian oleh dosen atau peneliti, dari mulai pembuatan _draft_ hingga status akhir penerimaan atau penolakan.

**2. Data Requirements**

- `id_proposal` (Primary Key, Auto-increment)
- `id_pengusul` (Foreign Key ke tabel `users`, Required)
- `id_skema_pendanaan` (Foreign Key ke tabel `schemas`, Required)
- `judul_penelitian` (String, Required, Max: 255 karakter, Unique per pengusul di tahun pendanaan yang sama)
- `abstrak` (Text, Required, Max: 2000 karakter)
- `latar_belakang` (Text, Required)
- `file_dokumen_proposal` (String/URL, Required)
- `status_proposal` (Enum: Draft, Submitted, Administrasi_Valid, Ditolak; Default: Draft)
- `tanggal_pengajuan` (Date, Auto-generated)

**3. Business Rules**

- Hanya pengguna dengan peran (role) **Peneliti/Dosen** yang dapat mengajukan proposal.
- Admin/Operator melakukan proses verifikasi kelengkapan administrasi sebelum proposal masuk tahapan _review_.
- Proposal hanya dapat diedit jika status masih _Draft_ atau sedang dalam perbaikan administrasi (dikembalikan oleh Admin).
- Tidak diperbolehkan ada duplikasi judul penelitian dari pengusul yang sama dalam satu tahun pendanaan.

**4. Functional Requirements**

- **Create**: Formulir pembuatan pengajuan (input field metadata dan _upload file_ proposal).
- **Read**: Menampilkan daftar riwayat proposal bagi Peneliti (hanya proposal miliknya) dan Admin (seluruh proposal dengan opsi filter).
- **Update**: Pemrosesan _edit_ metadata dan pergantian _file upload_ saat revisi draft/administrasi.
- **Delete**: Fasilitas _soft-delete_ atau pembatalan pengajuan hanya saat berstatus _Draft_.

**5. Validation Rules**

- _Required_: Judul, Abstrak, Latar Belakang, Skema Pendanaan, File Dokumen wajib diisi. Pesan: "Field [Nama Field] tidak boleh kosong."
- _File Upload_: Ekstensi diwajibkan `.pdf` dengan ukuran maksimal 10MB. Pesan: "Dokumen harus berupa PDF maksimal 10MB."
- _Unique_: Judul duplikat. Pesan: "Anda sudah memiliki pengajuan dengan judul tersebut di periode ini."

**6. User Interface Requirements**

- **Peneliti**: Form _wizard_ input pengajuan (Step-by-step), daftar riwayat proposal dalam tabel berfitur _pagination_, dilengkapi indikator/badge warna status (_Draft: Abu-abu, Submitted: Biru, Valid: Hijau_).
- **Admin**: Halaman verifikasi dokumen dengan tampilan _side-by-side_ (_PDF viewer_ interaktif di sebelah kiri, form _checklist_ validasi di sebelah kanan).

**7. Integration Requirements**

- Terintegrasi secara data master pengguna (Dosen), Skema Pendanaan, dan menjadi penyuplai target data untuk Modul Reviewer dan Penilaian.

---

### 2. Manajemen Reviewer dan Penilaian

**1. Definisi Entitas / Deskripsi Awal**
Modul ini bertugas mengatur penunjukan (plotting) proposal ke reviewer, serta alur proses dan pengisian form evaluasi / penilaian (scoring rubrik) oleh pihak reviewer untuk memutuskan kelayakan suatu proposal riset.

**2. Data Requirements**

- `id_plot_reviewer` (Primary Key, Auto-increment)
- `id_proposal` (Foreign Key ke tabel `proposals`, Required)
- `id_reviewer` (Foreign Key ke tabel `users`, Required)
- `tanggal_mulai_review` (Date, Required)
- `tanggal_selesai_review` (Date, Required)
- `komponen_penilaian` (JSON/Tabel relasi `assessment_criteria`)
- `catatan_evaluasi` (Text, Required jika ada revisi/penolakan)
- `skor_total` (Numeric/Float, Default: 0)
- `keputusan_rekomendasi` (Enum: Diterima, Ditolak, Revisi)

**3. Business Rules**

- Pendelegasian (plotting) reviewer terhadap suatu proposal dilakukan mutlak oleh **Admin/LPPM**.
- Sebuah proposal dapat dinilai oleh lebih dari satu reviewer (nilai final akan dirata-rata).
- Reviewer terikat _timeline_; penilaian tidak dapat di-_submit_ apabila tenggat waktu penilaian sudah lewat.
- Keputusan final persetujuan (Diterima/Ditolak) ada pada kewenangan pimpinan LPPM berdasarkan hasil skor reviewer.

**4. Functional Requirements**

- **Create**: Admin membuat penugasan reviewer. Reviewer mengisi format form rubrik nilai.
- **Read**: Daftar plot tugas penilaian (_To do list_) untuk akun Reviewer. Rekap kalkulasi hasil score untuk Admin.
- **Update**: Admin mengganti pendelegasian reviewer. Reviewer memperbarui nilai (_Save Draft_) sebelum batas waktu berakhir dan melakukan submit final.
- **Delete**: Admin bisa membatalkan/menghapus _assignment_ reviewer dengan _soft-delete_ apabila reviewer berhalangan.

**5. Validation Rules**

- _Required_: Setiap indikator penilaian form rubrik wajib diisi angka skor. Pesan: "Nilai indikator [Nama Indikator] harus diisi."
- _Range limit_: Skor indikator minimal 0 dan maksimal 100. Pesan: "Skor tidak sah, harus berada di angka 0 - 100."
- _Required (Conditional)_: Catatan evaluasi diwajibkan bila status rekomendasi adalah _Revisi_ atau _Ditolak_.

**6. User Interface Requirements**

- **Reviewer**: Dashboard mini daftar penugasan evaluasi (_To-Do List_), _Dynamic rubrik form_ dengan auto-kalkulasi skor agregat secara _real-time_.
- **Admin**: Matriks _plotting_ tabel untuk pengawasan riwayat penugasan, matriks perbandingan nilai (jika _multiple reviewer_), dan tombol aksi "Keputusan Final".

**7. Integration Requirements**

- Mengubah otomatis `status_proposal` di Modul Proposal jika telah ada penetapan pimpinan.
- Mengirim notifikasi (email/in-app) kepada _Reviewer_ (penugasan baru) dan _Peneliti_ (hasil penilaian).

---

### 3. Manajemen Kontrak dan Pendanaan

**1. Definisi Entitas / Deskripsi Awal**
Modul untuk mengelola data kontrak, legalitas, rincian anggaran yang disetujui, penyusunan tahapan pencairan, serta pencatatan administrasi keuangan oleh peran **Admin Keuangan**.

**2. Data Requirements**

- `id_kontrak` (Primary Key)
- `nomor_kontrak` (String, Required, Unique)
- `id_proposal_diterima` (Foreign Key ke `proposals`, Required, Unique)
- `total_pendanaan_disetujui` (Numeric/Decimal, Required)
- `termin_pencairan` (Relasi tabel `fundings` - persentase, nominal, status)
- `bukti_dokumen_keuangan` (String/URL berkas, Optional/Required Conditionally)
- `status_kontrak` (Enum: Aktif, Selesai, Ditangguhkan)

**3. Business Rules**

- Modul Kontrak ini eksklusif untuk proposal yang sudah diputuskan "Diterima" oleh LPPM.
- Total kumulatif nominal per tahap termin jika dijumlahkan **wajib** sama persis (100%) dengan angka `total_pendanaan_disetujui`.
- Fitur administrasi pelunasan (input slip dan mengubah status tahapan dana) eksklusif untuk bagian **Keuangan / Operator / LPPM**.
- Pencairan untuk termin-termin lanjutan (misal: Tahap 2, Tahap 3) akan tertahan apabila _prerequisite_ Laporan Kemajuan (Antara) belum disetujui di Modul Monev.

**4. Functional Requirements**

- **Create**: _Generate_ / pembuatan draf kontrak baru dan penentuan alokasi pembayaran termin pencairan.
- **Read**: Tabel list seluruh data administrasi riset beserta riwayat / progres mutasi pembayarannya.
- **Update**: _Upload_ nota kuitansi pencairan dana (oleh keuangan) dan pengubahan status termin.
- **Delete**: Sangat dibatasi (Hanya fitur _Suspend/Ditangguhkan_), guna menjaga integritas data kontrak riil.

**5. Validation Rules**

- _Unique_: `nomor_kontrak` tidak boleh ganda di database. Pesan: "Nomor Kontrak sudah terdaftar sebelumnya."
- _Calculated Allocation_: Nominal tahapan jika di-sum nilainya di bawah/di atas nilai total dana → error message: "Total alokasi termin pencairan tidak sama dengan 100% total pendanaan yang disetujui."
- _File Upload_: File bukti pencairan hanya boleh berformat `.jpg`, `.png`, atau `.pdf` dengan ukuran maksimal 5MB.

**6. User Interface Requirements**

- Halaman _Digital Agreement_ / Detil Kontrak dilengkapi tombol _download_/cetak dokumen PDF.
- _Progress bar_ status serapan keuangan peneliti untuk melacak persentase serapan dana (yang sudah cair vs sisa).
- _Confirmation Dialog box_ konfirmasi aksi pelunasan termin setiap kali staf keuangan memproses tahap pencairan.

**7. Integration Requirements**

- Terintegrasi erat dengan penyelesaian target di **Modul Monev** (Laporan Antara) yang memvalidasi pembukaan akses pencairan termin lanjutan.

---

### 4. Monitoring dan Evaluasi (Monev) Penelitian

**1. Definisi Entitas / Deskripsi Awal**
Modul ini memfasilitasi pelaporan operasional riset di lapangan (_progress tracking_). Pemantauannya dilakukan secara berkala menggunakan logbook dan laporan (Laporan Kemajuan & Laporan Akhir) untuk menjamin akuntabilitas serta pemenuhan roadmap kegiatan.

**2. Data Requirements**

- `id_monev` (Primary Key)
- `id_kontrak` (Foreign Key ke tabel `contracts`, Required)
- `jenis_laporan` (Enum: Logbook, Laporan_Kemajuan, Laporan_Akhir, Required)
- `tanggal_pelaporan` (Date, Required)
- `persentase_progres` (Numeric, Range 0-100, Required)
- `deskripsi_kegiatan` (Text, Required)
- `file_dokumen_lampiran` (String/URL, Required)
- `catatan_evaluator` (Text, Optional)
- `status_monev` (Enum: Pending, Direview, Diterima, Ditolak; Default: Pending)

**3. Business Rules**

- Setiap peneliti wajib mendokumentasikan progres historis melalui entri logbook.
- Persetujuan terhadap dokumen _Laporan Kemajuan / Laporan Antara_ merupakan prasyarat mutlak untuk pencairan termin pendanaan berikutnya (terintegrasi ke Modul 3).
- Proses validasi atau evaluasi laporan dilakukan oleh evaluator yang ditunjuk oleh LPPM (atau reviewer bawaan).
- Pergeseran `persentase_progres` dari entri logbook yang baru tidak boleh mundur nilainya dari riwayat input sebelumnya (progres proyek harus terakumulasi maju).

**4. Functional Requirements**

- **Create**: _Submit_ unggah entri logbook harian/mingguan dan laporan kemajuan proyek.
- **Read**: _Timeline_ histori jejak pelaporan kegiatan (logbook list) yang dapat dipantau oleh Admin LPPM.
- **Update**: Penambahan catatan _feedback_/revisi evaluator pada logbook/laporan yang sudah di-_submit_.
- **Delete**: Mengoreksi atau membatalkan draf logbook hanya dalam rentang waktu yang diizinkan (misal: 24 jam setelah input).

**5. Validation Rules**

- _Number Range_: `persentase_progres` harus berada di nilai integer 0 - 100. Pesan: "Nilai progres harus antara rentang 0 hingga 100."
- _File Upload Required_: Setiap _submit_ Laporan Kemajuan / Akhir wajib menyertakan bukti. Pesan: "Bukti file dokumentasi laporan wajib dilampirkan."
- _Logical Validation_: Persentase entri logbook terbaru harus >= record logbook sebelumnya untuk ID Kontrak yang sama.

**6. User Interface Requirements**

- **Peneliti**: Dashboard _Monev_ dilengkapi presentasi visual _Gantt Chart_ atau grafik progress. Antarmuka input form logbook dibuat mobile-friendly agar entri lapangan mudah diproses.
- **LPPM**: Tabel pemantauan data grid _Monev_ yang menampilkan peringatan visual/badge bagi proyek yang progres-nya sangat lambat / stagnan, serta ditunjang oleh _real-time live search_.

**7. Integration Requirements**

- Menjadi kunci / saklar trigger pada sistem Modul 3 (Kontrak dan Pendanaan) untuk _unlock_ termin pencairan lanjutan.

---

### 5. Manajemen Luaran Penelitian

**1. Definisi Entitas / Deskripsi Awal**
Modul pencatatan capaian luaran fungsional riset (Publikasi, HKI, Buku, Prototipe) dari sebuah penelitian.

**2. Data Requirements**

- `id_luaran` (Primary Key)
- `id_kontrak` (Foreign Key, Required)
- `jenis_luaran` (Enum: Jurnal, HKI, Buku, Produk/Prototipe, Required)
- `judul_luaran` (String, Max 255, Required)
- `tahun_capaian` (Year, Required)
- `tautan_publikasi` (String URL / DOI; Required conditionally)
- `file_sertifikat_atau_cover` (String/URL dokumen otentikasi)
- `status_verifikasi` (Enum: Draft, Menunggu_Verifikasi, Terverifikasi_LPPM, Ditolak)

**3. Business Rules**

- Target luaran penelitian wajib dipenuhi sesuai dengan roadmap usulan proposal awal.
- Peneliti mendatar luaran sebagai _Draft_ / _Pending_. Pihak LPPM wajib melakukan _Verified / Approve_ proses tersebut sebelum poin kinerja luaran tersebut masuk ke pencatatan sistem agregat universitas.
- Aturan validasi (verifikasi LPPM) dikerjakan secara eksklusif untuk mencegah klaim tumpang-tindih (duplikasi) dari penelitian-penelitian ganda.

**4. Functional Requirements**

- **Create**: Formulir untuk mendeklarasikan wujud pencapaian _output_.
- **Read**: Membangun katalog arsip atau etalase portofolio produk karya ilmiah, bisa di-_filter_ berdasarkan peneliti, jenis, dan rentang tahun.
- **Update**: Peneliti mengedit field tautan dan berkas meta jika ditolak keabsahannya (dikembalikan statusnya) oleh verifikator LPPM.
- **Delete**: Pembatalan / hapus draf pengusulan luaran sebelum sempat diverifikasi.

**5. Validation Rules**

- _Dependency Validation_: Apabila `jenis_luaran` bernilai Jurnal / Prosiding, maka field `tautan_publikasi` wajib berbentuk URL (Regex validator tautan HTTP/HTTPS/DOI) yang valid. Pesan: "Tautan URL Jurnal / DOI invalid atau kosong."
- _File Validation_: Dokumen sertifikat atau sampul PDF/Gambar wajib kurang dari 5MB.

**6. User Interface Requirements**

- **Form Input Dinamis**: Field isian bereaksi secara reaktif / dinamis bergantung pada state pilihan drop-down `jenis_luaran`. (Misal: tidak menanyakan tautan DOI jika yang dipilih jenis "Prototipe", tapi menampilkan input "Deskripsi Prototipe").
- Tampilan Katalog atau Galeri Portofolio dalam _Grid/Bento_ layout atau _Table_ dilengkapi alat _filter_ untuk pencarian cepat jenis _output_.

**7. Integration Requirements**

- Modul ini adalah pemasok data pokok bagi statistik kinerja dan luaran pada Modul Eksekutif / Modul Dashboard Pelaporan.

---

### 6. Dashboard dan Pelaporan

**1. Definisi Entitas / Deskripsi Awal**
Modul analitik konklusif dan representasi grafis tingkat tinggi di platform. Dashboard berfokus memberikan metrik, pelaporan rekapitulasi, dan statistik performa penelitian berdasar pada data nyata (real-time) sehingga mendongkrak kemampuan _Decision Making_ bagi pimpinan maupun memonitor portofolio individual dosen.

**2. Data Requirements**
Sebagai entitas _Read-Only Data View_ (agregasi fungsional dari query antar modul di atas):

- Data Statistik Pengajuan: Total Proposal, Diterima, Ditolak (COUNT filter berdasar Skema & Tahun).
- Partisi Data Kontrak: Proposal Aktif berjalan, Skema Ditangguhkan, dan Selesai.
- Data Metrik Finansial: Serapan Anggaran Keseluruhan vs Disetujui (SUM termin).
- Indikator Luaran: Hitungan Pie Chart total sebaran Jenis Luaran (HKI, Jurnal, dsb).

**3. Business Rules**

- Dibatasi oleh _Tenant-scoping_ atau hierarki RBAC:
    - **Pimpinan Universitas / LPPM**: Bisa memantau cakupan laporan statistik penuh seluruh fakultas / universitas.
    - **Dosen / Peneliti**: Hanya diperbolehkan memantau panel analitik capaian kinerjanya miliknya sendiri (H-index mandiri, jumlah riset pribadi didanai, persentase keberhasilan individunya).
- Kinerja dapat dikalkulasi basis per tahun, sehingga fungsi cetak laporan tahunan berjalan krusial.

**4. Functional Requirements**

- **Create**: Mem-produksi dan mengekspor dokumen laporan statik (Generate ke `.pdf`, `.xls`, `.csv`).
- **Read**: Menampilkan angka metrik indikator kinerja, rekapitulasi data _Query JOIN_ terurut tanpa memungkinkan mutasi data di sisi ini.
- **Update**: Tidak terpakai (Hanya merubah filter state tahun / parameter _client side_).
- **Delete**: Tidak terpakai.

**5. Validation Rules**

- _Filter Date Validation_: Batas limit opsi pencarian parameter _range_ waktu. Tahun `Filter Awal` tidak boleh lebih lambat daripada `Filter Akhir`. Pesan: "Periode waktu awal dan akhir pencarian data tidak valid."
- _Data Scope Verification_: Setiap reuest API Dashboard mem-validasi kembali via middleware `user_id` session auth, periksa relasi dosen terkait agar terhindar bypass celah keamanan pengikatan institusi fakultas.

**6. User Interface Requirements**

- **KPI Score Cards**: Posisi teratas dashboard meletakkan _Top Metric Blok_ (Highlight angka esensial terangkum).
- **Interactive Data Visualization**: _Client-side charting_ (Line, Bar, Doughnut chart) berbasis pada lib grafik, di mana saat tooltip di-hover menunjukkan data interaktif.
- **Tabel Pelaporan Generik**: Menampilkan _Data Grid_ yang memiliki kolom serbaguna dan utilitas faset pencarian _Advanced Filter_ multifungsi (Dropdown, Checkbox centang status, Pilihan skema). Semua _grid search_ selaras dengan tombol "Eksport Laporan".

**7. Integration Requirements**

- Memanfaatkan dan mengkonsolidasikan data secara murni _Read Only_ dari Modul Spesifik 1, Modul 2, Modul 3, Modul 4, hingga Modul 5.
