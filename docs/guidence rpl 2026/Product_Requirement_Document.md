# Product Requirement Document (PRD)

## Sistem Penelitian Terintegrasi (Kelas B)

Dokumen ini berisi spesifikasi kebutuhan untuk 6 modul utama Sistem Penelitian Terintegrasi, disusun menggunakan standar format analisis kebutuhan (berdasarkan entitas modul utama). Dokumen ini telah diselaraskan dengan spesifikasi teknis dan antarmuka pada file penugasan.

---

### Manajemen Hak Akses (RBAC)

Sistem ini menggunakan mekanisme Role-Based Access Control (RBAC) dengan pembagian peran yang ketat untuk menjaga keamanan dan alur bisnis. Terdapat beberapa peran utama dalam sistem:

- **Super Admin**: Memiliki hak akses penuh (_global_) ke sistem. Mengelola pengaturan identitas aplikasi (`SettingsCtrl`) dan memantau seluruh log aktivitas sistem (`LogController`).
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
- **Admin Kampus / LPPM** melakukan proses verifikasi kelengkapan administrasi sebelum proposal masuk tahapan _review_.
- Proposal hanya dapat diedit jika status masih _Draft_ atau sedang dalam perbaikan administrasi (dikembalikan oleh Admin).
- Tidak diperbolehkan ada duplikasi judul penelitian dari pengusul yang sama dalam satu tahun pendanaan.

**4. Functional Requirements**

- **Create**: Formulir pembuatan pengajuan (input field metadata dan _upload file_ proposal). Di-handle oleh `ProposalController@create` dan `store`.
- **Read**: Menampilkan daftar riwayat proposal bagi Peneliti (di `ProposalController@index`) dan Admin Kampus (di `Admin/ProposalController@index`).
- **Update**: Pemrosesan _edit_ metadata (`ProposalController@edit`, `update`) dan pergantian _file upload_ (`DocumentController@upload`).
- **Delete**: Fasilitas _soft-delete_ atau pembatalan pengajuan hanya saat berstatus _Draft_ (`ProposalController@destroy`).

**5. Validation Rules**

- _Required_: Judul, Abstrak, Latar Belakang, Skema Pendanaan, File Dokumen wajib diisi via `StoreProposalRequest`. Pesan: "Field [Nama Field] tidak boleh kosong."
- _File Upload_: Ekstensi diwajibkan `.pdf` dengan ukuran maksimal 10MB. Pesan: "Dokumen harus berupa PDF maksimal 10MB."
- _Unique_: Judul duplikat. Pesan: "Anda sudah memiliki pengajuan dengan judul tersebut di periode ini."

**6. User Interface Requirements**

- **Peneliti**:
    - Halaman daftar pengajuan (`resources/js/pages/Proposal/Index.tsx`): Menampilkan tabel riwayat proposal yang diajukan oleh dosen beserta badge statusnya (Draft, Submitted, dll) dan tombol aksi (Edit/Hapus untuk Draft, Lihat untuk lainnya). Berfungsi untuk melacak progres proposal.
    - Halaman pengajuan / form baru (`resources/js/pages/Proposal/Create.tsx`) dan edit (`Edit.tsx`): Menampilkan formulir input (judul, abstrak, skema) yang responsif dengan validasi form. Berfungsi sebagai antarmuka utama pengisian data proposal.
    - Komponen file uploader (`resources/js/components/FileUploader.tsx`): Area _Dropzone_ (Drag & Drop) interaktif yang memberikan _feedback_ visual saat file ditarik ke dalamnya, lengkap dengan indikator proses unggah. Berfungsi untuk mengunggah dokumen PDF.
