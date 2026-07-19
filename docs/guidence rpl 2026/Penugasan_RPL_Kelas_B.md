# Pembagian Tugas Proyek RPL — Kelas B

## Sistem Penelitian Terintegrasi untuk JurnalMu

Pembagian tugas ini difokuskan 100% pada **Pengembangan Fitur (Development)**, baik dari sisi _Backend_ (Database, Model, Controller, Service) maupun _Frontend_ (React Inertia Pages/Components). Setiap mahasiswa mendapatkan tepat **4 tugas** yang membentuk alur _end-to-end_ sebuah fitur.

> **PENTING**: Sebelum mulai coding, setiap mahasiswa **wajib** membaca file berikut:
>
> - `docs/Technical_Guide.md` — Panduan arsitektur MVC & konvensi kode
> - `docs/Integration_Guide.md` — Panduan integrasi dengan proyek Kelas G
>
> Pembuatan komponen Data Layer (Migration, Model, Relasi) **disatukan dalam 1 task** agar kepemilikan struktur data utuh dan tidak terjadi _blocker_ antar mahasiswa.

---

### 📑 TAB 1: Manajemen Proposal Penelitian

_(Modul untuk pengajuan proposal, upload dokumen, validasi, dan skema penelitian. Dikerjakan oleh 8 Mahasiswa)_

| Task                                                                   | Path (Laravel/React)                                | Nama Method           | Nama Mahasiswa                | Acuan / Dependensi |
| :--------------------------------------------------------------------- | :-------------------------------------------------- | :-------------------- | :---------------------------- | :----------------- |
| Buat Entitas Data (Migration, Model, Seeder) Proposal & ResearchSchema | `app/Models/Proposal.php` dll                       | -                     | MUHAMMAD FAHD AFGHANI ARIDLOI | PRD Modul 1        |
| Buat routing web untuk group proposal                                  | `routes/web.php`                                    | -                     | MUHAMMAD FAHD AFGHANI ARIDLOI | -                  |
| Buat method controller index proposal (Dosen)                          | `app/Http/Controllers/ProposalController.php`       | `index()`             | IRHAM ASDURROH                | Tabel proposals    |
| Buat view daftar proposal user                                         | `resources/js/pages/Proposal/Index.tsx`             | -                     | IRHAM ASDURROH                | index()            |
| Buat method controller detail proposal                                 | `app/Http/Controllers/ProposalController.php`       | `show()`              | IRHAM ASDURROH                | -                  |
| Buat view detail/riwayat proposal                                      | `resources/js/pages/Proposal/Show.tsx`              | -                     | IRHAM ASDURROH                | show()             |
| Buat method controller menampilkan form create                         | `app/Http/Controllers/ProposalController.php`       | `create()`            | BAHARUDIN ALVIN DAROJI        | -                  |
| Buat view form pengajuan proposal                                      | `resources/js/pages/Proposal/Create.tsx`            | -                     | BAHARUDIN ALVIN DAROJI        | create()           |
| Buat method controller simpan data proposal baru                       | `app/Http/Controllers/ProposalController.php`       | `store()`             | BAHARUDIN ALVIN DAROJI        | Form Create        |
| Buat request class validasi StoreProposal                              | `app/Http/Requests/StoreProposalRequest.php`        | `rules()`             | BAHARUDIN ALVIN DAROJI        | store()            |
| Buat method controller menampilkan form edit                           | `app/Http/Controllers/ProposalController.php`       | `edit()`              | FIDYAH RAHMAN                 | -                  |
| Buat view form edit proposal                                           | `resources/js/pages/Proposal/Edit.tsx`              | -                     | FIDYAH RAHMAN                 | edit()             |
| Buat method controller update data proposal                            | `app/Http/Controllers/ProposalController.php`       | `update()`            | FIDYAH RAHMAN                 | Form Edit          |
| Buat method controller delete/cancel proposal                          | `app/Http/Controllers/ProposalController.php`       | `destroy()`           | FIDYAH RAHMAN                 | -                  |
| Buat Entitas Data (Migration, Model, Relasi) ProposalDocument          | `app/Models/ProposalDocument.php` dll               | -                     | AHMAD TIBYAN HAKIM            | PRD Modul 1        |
| Buat method controller untuk upload dokumen                            | `app/Http/Controllers/DocumentController.php`       | `upload()`            | AHMAD TIBYAN HAKIM            | -                  |
| Buat komponen file uploader React (Drag & Drop)                        | `resources/js/components/FileUploader.tsx`          | -                     | AHMAD TIBYAN HAKIM            | upload()           |
| Buat method controller untuk download dokumen                          | `app/Http/Controllers/DocumentController.php`       | `download()`          | AHMAD TIBYAN HAKIM            | -                  |
| Buat method controller Admin view all proposal                         | `app/Http/Controllers/Admin/ProposalController.php` | `index()`             | MUHAMMAD FADHILA ULINNUHA     | -                  |
| Buat view list proposal untuk Admin Kampus                             | `resources/js/pages/Admin/Proposal/Index.tsx`       | -                     | MUHAMMAD FADHILA ULINNUHA     | index()            |
| Buat method controller validasi administrasi (Approve)                 | `app/Http/Controllers/Admin/ProposalController.php` | `approve()`           | MUHAMMAD FADHILA ULINNUHA     | -                  |
| Buat komponen tombol Approve/Reject React                              | `resources/js/components/ActionButtons.tsx`         | -                     | MUHAMMAD FADHILA ULINNUHA     | -                  |
| Buat method controller Skema Penelitian                                | `app/Http/Controllers/SchemaController.php`         | `index()`             | RAKA BONDAN PRASETYO          | Tabel schemas      |
| Buat view manajemen Skema Penelitian (Admin)                           | `resources/js/pages/Admin/Schema/Index.tsx`         | -                     | RAKA BONDAN PRASETYO          | index()            |
| Buat method controller detail Skema                                    | `app/Http/Controllers/SchemaController.php`         | `show()`              | RAKA BONDAN PRASETYO          | -                  |
| Buat API resource Schema                                               | `app/Http/Resources/SchemaResource.php`             | `toArray()`           | RAKA BONDAN PRASETYO          | -                  |
| Buat method store & update Skema Penelitian                            | `app/Http/Controllers/SchemaController.php`         | `store()`, `update()` | ASYIFA CITRA RAHMADINI        | -                  |
| Buat view form tambah Skema                                            | `resources/js/pages/Admin/Schema/Create.tsx`        | -                     | ASYIFA CITRA RAHMADINI        | store()            |
| Buat view form edit Skema                                              | `resources/js/pages/Admin/Schema/Edit.tsx`          | -                     | ASYIFA CITRA RAHMADINI        | update()           |
| Buat method controller hapus skema                                     | `app/Http/Controllers/SchemaController.php`         | `destroy()`           | ASYIFA CITRA RAHMADINI        | -                  |