- **Admin Kampus**:
    - Halaman verifikasi dan list (`resources/js/pages/Admin/Proposal/Index.tsx`): Tabel daftar seluruh proposal masuk dari dosen. Berfungsi untuk memudahkan admin menyaring dan mencari proposal yang butuh verifikasi administrasi.
    - Komponen verifikasi (`resources/js/components/ActionButtons.tsx`): Berupa tombol grup interaktif (Approve warna hijau, Reject warna merah) yang memunculkan pop-up konfirmasi (dan isian alasan penolakan). Berfungsi untuk mengeksekusi putusan verifikasi administrasi.

**7. Integration Requirements**

- Integrasi _backend_ API untuk Skema di `SchemaResource.php`.
- Tersedia integrasi dengan Kelas G jika diperlukan (opsional). Modul ini memasok data referensi untuk plotting Reviewer di Modul 2.

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

- Pendelegasian (plotting) reviewer terhadap suatu proposal dilakukan mutlak oleh **Admin Kampus/LPPM**.
- Sebuah proposal dapat dinilai oleh lebih dari satu reviewer (nilai final akan dihitung melalui `ReviewCalculationService`).
- Reviewer terikat _timeline_; penilaian tidak dapat di-_submit_ apabila tenggat waktu penilaian sudah lewat.
- Keputusan final persetujuan (Diterima/Ditolak) ada pada kewenangan pimpinan LPPM berdasarkan hasil skor reviewer.

**4. Functional Requirements**

- **Create**: Admin Kampus menunjuk reviewer via `Admin/AssignController@assign`. Admin Kampus dapat menentukan kriteria evaluasi baru via `Admin/CriteriaController@store`.
- **Read**: Reviewer memiliki dashboard (_To do list_) dari penugasan via `ReviewerController@index`.
- **Update**: Reviewer melakukan penyimpanan / kalkulasi poin via `ReviewController@storeAssessment` dan `updateAssessment`.
- **Delete**: Admin Kampus dapat mencabut pendelegasian via `Admin/AssignController@unassign`.

**5. Validation Rules**

- _Required_: Setiap indikator penilaian wajib diisi melalui `StoreReviewRequest`.
- _Range limit_: Skor indikator disesuaikan kriteria, misalnya 1-10 atau persentase, total harus valid 0-100.
- _Required (Conditional)_: Catatan evaluasi diwajibkan bila status rekomendasi adalah _Revisi_ atau _Ditolak_.

**6. User Interface Requirements**

- **Admin Kampus**:
    - Tampilan _plotting_ (`resources/js/pages/Admin/Reviewer/Assign.tsx`): Halaman yang menyandingkan daftar proposal dengan _dropdown_ pencarian Reviewer, memudahkan admin memasangkan proposal dengan pakar yang tepat.
    - Modal konfirmasi penugasan (`resources/js/components/AssignModal.tsx`): Pop-up dialog untuk mengkonfirmasi penugasan reviewer yang berisi ringkasan data, berfungsi untuk menghindari kesalahan klik _assign_.
    - Halaman penjadwalan review (`resources/js/pages/Admin/Reviewer/Schedule.tsx`) terintegrasi `DatePicker.tsx`: Halaman khusus dengan antarmuka kalender interaktif untuk memilih rentang tanggal mulai dan selesai _review_. Berfungsi untuk menetapkan _timeline_ evaluasi secara intuitif.
    - Tabel rekapitulasi penilaian akhir (`resources/js/pages/Admin/Reviewer/Summary.tsx`): Tabel analitik yang meringkas nilai rata-rata dari multi-reviewer beserta warna status kelulusan. Berfungsi untuk membantu pimpinan LPPM memutus hasil akhir.
    - Pengelolaan parameter kriteria penilaian (`resources/js/pages/Admin/Criteria/Index.tsx`) dan input dinamis (`resources/js/components/DynamicInput.tsx`): Antarmuka pengaturan master data di mana admin bisa menambah/mengurangi kriteria penilaian (tambah baris dinamis). Berfungsi membangun form rubrik secara kustom.
- **Reviewer**:
    - Halaman daftar evaluasi (`resources/js/pages/Reviewer/Index.tsx`): Dashboard minimalis berisikan _To-do List_ proposal yang perlu dinilai, lengkap dengan indikator sisa hari (countdown). Berfungsi mengorganisasi beban kerja reviewer.
    - Halaman pengisian skor (`resources/js/pages/Reviewer/FormReview.tsx`): Form rubrik interaktif yang melakukan kalkulasi total skor agregat secara _real-time_ saat Reviewer mengetik/memilih nilai. Berfungsi memberikan pengalaman penilaian yang efisien.
- **Umum**:
    - Lonceng notifikasi (`resources/js/components/NotificationBell.tsx`): Ikon lonceng di _Navbar_ atas dengan indikator angka merah _unread_. Berfungsi memberi peringatan seketika (alert) kepada pengguna saat ada penugasan baru.

**7. Integration Requirements**

- Fitur penarikan data notifikasi secara otomatis oleh sistem saat _Assign_ dilakukan (`NotificationController@notifyReviewer`).

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
- Pihak **Admin Keuangan** menyusun draft dan tahapan (termin) dari kontrak ini. Total kumulatif nominal per tahap harus sama persis (100%) dengan angka `total_pendanaan_disetujui`.
- Pencairan untuk termin lanjutan (Tahap 2 dst) akan tertahan apabila _prerequisite_ Laporan Kemajuan (Antara) belum disetujui di Modul Monev.
- Peneliti harus melengkapi data Bank/Rekening.

**4. Functional Requirements**

- **Create**: _Generate_ draft kontrak (`ContractController@generate`) dan penambahan data termin (`FundingController@storeTermin`).
- **Read**: Tabel _monitoring_ keuangan bagi Admin Keuangan (`FinanceReportController@summary`) dan tampilan info dana bagi Dosen (`UserFundingController@index`).
- **Update**: Upload bukti pencairan dana transfer (`FundingController@uploadBukti`) dan verifikasi kelengkapan.
- **Delete**: Sangat dibatasi (Hanya penangguhan status), guna menjaga integritas _ledger_ / audit.

**5. Validation Rules**

- _Unique_: `nomor_kontrak` tidak boleh ganda di database.
- _Calculated Allocation_: Di-validasi oleh `StoreFundingRequest`. Jika nilai tidak genap 100%, sistem akan menolak submit.
- _File Upload_: File bukti PDF/JPG maks 5MB.

**6. User Interface Requirements**

- **Admin Keuangan**:
    - Halaman sentral manajemen Kontrak (`resources/js/pages/Finance/Contract/Index.tsx` & `Show.tsx`): Daftar tabular seluruh ikatan kontrak beserta halaman rincian detail digital (_Digital Agreement_). Berfungsi mengarsipkan dan melihat detail kontrak yang sah.
    - Halaman upload dan review dokumen pencairan (`resources/js/pages/Finance/Contract/Upload.tsx`) dengan lencana status (`resources/js/components/StatusBadge.tsx`): Halaman form pelunasan yang menampilkan lencana warna-warni (Aktif/Selesai). Berfungsi menandakan state/status pencairan tiap tahapan secara visual.
    - Halaman pembuatan termin (`resources/js/pages/Finance/Funding/Create.tsx`) dan log finansial (`resources/js/pages/Finance/Funding/Logs.tsx`): Form interaktif alokasi persentase dana dan riwayat tabel _audit trail_ aliran dana. Berfungsi memastikan rincian pembiayaan terekam sempurna 100%.
    - Komponen penyaring laporan keuangan (`resources/js/components/FilterBar.tsx`): Boks kumpulan menu tarik-turun (_dropdown_) untuk menyaring data berdasar Tahun/Skema. Berfungsi memudahkan pencarian cepat data finansial.