---

### 📑 TAB 2: Manajemen Reviewer dan Penilaian

_(Modul penunjukan reviewer, form penilaian, rekap hasil review. Dikerjakan oleh 8 Mahasiswa)_

| Task                                                                     | Path (Laravel/React)                                | Nama Method           | Nama Mahasiswa            | Acuan / Dependensi |
| :----------------------------------------------------------------------- | :-------------------------------------------------- | :-------------------- | :------------------------ | :----------------- |
| Buat Entitas Data (Migration, Model, Relasi) Review & AssessmentCriteria | `app/Models/Review.php` dll                         | -                     | MUHAMMAD HILMI PRASTOWO   | PRD Modul 2        |
| Buat method controller index daftar tugas Reviewer                       | `app/Http/Controllers/ReviewerController.php`       | `index()`             | MUHAMMAD HILMI PRASTOWO   | -                  |
| Buat view daftar tugas review (Dashboard Reviewer)                       | `resources/js/pages/Reviewer/Index.tsx`             | -                     | MUHAMMAD HILMI PRASTOWO   | index()            |
| Buat method controller assign reviewer ke proposal                       | `app/Http/Controllers/Admin/AssignController.php`   | `assign()`            | FARHAN NUR ICHSAN         | Model Review       |
| Buat view Admin untuk penunjukan reviewer                                | `resources/js/pages/Admin/Reviewer/Assign.tsx`      | -                     | FARHAN NUR ICHSAN         | assign()           |
| Buat method controller hapus penunjukan reviewer                         | `app/Http/Controllers/Admin/AssignController.php`   | `unassign()`          | FARHAN NUR ICHSAN         | -                  |
| Buat komponen modal konfirmasi penunjukan                                | `resources/js/components/AssignModal.tsx`           | -                     | FARHAN NUR ICHSAN         | Assign.tsx         |
| Buat method controller simpan nilai review                               | `app/Http/Controllers/ReviewController.php`         | `storeAssessment()`   | NAUFAL MUKHTAR KAMALUDDIN | Model Review       |
| Buat view form penilaian proposal untuk Reviewer                         | `resources/js/pages/Reviewer/FormReview.tsx`        | -                     | NAUFAL MUKHTAR KAMALUDDIN | storeAssessment()  |
| Buat method controller update nilai review                               | `app/Http/Controllers/ReviewController.php`         | `updateAssessment()`  | NAUFAL MUKHTAR KAMALUDDIN | -                  |
| Buat request class validasi Penilaian                                    | `app/Http/Requests/StoreReviewRequest.php`          | `rules()`             | NAUFAL MUKHTAR KAMALUDDIN | -                  |
| Buat method controller rekap hasil penilaian (Admin)                     | `app/Http/Controllers/Admin/ReviewController.php`   | `summary()`           | FAHMI HIDAYAT             | -                  |
| Buat view rekap hasil review (Tabel Kalkulasi)                           | `resources/js/pages/Admin/Reviewer/Summary.tsx`     | -                     | FAHMI HIDAYAT             | summary()          |
| Buat logic service penghitungan rata-rata nilai                          | `app/Services/ReviewCalculationService.php`         | `calculate()`         | FAHMI HIDAYAT             | -                  |
| Buat method controller penentuan Diterima/Ditolak                        | `app/Http/Controllers/Admin/DecisionController.php` | `decide()`            | FAHMI HIDAYAT             | calculate()        |
| Buat Entitas Data (Migration, Model, Relasi) ReviewSchedule              | `app/Models/ReviewSchedule.php` dll                 | -                     | CANDRA KURNIAWAN          | PRD Modul 2        |
| Buat method controller kelola jadwal review                              | `app/Http/Controllers/Admin/ScheduleController.php` | `store()`             | CANDRA KURNIAWAN          | -                  |
| Buat view pengaturan jadwal review                                       | `resources/js/pages/Admin/Reviewer/Schedule.tsx`    | -                     | CANDRA KURNIAWAN          | store()            |
| Buat komponen DatePicker/Calendar di React                               | `resources/js/components/DatePicker.tsx`            | -                     | CANDRA KURNIAWAN          | Schedule.tsx       |
| Buat method controller notifikasi reviewer via app                       | `app/Http/Controllers/NotificationController.php`   | `notifyReviewer()`    | DIMAS CANDRA PERMANA      | -                  |
| Buat view notifikasi/lonceng di layout React                             | `resources/js/components/NotificationBell.tsx`      | -                     | DIMAS CANDRA PERMANA      | notifyReviewer()   |
| Buat method controller detail kriteria penilaian                         | `app/Http/Controllers/Admin/CriteriaController.php` | `index()`             | DIMAS CANDRA PERMANA      | -                  |
| Buat view kelola parameter kriteria penilaian                            | `resources/js/pages/Admin/Criteria/Index.tsx`       | -                     | DIMAS CANDRA PERMANA      | index()            |
| Buat method controller CRUD Kriteria Penilaian                           | `app/Http/Controllers/Admin/CriteriaController.php` | `store()`, `update()` | HUSNA SALSABILLA          | -                  |
| Buat view form tambah Kriteria Penilaian                                 | `resources/js/pages/Admin/Criteria/Create.tsx`      | -                     | HUSNA SALSABILLA          | store()            |
| Buat view form edit Kriteria Penilaian                                   | `resources/js/pages/Admin/Criteria/Edit.tsx`        | -                     | HUSNA SALSABILLA          | update()           |
| Buat komponen Dynamic Input untuk Kriteria                               | `resources/js/components/DynamicInput.tsx`          | -                     | HUSNA SALSABILLA          | -                  |
| Buat method controller get riwayat review dosen                          | `app/Http/Controllers/ReviewHistoryController.php`  | `index()`             | FADHIL FIRMANSYAH RAZAK   | -                  |
| Buat view riwayat review untuk Dosen pengusul                            | `resources/js/pages/Proposal/ReviewHistory.tsx`     | -                     | FADHIL FIRMANSYAH RAZAK   | index()            |
| Buat method controller cetak berita acara review                         | `app/Http/Controllers/ReviewDocumentController.php` | `printBA()`           | FADHIL FIRMANSYAH RAZAK   | -                  |
| Buat view template Berita Acara (Cetak HTML/PDF)                         | `resources/views/print/berita_acara.blade.php`      | -                     | FADHIL FIRMANSYAH RAZAK   | printBA()          |