- **Peneliti**:
    - Halaman informasi pencairan dana (`resources/js/pages/Proposal/FundingInfo.tsx`): Panel visual berupa _progress bar_ serapan finansial (Cair vs Sisa). Berfungsi memberi transparansi posisi keuangan kepada dosen.
    - Modal bukti penerimaan (`resources/js/components/ReceiptModal.tsx`): Pop-up yang menampilkan _image/PDF viewer_ dari slip transfer dana. Berfungsi agar dosen bisa men-download bukti kuitansi tanpa harus meninggalkan halaman utama.
    - Form pembaruan profil bank (`resources/js/pages/Profile/BankForm.tsx`): Formulir terpisah khusus untuk _update_ nama Bank, nomor rekening, dan cabang. Berfungsi menjamin akurasi tujuan transfer.

**7. Integration Requirements**

- Layanan kalkulasi saldo dengan `FundingService@calculateSisa` dan formatting rupiah client-side di `currency.ts`.
- Menyediakan endpoint API riwayat finansial untuk Modul Dashboard (`Api/BudgetController@getStats`).

---

### 4. Monitoring dan Evaluasi (Monev) Penelitian

**1. Definisi Entitas / Deskripsi Awal**
Modul ini memfasilitasi pelaporan operasional riset di lapangan (_progress tracking_). Pemantauannya dilakukan berkala melalui pelaporan kemajuan dan evaluasi kelanjutan proyek.

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

- Peneliti mendokumentasikan progres historis via logbook / Laporan Kemajuan.
- Dokumen _Laporan Kemajuan_ wajib disetujui evaluator / LPPM sebagai trigger _unlock_ tahapan termin Modul Keuangan.
- Persentase kumulatif entri logbook (`persentase_progres`) bersifat _incremental_ (tidak dapat mundur nilainya).
- Terdapat sistem _reminder_ peringatan jatuh tempo pelaporan.

**4. Functional Requirements**

- **Create**: Dosen men-_submit_ dokumen laporan (`ProgressController@store`) dan upload file (`ProgressDocController@upload`).
- **Read**: Dosen memantau histori logbooknya (`Progress/Index.tsx`). Admin Kampus melihat rekap Monev global (`Admin/MonevReportCtrl@index`).
- **Update**: Evaluator/Reviewer memberikan catatan dan melakukan verifikasi (`EvaluationController@storeNote` dan `updateStatus`).
- **System**: Otomatis menjalankan _Cron Job_ `SendMonevReminder.php` jika jadwal hampir jatuh tempo.

**5. Validation Rules**

- _Number Range_: `persentase_progres` di antara 0 - 100.
- _File Upload Required_: Setiap _submit_ Laporan Kemajuan wajib menyertakan lampiran bukti.

**6. User Interface Requirements**

- **Peneliti**:
    - Halaman entri laporan (`resources/js/pages/Progress/Create.tsx`): Antarmuka _mobile-friendly_ berisi _Rich Text Editor_ (`resources/js/components/RichTextEditor.tsx`) layaknya MS Word. Berfungsi mewadahi deskripsi panjang dan _formatting_ teks saat dosen mengisi catatan _logbook_ harian di lapangan.
- **Admin / Evaluator**:
    - Halaman evaluasi progres (`resources/js/pages/Reviewer/Evaluation/Index.tsx`): Tabel pemantauan dengan fitur pencarian cepat (_live search_), berfungsi memetakan mana saja laporan antara yang harus dinilai.
    - Indikator linimasa dan batang progres (`resources/js/components/ProgressTimeline.tsx` & `ProgressBar.tsx`): Representasi visual grafis horisontal yang menunjukkan milestone/pencapaian dari 0% ke 100%. Berfungsi mempercepat pemahaman posisi pengerjaan proyek hanya dengan sekilas pandang.
    - Peringatan keterlambatan (`resources/js/components/AlertWarning.tsx`): Komponen kotak peringatan berwarna merah muda atau kuning terang yang muncul jika terdeteksi stagnasi proyek. Berfungsi memicu atensi LPPM untuk melakukan teguran.
    - Tombol Kirim Pengingat manual (`resources/js/pages/Admin/Monev/RemindBtn.tsx`): Sebuah tombol aksi _quick action_ di dalam tabel. Berfungsi mem-by-pass sistem _cron_ otomatis untuk mengirim peringatan email/Notifikasi _in-app_ pada satu kali klik.