---

### 📑 TAB 3: Manajemen Kontrak dan Pendanaan

_(Modul pengelolaan kontrak yang lolos seleksi dan pencairan dana termin. Dikerjakan oleh 8 Mahasiswa)_

| Task                                                            | Path (Laravel/React)                               | Nama Method       | Nama Mahasiswa            | Acuan / Dependensi |
| :-------------------------------------------------------------- | :------------------------------------------------- | :---------------- | :------------------------ | :----------------- |
| Buat Entitas Data (Migration, Model, Relasi) Contract & Funding | `app/Models/Contract.php` dll                      | -                 | MUHAMMAD NAUFAL AFRIZA    | PRD Modul 3        |
| Buat method controller index daftar kontrak                     | `app/Http/Controllers/ContractController.php`      | `index()`         | MUHAMMAD NAUFAL AFRIZA    | -                  |
| Buat view manajemen kontrak (Admin Keuangan)                    | `resources/js/pages/Finance/Contract/Index.tsx`    | -                 | MUHAMMAD NAUFAL AFRIZA    | index()            |
| Buat method controller generate draft kontrak                   | `app/Http/Controllers/ContractController.php`      | `generate()`      | GILANG JA'FAR PRASETYA    | -                  |
| Buat view detail draft kontrak penelitian                       | `resources/js/pages/Finance/Contract/Show.tsx`     | -                 | GILANG JA'FAR PRASETYA    | generate()         |
| Buat method controller ubah status kontrak                      | `app/Http/Controllers/ContractController.php`      | `updateStatus()`  | GILANG JA'FAR PRASETYA    | -                  |
| Buat badge component status (Aktif/Selesai)                     | `resources/js/components/StatusBadge.tsx`          | -                 | GILANG JA'FAR PRASETYA    | -                  |
| Buat method controller input termin pencairan                   | `app/Http/Controllers/FundingController.php`       | `storeTermin()`   | AKMAL PUTRA RAIHAN        | Model Funding      |
| Buat view form pencairan dana termin (Keuangan)                 | `resources/js/pages/Finance/Funding/Create.tsx`    | -                 | AKMAL PUTRA RAIHAN        | storeTermin()      |
| Buat request class validasi nominal dana                        | `app/Http/Requests/StoreFundingRequest.php`        | `rules()`         | AKMAL PUTRA RAIHAN        | -                  |
| Buat method service hitung sisa dana kontrak                    | `app/Services/FundingService.php`                  | `calculateSisa()` | AKMAL PUTRA RAIHAN        | -                  |
| Buat method controller list pendanaan per Dosen                 | `app/Http/Controllers/UserFundingController.php`   | `index()`         | HAYQAL AKBAR RIZKY I.     | -                  |
| Buat view rincian dana cair untuk sisi Dosen                    | `resources/js/pages/Proposal/FundingInfo.tsx`      | -                 | HAYQAL AKBAR RIZKY I.     | index()            |
| Buat method controller upload bukti transfer dana               | `app/Http/Controllers/FundingController.php`       | `uploadBukti()`   | HAYQAL AKBAR RIZKY I.     | -                  |
| Buat komponen view bukti transfer (Modal React)                 | `resources/js/components/ReceiptModal.tsx`         | -                 | HAYQAL AKBAR RIZKY I.     | uploadBukti()      |
| Buat Entitas Data (Migraton, Model, Relasi) ContractDocument    | `app/Models/ContractDocument.php` dll              | -                 | DIMAS FADLY MUHAMAD A.    | PRD Modul 3        |
| Buat method controller arsip PDF kontrak ttd                    | `app/Http/Controllers/ContractDocController.php`   | `store()`         | DIMAS FADLY MUHAMAD A.    | -                  |
| Buat view upload arsip kontrak final                            | `resources/js/pages/Finance/Contract/Upload.tsx`   | -                 | DIMAS FADLY MUHAMAD A.    | store()            |
| Buat method controller download arsip kontrak                   | `app/Http/Controllers/ContractDocController.php`   | `download()`      | DIMAS FADLY MUHAMAD A.    | -                  |
| Buat method controller rekap administrasi keuangan              | `app/Http/Controllers/FinanceReportController.php` | `summary()`       | ZAINAL BASRI KARANGGUSI   | -                  |
| Buat view monitoring administrasi keuangan (Tabel)              | `resources/js/pages/Finance/Report/Index.tsx`      | -                 | ZAINAL BASRI KARANGGUSI   | summary()          |
| Buat logic filter data keuangan berdasar tahun                  | `app/Http/Controllers/FinanceReportController.php` | `filter()`        | ZAINAL BASRI KARANGGUSI   | -                  |
| Buat form filter (Tahun/Skema) di React                         | `resources/js/components/FilterBar.tsx`            | -                 | ZAINAL BASRI KARANGGUSI   | filter()           |
| Buat method controller riwayat perubahan termin                 | `app/Http/Controllers/FundingLogController.php`    | `index()`         | MUHAMAD BURHANUDIN A.B.   | Tabel fundings     |
| Buat view log perubahan dana / termin                           | `resources/js/pages/Finance/Funding/Logs.tsx`      | -                 | MUHAMAD BURHANUDIN A.B.   | index()            |
| Buat method cetak kwitansi termin ke PDF                        | `app/Http/Controllers/FundingController.php`       | `printKwitansi()` | MUHAMAD BURHANUDIN A.B.   | -                  |
| Buat view desain kwitansi print out                             | `resources/views/print/kwitansi.blade.php`         | -                 | MUHAMAD BURHANUDIN A.B.   | printKwitansi()    |
| Buat API Endpoint sisa anggaran (untuk chart dashboard)         | `app/Http/Controllers/Api/BudgetController.php`    | `getStats()`      | KHANSA KAMILAH LICTJELITA | -                  |
| Buat method controller sync data bank Dosen                     | `app/Http/Controllers/UserBankController.php`      | `update()`        | KHANSA KAMILAH LICTJELITA | -                  |
| Buat view form edit rekening bank Dosen                         | `resources/js/pages/Profile/BankForm.tsx`          | -                 | KHANSA KAMILAH LICTJELITA | update()           |
| Buat helper format mata uang Rupiah (TS/JS)                     | `resources/js/utils/currency.ts`                   | `formatRp()`      | KHANSA KAMILAH LICTJELITA | -                  |