**7. Integration Requirements**

- Laporan evaluasi akhir Monev bisa diekspor dan dicetak dengan `printRekap()` berformat cetak Blade (`print/evaluasi.blade.php`).
- Terkoneksi API Grafik Kemajuan (`Api/TimelineController`).

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

- Peneliti mendaftar luaran fungsional yang diverifikasi oleh **Admin Kampus / LPPM** (untuk menghindari klaim ganda antar Dosen).
- Form isian untuk luaran bersifat sangat _dynamic_ tergantung dari Dropdown "Jenis Luaran" yang dipilih.
- Menyediakan konektivitas ke ekosistem referensi (_Google Scholar_) untuk memanajemen H-Index dosen.

**4. Functional Requirements**

- **Create**: Dosen menambahkan luaran sesuai form jenis (_Jurnal/HKI/Buku/Prototipe_). Tersedia method-method peruntukan khusus seperti `storeJournal`, `storeHKI`, dsb.
- **Read**: Admin Kampus meninjau pada antrean verifikasi (`Admin/OutputVerifyCtrl@index`). Tersedia portal landing page umum bagi public / guest (`PublicOutputController@show`).
- **Update**: Admin Kampus memverifikasi dan merubah status. Dosen mengedit entri yang di-_reject_ via `OutputController@update`.
- **Sync**: Tarik data otomatis (`CitationController@sync`) melalui `ScholarService`.

**5. Validation Rules**

- _Dependency Validation_: Apabila `jenis_luaran` adalah "Jurnal", field tautan/DOI _wajib_ URL.
- Dokumen pendukung disyaratkan ukuran terbatas.

**6. User Interface Requirements**

- Formulir dinamis pendaftaran luaran (`resources/js/pages/Output/Create.tsx`): Antarmuka yang cerdas di mana _field input_ otomatis berganti struktur (Misal: Memunculkan _JournalForm.tsx_ untuk form DOI, atau _BookForm.tsx_ untuk form ISBN) dipandu oleh fungsi logika `OutputFormSelector.ts`. Berfungsi menyederhanakan _user experience_ agar dosen tidak dihadapkan pada form kaku yang tidak relevan.
- Modal verifikasi admin (`resources/js/components/VerifyModal.tsx`): Pop-up penyetujuan luaran (_Approve/Reject_) yang memuat kolom isian _mandatory_ pesan perbaikan penolakan. Berfungsi melancarkan komunikasi dua arah jika berkas invalid.
- Pratinjau bukti dokumen (`resources/js/components/FilePreview.tsx`): Modul penampil mini (gambar/sertifikat/PDF) tersemat (inline). Berfungsi mengefisienkan proses pengecekan keaslian tanpa admin harus bolak-balik men-_download_ file.
- Penjelajah luaran publik (`resources/js/components/GlobalSearch.tsx`): Baris pencarian melayang (_Search Bar_) di halaman etalase _landing page_. Berfungsi sebagai mesin telusur portofolio luaran universitas oleh pihak luar (tamu).
- Profil Portofolio Dosen (`resources/js/pages/Profile/Citation.tsx`): Lembar profil mirip dasbor analitik kecil yang memperlihatkan grafik garis publikasi tahunan, H-Index, dan total kutipan dari Google Scholar. Berfungsi mengangkat rekam jejak prestise akademis peneliti.

**7. Integration Requirements**

- Mengekspor data laporan ke spreadsheet `OutputsExport.php` dengan Laravel Excel.

---

### 6. Dashboard dan Pelaporan