---

### 📑 TAB 4: Monitoring dan Evaluasi Penelitian

_(Modul laporan kemajuan, dokumen monev, catatan evaluasi reviewer. Dikerjakan oleh 8 Mahasiswa)_

| Task                                                                     | Path (Laravel/React)                               | Nama Method      | Nama Mahasiswa        | Acuan / Dependensi |
| :----------------------------------------------------------------------- | :------------------------------------------------- | :--------------- | :-------------------- | :----------------- |
| Buat Entitas Data (Migration, Model, Relasi) ProgressReport & Evaluation | `app/Models/ProgressReport.php` dll                | -                | ARYA DWIKUNCORO       | PRD Modul 4        |
| Buat method controller index laporan kemajuan                            | `app/Http/Controllers/ProgressController.php`      | `index()`        | ARYA DWIKUNCORO       | -                  |
| Buat view daftar laporan kemajuan (User Dosen)                           | `resources/js/pages/Progress/Index.tsx`            | -                | ARYA DWIKUNCORO       | index()            |
| Buat method controller create laporan kemajuan                           | `app/Http/Controllers/ProgressController.php`      | `store()`        | MUHAMMAD RAFINDRA Y.  | -                  |
| Buat view form upload laporan kemajuan (Dosen)                           | `resources/js/pages/Progress/Create.tsx`           | -                | MUHAMMAD RAFINDRA Y.  | store()            |
| Buat method controller upload dokumen logbook                            | `app/Http/Controllers/ProgressDocController.php`   | `upload()`       | MUHAMMAD RAFINDRA Y.  | -                  |
| Buat komponen textarea logbook wysiwyg                                   | `resources/js/components/RichTextEditor.tsx`       | -                | MUHAMMAD RAFINDRA Y.  | Create.tsx         |
| Buat method controller index evaluasi (Reviewer)                         | `app/Http/Controllers/EvaluationController.php`    | `index()`        | MUHAMMAD NUR RASYID   | -                  |
| Buat view daftar proposal yang perlu dievaluasi                          | `resources/js/pages/Reviewer/Evaluation/Index.tsx` | -                | MUHAMMAD NUR RASYID   | index()            |
| Buat method controller lihat detail laporan dosen                        | `app/Http/Controllers/EvaluationController.php`    | `showProgress()` | MUHAMMAD NUR RASYID   | -                  |
| Buat view baca detail laporan kemajuan                                   | `resources/js/pages/Reviewer/Evaluation/Show.tsx`  | -                | MUHAMMAD NUR RASYID   | showProgress()     |
| Buat method controller submit catatan evaluasi                           | `app/Http/Controllers/EvaluationController.php`    | `storeNote()`    | MEGA RUKMANA DRAKEL   | -                  |
| Buat view form input catatan evaluasi reviewer                           | `resources/js/pages/Reviewer/Evaluation/Note.tsx`  | -                | MEGA RUKMANA DRAKEL   | storeNote()        |
| Buat method controller update status monev                               | `app/Http/Controllers/EvaluationController.php`    | `updateStatus()` | MEGA RUKMANA DRAKEL   | -                  |
| Buat komponen Timeline progress React                                    | `resources/js/components/ProgressTimeline.tsx`     | -                | MEGA RUKMANA DRAKEL   | -                  |
| Buat Entitas Data (Migration, Model, Relasi) MonevSchedule               | `app/Models/MonevSchedule.php` dll                 | -                | RAFLI GUNAWAN         | PRD Modul 4        |
| Buat method controller atur jadwal Monev (Admin)                         | `app/Http/Controllers/Admin/MonevScheduleCtrl.php` | `store()`        | RAFLI GUNAWAN         | -                  |
| Buat view manajemen jadwal Monev                                         | `resources/js/pages/Admin/Monev/Schedule.tsx`      | -                | RAFLI GUNAWAN         | store()            |
| Buat logic controller filter laporan belum di-review                     | `app/Http/Controllers/Admin/MonevScheduleCtrl.php` | `pending()`      | RAFLI GUNAWAN         | -                  |
| Buat method controller rekap monev keseluruhan                           | `app/Http/Controllers/Admin/MonevReportCtrl.php`   | `index()`        | MUHAMMAD ROJULAN H.   | -                  |
| Buat view tabel rekap status progres penelitian                          | `resources/js/pages/Admin/Monev/Report.tsx`        | -                | MUHAMMAD ROJULAN H.   | index()            |
| Buat method ubah status penelitian (Lanjut/Stop)                         | `app/Http/Controllers/Admin/MonevReportCtrl.php`   | `decideAction()` | MUHAMMAD ROJULAN H.   | -                  |
| Buat komponen Alert peringatan keterlambatan laporan                     | `resources/js/components/AlertWarning.tsx`         | -                | MUHAMMAD ROJULAN H.   | -                  |
| Buat method cetak PDF rekap evaluasi monev                               | `app/Http/Controllers/MonevDocumentCtrl.php`       | `printRekap()`   | M. RASYIT REDHA       | -                  |
| Buat layout view untuk print evaluasi                                    | `resources/views/print/evaluasi.blade.php`         | -                | M. RASYIT REDHA       | printRekap()       |
| Buat method API get data grafik timeline progres                         | `app/Http/Controllers/Api/TimelineController.php`  | `getChart()`     | M. RASYIT REDHA       | -                  |
| Buat komponen ProgressBar React (Persentase)                             | `resources/js/components/ProgressBar.tsx`          | -                | M. RASYIT REDHA       | -                  |
| Buat method controller sistem pengingat (Reminder)                       | `app/Console/Commands/SendMonevReminder.php`       | `handle()`       | DEN HANIEF LANIENT I. | Jadwal Monev       |
| Buat layout email template notifikasi (Blade)                            | `resources/views/emails/monev_reminder.blade.php`  | -                | DEN HANIEF LANIENT I. | handle()           |
| Buat controller send manual reminder oleh Admin                          | `app/Http/Controllers/Admin/ReminderCtrl.php`      | `send()`         | DEN HANIEF LANIENT I. | -                  |
| Buat tombol "Kirim Pengingat" di view Admin                              | `resources/js/pages/Admin/Monev/RemindBtn.tsx`     | -                | DEN HANIEF LANIENT I. | send()             |

---

### 📑 TAB 5: Manajemen Luaran Penelitian

_(Modul input publikasi, paten, produk, buku. Dikerjakan oleh 9 Mahasiswa)_

| Task                                                                      | Path (Laravel/React)                              | Nama Method          | Nama Mahasiswa          | Acuan / Dependensi |
| :------------------------------------------------------------------------ | :------------------------------------------------ | :------------------- | :---------------------- | :----------------- |
| Buat Entitas Data (Migration, Model, Relasi) ResearchOutput (Polymorphic) | `app/Models/ResearchOutput.php` dll               | -                    | HIDAYAT LOSSEN          | PRD Modul 5        |
| Buat method controller index luaran dosen                                 | `app/Http/Controllers/OutputController.php`       | `index()`            | HIDAYAT LOSSEN          | -                  |
| Buat view daftar luaran yang sudah disubmit user                          | `resources/js/pages/Output/Index.tsx`             | -                    | HIDAYAT LOSSEN          | index()            |
| Buat method controller form create luaran                                 | `app/Http/Controllers/OutputController.php`       | `create()`           | ALVIN LUQMANUL HAKIM    | -                  |
| Buat view form utama tambah luaran (Pilih Jenis)                          | `resources/js/pages/Output/Create.tsx`            | -                    | ALVIN LUQMANUL HAKIM    | create()           |
| Buat method controller store luaran publikasi ilmiah                      | `app/Http/Controllers/OutputController.php`       | `storeJournal()`     | ALVIN LUQMANUL HAKIM    | Form Utama         |
| Buat sub-form React khusus Publikasi Jurnal (Input DOI)                   | `resources/js/components/Forms/JournalForm.tsx`   | -                    | ALVIN LUQMANUL HAKIM    | storeJournal()     |
| Buat method controller store luaran HKI/Paten                             | `app/Http/Controllers/OutputController.php`       | `storeHKI()`         | FAIZ SADDAM RAFLY MULIA | -                  |
| Buat sub-form React khusus HKI/Paten (Input No.Paten)                     | `resources/js/components/Forms/HkiForm.tsx`       | -                    | FAIZ SADDAM RAFLY MULIA | storeHKI()         |
| Buat method controller store luaran Buku/Modul                            | `app/Http/Controllers/OutputController.php`       | `storeBook()`        | FAIZ SADDAM RAFLY MULIA | -                  |
| Buat sub-form React khusus Buku (Input ISBN)                              | `resources/js/components/Forms/BookForm.tsx`      | -                    | FAIZ SADDAM RAFLY MULIA | storeBook()        |
| Buat method controller store luaran Produk/Prototipe                      | `app/Http/Controllers/OutputController.php`       | `storeProduct()`     | AGUNG KURNIAWAN         | -                  |
| Buat sub-form React khusus Produk/Prototipe                               | `resources/js/components/Forms/ProductForm.tsx`   | -                    | AGUNG KURNIAWAN         | storeProduct()     |
| Buat method upload cover/dokumen bukti luaran                             | `app/Http/Controllers/OutputDocController.php`    | `upload()`           | AGUNG KURNIAWAN         | -                  |
| Buat komponen Image/Document Previewer React                              | `resources/js/components/FilePreview.tsx`         | -                    | AGUNG KURNIAWAN         | upload()           |
| Buat method controller hapus luaran                                       | `app/Http/Controllers/OutputController.php`       | `destroy()`          | AKBAR ZAQI FIKTARIZAEN  | -                  |
| Buat method controller edit luaran                                        | `app/Http/Controllers/OutputController.php`       | `edit()`, `update()` | AKBAR ZAQI FIKTARIZAEN  | -                  |
| Buat view form edit luaran dinamis                                        | `resources/js/pages/Output/Edit.tsx`              | -                    | AKBAR ZAQI FIKTARIZAEN  | edit()             |
| Buat logika helper TS pemilih jenis komponen                              | `resources/js/utils/OutputFormSelector.ts`        | -                    | AKBAR ZAQI FIKTARIZAEN  | -                  |
| Buat method controller index verifikasi luaran (Admin)                    | `app/Http/Controllers/Admin/OutputVerifyCtrl.php` | `index()`            | FARIS ILHAM PRIYADI     | -                  |
| Buat view daftar luaran menunggu verifikasi admin                         | `resources/js/pages/Admin/Output/Index.tsx`       | -                    | FARIS ILHAM PRIYADI     | index()            |
| Buat method controller approve/reject luaran                              | `app/Http/Controllers/Admin/OutputVerifyCtrl.php` | `verify()`           | FARIS ILHAM PRIYADI     | -                  |
| Buat komponen tombol Verifikasi & Catatan Tolak                           | `resources/js/components/VerifyModal.tsx`         | -                    | FARIS ILHAM PRIYADI     | verify()           |
| Buat method API get total luaran per kategori                             | `app/Http/Controllers/Api/OutputStatsCtrl.php`    | `getCategory()`      | DEVA RANANDA GALIH P.   | Tabel outputs      |
| Buat method API get total luaran per tahun                                | `app/Http/Controllers/Api/OutputStatsCtrl.php`    | `getYearly()`        | DEVA RANANDA GALIH P.   | -                  |
| Buat view rekap luaran bentuk List untuk Cetak                            | `resources/js/pages/Admin/Output/Report.tsx`      | -                    | DEVA RANANDA GALIH P.   | -                  |
| Buat cetak laporan luaran universitas format Excel                        | `app/Exports/OutputsExport.php` (Laravel Excel)   | `collection()`       | DEVA RANANDA GALIH P.   | -                  |
| Buat controller sync sitasi Dosen (Integrasi eksternal)                   | `app/Http/Controllers/CitationController.php`     | `sync()`             | AGIL MAULANA            | -                  |
| Buat Entitas Data (Migration, Model, Relasi) Citation                     | `app/Models/Citation.php` dll                     | -                    | AGIL MAULANA            | PRD Modul 5        |
| Buat view statistik sitasi & h-index Dosen                                | `resources/js/pages/Profile/Citation.tsx`         | -                    | AGIL MAULANA            | sync()             |
| Buat service fetch API eksternal (Google Scholar) dummy                   | `app/Services/ScholarService.php`                 | `fetch()`            | AGIL MAULANA            | -                  |
| Buat method controller show detail luaran publik                          | `app/Http/Controllers/PublicOutputController.php` | `show()`             | TUTUR PRYAMBADHA        | -                  |
| Buat view halaman landing page detail luaran (Public)                     | `resources/js/pages/Public/OutputShow.tsx`        | -                    | TUTUR PRYAMBADHA        | show()             |
| Buat search engine simple untuk list luaran                               | `app/Http/Controllers/PublicOutputController.php` | `search()`           | TUTUR PRYAMBADHA        | -                  |
| Buat komponen SearchBar Global di React Navbar                            | `resources/js/components/GlobalSearch.tsx`        | -                    | TUTUR PRYAMBADHA        | search()           |