**1. Definisi Entitas / Deskripsi Awal**
Modul analitik konklusif dan representasi grafis _real-time_. Menyediakan metrik untuk _Decision Making_ Pimpinan LPPM dan rangkuman performa untuk individual Dosen.

**2. Data Requirements**
Hanya berbasis Query (_Read-Only Data View_), mem-filter data log dari sistem.

- Data Total Proposal Masuk, Diterima, Ditolak per Skema (`DashboardController@getProposalStat`).
- Metrik Finansial Serapan Dana (`Admin/DashboardCtrl@getFundingChart`).
- Performa Fakultas / Prodi (`Admin/DashboardCtrl@getFacultyStat`).

**3. Business Rules**

- Akses dan visibilitas diatur secara global (Modul Dashboard Admin berbeda dengan Dashboard Dosen). Pimpinan/Admin Kampus melihat seluruh data universitas, Dosen melihat rekap pribadi.
- Dapat di-_export_ ke _Custom Report Generator_ berformat Excel / PDF secara on-demand oleh Admin.
- Rekam Jejak Sistem (_System Log_) dicatat di balik layar via Observer pola `created`/`updated` untuk mendata log aktivitas.

**4. Functional Requirements**

- **Create**: Mengekspor data dalam format berkas. PDF menggunakan DOMPDF (`exportPdf()`) dan Excel (`exportExcel()`).
- **Read**: Menyajikan _Chart_, Daftar Top Researches, dan Log aktivitas (`LogController@index`).
- **Update**: (Hanya Super Admin) Pembaharuan pengaturan sistem, logo / nama web via `Admin/SettingsCtrl@update`.

**5. Validation Rules**

- Validasi form eksportir memastikan filter _Date / Year_ valid (`MultiSelectFilter.tsx`).

**6. User Interface Requirements**

- Dua pintu dasbor terpisah: `resources/js/pages/Dashboard/User.tsx` (Panel ringkasan prestasi spesifik milik dosen terkait) dan `resources/js/pages/Dashboard/Admin.tsx` (Panel pemantauan _helicopter view_ dengan metrik kampus global). Berfungsi menjamin fokus informasi berdasarkan kapabilitas perannya.
- Bagan data grafik statistik (`resources/js/components/Charts/BarChart.tsx` & `PieChart.tsx`): Diagram visual interaktif di mana _tooltip_ tampil saat kursor diarahkan ke area diagram. Berfungsi memvisualisasikan tren data berderet seperti anggaran tahunan dan persentase luaran.
- Modul klasemen peringkat (`resources/js/components/TopResearchList.tsx` & `TopLecturerList.tsx`): Daftar _Leaderboard_ 5 besar proyek teraktif dan dosen paling produktif. Berfungsi membangkitkan kompetisi positif (_gamification_) antar akademisi.
- Fasilitas Kustom Cetak Laporan (`resources/js/pages/Admin/Report/Generator.tsx`): Antarmuka dengan filter pilihan ganda (`MultiSelectFilter.tsx`) dan grup tombol ekstrak (`ExportButtons.tsx` untuk Excel/PDF). Berfungsi mengakomodasi kebutuhan LPPM saat rapat pimpinan atau akreditasi.
- Komponen penyempurna UX: `SkeletonLoader.tsx` (Efek pemuatan bayangan kerangka yang mengurangi sensasi lemot saat jaringan lambat) dan `ActivityLog.tsx` (Kotak riwayat aliran aktivitas di sisi layar layaknya _timeline_ Facebook untuk transparansi audit rekam jejak).

**7. Integration Requirements**

- Mengkonsolidasikan data secara murni _Read Only_ dari Modul 1 sampai Modul 5.
- Tersedia pengaturan _route redirect_ di `LoginController@authenticated` agar Dosen dan Admin/Keuangan langsung dilempar ke panel Dashboard yang tepat pasca-Login.