---

### 📑 TAB 6: Dashboard dan Pelaporan

_(Modul statistik, rekap, grafik, dan export PDF/Excel. Dikerjakan oleh 9 Mahasiswa)_

| Task                                                     | Path (Laravel/React)                              | Nama Method         | Nama Mahasiswa            | Acuan / Dependensi |
| :------------------------------------------------------- | :------------------------------------------------ | :------------------ | :------------------------ | :----------------- |
| Buat method agregasi total proposal (Masuk/Lolos/Gagal)  | `app/Http/Controllers/DashboardController.php`    | `getProposalStat()` | ILHAM ZAKKI SYAHPUTRA     | Semua Tabel        |
| Buat view Dashboard Dosen (Personal Summary)             | `resources/js/pages/Dashboard/User.tsx`           | -                   | ILHAM ZAKKI SYAHPUTRA     | getProposalStat()  |
| Buat komponen Card Widget Angka (Total, Dana, dll)       | `resources/js/components/StatsCard.tsx`           | -                   | ILHAM ZAKKI SYAHPUTRA     | -                  |
| Buat method service kalkulasi persentase sukses          | `app/Services/StatsService.php`                   | `successRate()`     | ILHAM ZAKKI SYAHPUTRA     | -                  |
| Buat method agregasi data dashboard Admin (Global)       | `app/Http/Controllers/Admin/DashboardCtrl.php`    | `index()`           | AHMAD KHADIDI             | -                  |
| Buat view Dashboard Pimpinan/Admin Kampus                | `resources/js/pages/Dashboard/Admin.tsx`          | -                   | AHMAD KHADIDI             | index()            |
| Buat method agregasi pendanaan tahunan (Query Build)     | `app/Http/Controllers/Admin/DashboardCtrl.php`    | `getFundingChart()` | AHMAD KHADIDI             | -                  |
| Buat komponen Chart Batang (Bar Chart) React             | `resources/js/components/Charts/BarChart.tsx`     | -                   | AHMAD KHADIDI             | getFundingChart()  |
| Buat method agregasi performa Fakultas/Prodi             | `app/Http/Controllers/Admin/DashboardCtrl.php`    | `getFacultyStat()`  | MUHAMMAD ABEL RADITYA P.  | Tabel users/univ   |
| Buat table rekap performa fakultas di Dashboard Admin    | `resources/js/components/FacultyTable.tsx`        | -                   | MUHAMMAD ABEL RADITYA P.  | getFacultyStat()   |
| Buat komponen Chart Lingkaran (Pie Chart) Kategori       | `resources/js/components/Charts/PieChart.tsx`     | -                   | MUHAMMAD ABEL RADITYA P.  | getFacultyStat()   |
| Buat method controller daftar rekap keseluruhan (Filter) | `app/Http/Controllers/Admin/ReportController.php` | `index()`           | MUHAMMAD ABEL RADITYA P.  | -                  |
| Buat fitur Export Rekap Penelitian ke Excel              | `app/Exports/ResearchReportExport.php`            | `view()`            | NURWAHDANIA               | Tabel proposals    |
| Buat method controller trigger download Excel            | `app/Http/Controllers/Admin/ReportController.php` | `exportExcel()`     | NURWAHDANIA               | Export Excel       |
| Buat view Halaman Custom Report Generator                | `resources/js/pages/Admin/Report/Generator.tsx`   | -                   | NURWAHDANIA               | index()            |
| Buat dropdown multi-select untuk filter cetak laporan    | `resources/js/components/MultiSelectFilter.tsx`   | -                   | NURWAHDANIA               | -                  |
| Buat fitur Export Rekap Penelitian ke PDF                | `app/Http/Controllers/Admin/ReportController.php` | `exportPdf()`       | CHYNTYA KHUNI KHUMAIROH   | -                  |
| Buat view HTML template untuk konversi DOMPDF            | `resources/views/print/laporan_tahunan.blade.php` | -                   | CHYNTYA KHUNI KHUMAIROH   | exportPdf()        |
| Buat tombol Export Group di React (Download PDF/XLS)     | `resources/js/components/ExportButtons.tsx`       | -                   | CHYNTYA KHUNI KHUMAIROH   | Generator.tsx      |
| Buat method agregasi status Monev untuk Chart            | `app/Http/Controllers/Admin/DashboardCtrl.php`    | `getMonevStat()`    | CHYNTYA KHUNI KHUMAIROH   | -                  |
| Buat method API get data 5 Penelitian Teraktif           | `app/Http/Controllers/Api/TopResearchCtrl.php`    | `getTop()`          | FAUZAN DIAS KHAIRI        | -                  |
| Buat komponen Daftar List 5 Penelitian Terbaik (UI)      | `resources/js/components/TopResearchList.tsx`     | -                   | FAUZAN DIAS KHAIRI        | getTop()           |
| Buat method API get data 5 Dosen Paling Produktif        | `app/Http/Controllers/Api/TopLecturerCtrl.php`    | `getTop()`          | FAUZAN DIAS KHAIRI        | -                  |
| Buat komponen Daftar List 5 Dosen Produktif (UI)         | `resources/js/components/TopLecturerList.tsx`     | -                   | FAUZAN DIAS KHAIRI        | getTop()           |
| Buat Entitas Data (Migration, Model, Relasi) SystemLog   | `app/Models/SystemLog.php` dll                    | -                   | NAJRIL ILHAM              | PRD Modul 6        |
| Buat logic observer/event catat aktivitas ke Log         | `app/Observers/ProposalObserver.php` dsb          | `created()`         | NAJRIL ILHAM              | Tabel logs         |
| Buat method controller tampilkan log di Admin Dashboard  | `app/Http/Controllers/Admin/LogController.php`    | `index()`           | NAJRIL ILHAM              | -                  |
| Buat komponen Activity Stream (Timeline kecil UI)        | `resources/js/components/ActivityLog.tsx`         | -                   | NAJRIL ILHAM              | index()            |
| Buat konfigurasi routing Dashboard berbeda role          | `routes/web.php` (Grup Admin, Dosen, Keuangan)    | -                   | HABIBULLOH HUGA HENDRA S. | Middleware         |
| Buat logic redirect pintar setelah login sesuai Role     | `app/Http/Controllers/Auth/LoginController.php`   | `authenticated()`   | HABIBULLOH HUGA HENDRA S. | -                  |
| Buat controller profil sistem (Ubah logo/nama app)       | `app/Http/Controllers/Admin/SettingsCtrl.php`     | `update()`          | HABIBULLOH HUGA HENDRA S. | -                  |
| Buat view form Pengaturan Identitas Sistem (Admin)       | `resources/js/pages/Admin/Settings/Index.tsx`     | -                   | HABIBULLOH HUGA HENDRA S. | update()           |
| Buat helper format tanggal Indonesia (Carbon/JS Date)    | `resources/js/utils/date.ts`                      | `formatIndo()`      | ARVIN MAHMUD SANTOSA      | -                  |
| Buat komponen skeleton loading React (saat fetch data)   | `resources/js/components/SkeletonLoader.tsx`      | -                   | ARVIN MAHMUD SANTOSA      | -                  |
| Buat view layout halaman Error kustom (404, 403, 500)    | `resources/js/pages/Errors/ErrorPage.tsx`         | -                   | ARVIN MAHMUD SANTOSA      | -                  |
| Buat helper validasi akses menu di sidebar React         | `resources/js/utils/permission.ts`                | `canAccess()`       | ARVIN MAHMUD SANTOSA      | -                  |

## Panduan Umum Pengerjaan

### Urutan Pengerjaan yang Disarankan

1. **Baca PRD Modul** yang relevan sebelum mulai.
2. **Baca `Technical_Guide.md`** untuk memahami konvensi MVC dan aliran data Inertia.js.
3. **Baca `Integration_Guide.md`** jika tugas Anda bersinggungan dengan data dari Kelas G.
4. Diskusikan **struktur tabel** dengan rekan satu modul sebelum mulai coding.
5. Buat **branch Git** dengan format: `feature/{nama_fitur_singkat}_{Kelas}_{NIM}`.

### Dependensi Antar Mahasiswa

- Mahasiswa yang mengerjakan **Entitas Data (Migration + Model)** adalah **pemilik struktur data** dan harus selesai terlebih dahulu sebelum rekan satu modul mulai coding Controller/View.
- Mahasiswa yang mengerjakan **Controller** harus memberitahu struktur data Props Inertia ke mahasiswa yang mengerjakan **View** di fitur yang sama.
- Jangan lanjutkan coding jika ada ketidakcocokan struktur data dengan rekan satu fitur.

### Hal yang Wajib Dihindari

- ❌ Jangan meletakkan query Eloquent di dalam file React/View.
- ❌ Jangan buat tabel baru tanpa koordinasi dengan pemilik modul yang sama.
- ❌ Jangan hardcode data (gunakan relasi Eloquent dan Props Inertia).
- ❌ Jangan lupa sertakan TypeScript `interface` untuk setiap Props yang diterima komponen React.
