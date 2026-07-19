# Product Requirement Document (PRD)

## Submission System Terintegrasi — Kelas G

### Berbasis Open Journal Systems (OJS)

Dokumen ini berisi spesifikasi kebutuhan untuk 7 modul utama Submission System yang terintegrasi dengan proyek JurnalMu. Dokumen ini telah diselaraskan secara komprehensif dengan spesifikasi teknis komponen UI dan Controller yang tercantum pada file penugasan.

---

### Manajemen Hak Akses (RBAC) Jurnal

Sistem dirancang sedemikian rupa dengan kapabilitas _Multi-Tenant_ (Satu instalasi melayani banyak Jurnal). Berikut arsitektur hierarki peran (Role) pengguna:

- **Super Admin**: Memiliki kontrol absolut untuk menambah, menghapus instalasi Jurnal baru di dalam sistem, serta merubah konfigurasi sistem secara luas.
- **Journal Manager (Admin Jurnal)**: Mengelola pengaturan spesifik suatu jurnal tertentu. Mereka ditugaskan di `Admin/UserRoleController` untuk mengundang atau mencabut hak pengguna di dalam jurnal yang dikelolanya (`RevokeRoleModal.tsx`).
- **Editor-in-Chief / Editor**: Mengendalikan penuh alur editorial naskah. Memegang wewenang untuk menolak sejak awal (_Desk Reject_) atau menyetujui artikel untuk dipublikasi (_Accept_).
- **Section Editor**: Mengelola naskah pada topik keahlian tertentu, menunjuk _Reviewer_, merekomendasikan keputusan namun keputusan akhir berada di tangan _Editor_.
- **Reviewer**: Anggota pakar independen (_Double-Blind_) yang diundang untuk mengevaluasi kualitas riset naskah.
- **Copyeditor**: Menyunting tata bahasa, ejaan, dan gaya selingkung setelah naskah berstatus "Accept".
- **Production Editor**: Mendistribusikan tata letak, _galleys_, menerbitkan terbitan jurnal (Issues) dan Table of Contents.
- **Author**: Penulis yang men-_submit_ naskah penelitian.

---

### Modul 1: Manajemen Peran & Profil Pengguna (Role Management)

**1. Definisi Entitas / Deskripsi Awal**
Modul fondasi yang menyediakan sistem autentikasi dan otorisasi berbasis peran (RBAC) khusus untuk ekosistem penerbitan jurnal. Satu akun pengguna dapat memiliki lebih dari satu peran, dan peran tersebut bisa berbeda antar jurnal.

**2. Data Requirements**

- `id_role` (Primary Key, Auto-increment)
- `id_user` (Foreign Key ke tabel `users`, Required)
- `id_journal` (Foreign Key ke tabel `journals`, Nullable — NULL berarti role global)
- `role_name` (Enum: Author, Editor, SectionEditor, Reviewer, Copyeditor, ProductionEditor, Admin)
- `status` (Enum: Active, Invited, Declined; Default: Active)
- Untuk Profil Author: `orcid_id`, `affiliation`, `research_interests`, `biography`.

**3. Business Rules**

- Pengguna yang baru mendaftar (`Auth/RegisterController`) mendapat peran **Author** secara default.
- Peran spesifik (Reviewer, Editor) diundang (`invite()`) oleh Journal Manager. Pengguna berhak menolak atau menyetujui (`RoleInvitationController@respond`).
- Akses route dijaga oleh lapisan pengamanan `RoleMiddleware.php`.

**4. Functional Requirements**

- **Create**: Journal Manager membuat undangan ke pengguna terdaftar.
- **Read**: Halaman manajemen pengguna & peran untuk Admin Jurnal. Halaman profil pribadi.
- **Update**: Pengguna memperbarui profil afiliasi dan CV via `ProfileController@update` dan `ReviewerProfileController@update`.
- **Delete**: Pencabutan peran _revoke_ secara _soft-delete_ oleh Admin Jurnal (`Admin/UserRoleController@revoke`).

**5. Validation Rules**

- _Format ORCID_: Format harus `XXXX-XXXX-XXXX-XXXX` divalidasi pada `UpdateProfileRequest`.
- _Required fields_: Nama dan Afiliasi harus terisi sebelum sistem mengizinkan proses kirim naskah.

**6. User Interface Requirements**

- **Admin**:
    - Tabel user dan hak akses (`resources/js/pages/Admin/Users/Index.tsx`): _Data grid_ komprehensif seluruh anggota ekosistem jurnal. Berfungsi meninjau siapa bertugas sebagai apa.
    - Form undangan (_Invite Role_) (`resources/js/pages/Admin/Users/InviteRole.tsx`): Formulir asinkronus pencarian akun email yang langsung terkirim penawarannya. Berfungsi melakukan rekrutmen staf editorial / _reviewer_.
    - Dialog pemecatan/pencabutan peran (`resources/js/components/RevokeRoleModal.tsx`): Jendela _pop-up_ persetujuan penonaktifan peran yang dilindungi fungsi konfirmasi (misal: harus mengetik "CONFIRM"). Berfungsi mencegak insiden klik salah hapus peran krusial.
- **User**:
    - Lencana peran majemuk (`resources/js/components/RoleBadge.tsx`): Label stiker kecil di antarmuka profil yang bisa tertumpuk (misalnya label biru "Author" dan hijau "Editor"). Berfungsi mengidentifikasi identitas tumpuk di satu akun.
- **Author**: Halaman profil spesifik penulis (`resources/js/pages/Profile/AuthorProfile.tsx`), berisi kotak isian _ORCID ID_ dan penaut biografi singkat (CV). Berfungsi sebagai pusat penarikan metadata otomatis saat submit naskah nanti.
- **Reviewer**: Form pengelolaan kompetensi (`resources/js/components/SkillTagInput.tsx`) pada halaman `Profile/ReviewerProfile.tsx`. Berupa kotak isian _tagging_ mirip label hastag Twitter (dapat ditambah/dihapus dengan tombol "X"). Berfungsi memperjelas radar jangkauan bidang keilmuan _Reviewer_.

**7. Integration Requirements**

- Data profil otomatis ditarik sebagai default Metadata saat masuk di tahapan Wizard (Modul 2).

---

### Modul 2: Author Submission Wizard

**1. Definisi Entitas / Deskripsi Awal**
Modul antarmuka utama bagi penulis (Author) untuk mengirimkan naskah ilmiah melalui proses multi-langkah (wizard) yang terstruktur, memastikan semua metadata dan dokumen terkumpul secara lengkap sebelum masuk ke meja editor.

**2. Data Requirements**

- Tabel `submissions`: Memuat rincian `title`, `abstract`, `keywords`, dll.
- Tabel `submission_files`: Menyimpan file lampiran dan kategori (`ManuscriptMain`, `Supplementary`).
- Tabel `submission_contributors`: Daftar penulis dan status korespondensi.

**3. Business Rules**

- Proses terpecah jadi 5 langkah (_Start, Upload, Metadata, Contributors, Confirm_).
- Sebelum tahap kelima selesai, naskah tertahan dalam status **Draft**.
- Author tidak bisa mengubah naskah pasca-submit; kontrol kemudian berada di Modul 3.

**4. Functional Requirements**

- **Create**: Aliran proses 5-Langkah yang dikendalikan oleh `SubmissionWizardController` (Mulai dari `start()`, `saveStep1()`, hingga `finalSubmit()`).
- **Read**: Halaman `SubmissionController@index` (Dashboard Author) & `show()` (Detail naskah).
- **Update**: Penambahan anggota tim (`saveStep4()`) atau penggantian file sebelum Finalisasi.
- **Delete**: Soft-delete Draft yang dihentikan secara prematur (`cancel()`).

**5. Validation Rules**

- Validasi pamungkas sebelum eksekusi submit ditangani di `FinalSubmitRequest` memastikan semua 5 syarat lengkap (termasuk maks upload 20MB DOCX/PDF).

**6. User Interface Requirements**

- Baris indikator kelajuan tahapan (`resources/js/components/WizardProgressBar.tsx`): Sebuah jejak roti horizontal di sisi atas form (_Step 1, 2, 3..._) di mana tahapan sukses akan dicentang hijau. Berfungsi memandu navigasi spasiat agar pengguna tak tersesat dalam alur panjang.
- Input kata kunci interaktif (`resources/js/components/KeywordInput.tsx`) di halaman `Wizard/Step3Metadata.tsx`: Kolom input di mana kata berubah menjadi _chip/badge_ setelah ditekan _Enter_. Berfungsi menjaga struktur format metadata agar tak bercampur berantakan (dipisah koma otomatis).
- Penyisipan tim penulis tambahan (`resources/js/components/ContributorForm.tsx`): Form baris yang dapat dikloning dan ditumpuk ke bawah (Add Contributor) secara tak terhingga pada langkah ke-4. Berfungsi memuat daftar ko-penulis pendamping tanpa batasan.
- Lencana status submisi (`resources/js/components/SubmissionStatusBadge.tsx`): Komponen grafis yang membubuhkan warna status (`In Review` = oranye, `Published` = hijau) di Dashboard. Berfungsi mempercepat identifikasi nasib sebuah karya ilmiah.
- Linimasa riwayat status (`resources/js/components/SubmissionTimeline.tsx`): Papan infografis jejak langkah (seperti pelacakan _tracking_ paket kurir e-commerce). Berfungsi menerangkan transparansi historis kapan naskah dikirim, kapan dinilai, dan kapan direvisi secara detik demi detik.

**7. Integration Requirements**

- Submit berhasil akan masuk ke Inbox Editor di `Editorial/DeskController`.

---

### Modul 3: Editorial Desk & Assignment

**1. Definisi Entitas / Deskripsi Awal**
Pusat kendali bagi _Editor-in-Chief_ dan _Section Editor_ untuk menerima (triage), memproses pra-evaluasi, menugaskan Reviewer, dan mengeluarkan putusan persetujuan/penolakan.

**2. Data Requirements**

- `editorial_assignments`: Relasi naskah dengan _Editor_.
- `editorial_decisions`: Arsip rekam jejak setiap putusan.
- `plagiarism_checks`: File hasil _Turnitin / iThenticate_ dan angka indeks plagiarisme.

**3. Business Rules**

- Editor Utama memiliki kapabilitas _Desk Reject_ (Tolak naskah di awal tanpa review eksternal).
- _Section Editor_ hanya merekomendasikan putusan, disahkan menjadi Final Decision oleh _Editor Utama_.
- Komunikasi tertutup antar-editor dapat terjadi.

**4. Functional Requirements**

- **Create**: Menugaskan Section Editor via `Editorial/DeskController@assignEditor` atau upload Cek Plagiarisme via `Editorial/PlagiarismController@store`.
- **Read**: Membuka dashboard inbox editor (`inbox()`). Meninjau file naskah nirkabel secara langsung (`show()`).
- **Update**: Pembuatan Putusan Desk Review (`decisionController@deskReview`), Putusan Akhir (`finalDecision()`), atau putaran ronde ulang (`updateRound()`).
- **Discuss**: Editor & Author saling berbalas melalui sistem tiket `EditorialDiscussionController`.

**5. Validation Rules**

- `EditorialDecisionRequest` memastikan _Decision Note_ wajib terisi minimal 50 karakter apabila Editor memilih 'Reject'.

**6. User Interface Requirements**

- Antarmuka navigasi Inbox ber-tab (`resources/js/components/InboxTab.tsx` di `Desk/Inbox.tsx`): Papan tata kelola dengan 4 tab layar utama (_Unassigned, Active, Awaiting Decision, Archived_) disertai gelembung angka naskah. Berfungsi mengisolasi perhatian Editor secara fokus berdasar fase antrean pekerjaan.
- Penampil dokumen naskah nirkabel / tertanam (`resources/js/components/InlinePdfViewer.tsx`): Modul layar PDF di dalam halaman detail naskah (_embed iframe/pdf.js_). Berfungsi supaya Editor dapat membaca dan menyaring awal naskah (_Desk Review_) secara kilat tanpa menyampah memori _download_ komputernya.
- Modal pengalokasian pimpinan rubrik (`resources/js/components/AssignEditorModal.tsx`): Layar konfirmasi pembagian tugas untuk para pimpinan komite (Section Editor). Berfungsi memastikan naskah masuk ke meja pakar yang sesuai klaster ilmunya.
- Lencana analisis plagiasi (`resources/js/components/SimilarityBadge.tsx`): Indikator warna mencolok (misal: Merah Darah jika _Turnitin_ > 25%) di laman `Desk/Plagiarism.tsx`. Berfungsi sebagai asisten peringatan dini terhadap bahaya pelanggaran hak cipta intelektual.
- Panel histori jejak putusan (`resources/js/components/DecisionHistoryPanel.tsx`): Jendela samping (sidebar/drawer) yang merekam kapan saja ronde revisi telah terjadi di ranah keredaksian. Berfungsi memperkuat argumen putusan akhir editor.
- Modul antarmuka pesan chat / diskusi (_Thread_) (`resources/js/components/DiscussionThread.tsx`): Forum komunikasi internal tertutup berbasis kotak percakapan layaknya forum modern. Berfungsi merekam rapat dewan redaksi seputar satu naskah.

**7. Integration Requirements**

- Putusan _Accept For Review_ mengirim artikel tersebut secara logis ke Modul 4.

---

### Modul 4: Peer Review System

**1. Definisi Entitas / Deskripsi Awal**
Modul inti peninjauan pakar dengan skema **Double-Blind Review** yang ketat, mengisolasi identitas dan membimbing proses skoring kualitatif dan kuantitatif.

**2. Data Requirements**

- `review_assignments`: Menampung tenggat waktu (due_date) dan persetujuan penugasan.
- `review_forms`: Entri terpisah berdasar parameter kriteria yang ditanyakan.
- `review_decisions`: Ringkasan rekomendasi & komentar konfidensial _Reviewer_.

**3. Business Rules**

- **Double-Blind Review**: File naskah dianonimisasi oleh mesin otomatis (metadata identitas dihapus) sebelum diluncurkan ke Reviewer.
- Reviewer membalas undangan dalam 7 hari; apabila nihil akan otomatis kedaluwarsa.
- Reviewer tidak dapat men-_submit_ hingga semua skor kriteria terisi genap.

**4. Functional Requirements**

- **Create**: Editor meng-invite reviewer via `ReviewAssignmentController@invite`.
- **Update**: Reviewer bisa memutus menerima/menolak di `ReviewAssignmentController@respond`. Reviewer mengisi penilaian `ReviewController@showManuscript` s/d `submitRecommendation()`. Editor berhak menambah perpanjangan waktu `extendDue()`.
- **Read**: Dashboard Reviewer mengekstraksi data to-do-list (`ReviewerDashboardController@index`). Editor memantau komparasi via `ReviewSummaryController@index`.
- **Delete**: Membatalkan penugasan reviewer mandek (`cancel()`).

**5. Validation Rules**

- Reviewer dijaga oleh `ReviewSubmissionRequest` untuk memastikan total kriteria disi komplit dengan skala angka 1-5, dan `overall_comment` tak boleh hampa.

**6. User Interface Requirements**

- Kartu identitas kandidat peninjau (`resources/js/components/ReviewerCandidateCard.tsx`): Blok kotak desain _Bento/Card_ yang tidak hanya menampilkan nama, tapi menyertakan irisan _tag_ keahlian dan statistik rekam jejak jumlah naskah yang pernah ia baca di `Review/InviteReviewer.tsx`. Berfungsi mencarikan jodoh pakar peninjau (_Reviewer_) yang akurat untuk manuskrip yang spesifik.
- Modal konfirmasi penolakan / pembatalan (`resources/js/components/CancelReviewModal.tsx`): Jendela _pop-up_ isian teks saat seseorang menolak perintah peninjauan. Berfungsi meminta kewajiban pelaporan alasan (Sakit/Bentrok/Tidak relevan).
- Form rubrik penskoran interaktif (`resources/js/components/RubricScoreInput.tsx`): Lembar kuesioner bersistem poin yang saat diklik barisnya akan bereaksi secara matematis mengkalkulasi skoring akhir secara otomatis (_real-time_). Berfungsi mempercepat entri angka evaluasi teknis.
- Tabel matriks komparasi hasil lintas _Reviewer_ (`resources/js/components/ReviewMatrixTable.tsx`): Tampilan antarmuka yang membenturkan dan menderetkan secara berdampingan (_side-by-side_) apa hasil ulasan Reviewer A dan Reviewer B di halaman `Review/Summary.tsx`. Berfungsi mempermudah Editor Utama saat mencari titik penengah simpulan beda pendapat pakar.
- Lencana indikator putaran ronde perbaikan (`resources/js/components/ReviewRoundBadge.tsx`): Penanda stiker sederhana ("Ronde 1", "Ronde 2", dst) pada kartu manuskrip. Berfungsi menunjukan seberapa alot pergulatan persetujuan manuskrip tersebut.

**7. Integration Requirements**

- Sistem `AnonymizeService.php` berjalan secara latar belakang (_background_).
- Rekomendasi di-_forward_ ke Editor untuk di-Tinjau di Modul 5.

---

### Modul 5: Revision & Copyediting Workflow

**1. Definisi Entitas / Deskripsi Awal**
Manajemen siklus revisi dari _Author_ ke _Editor_ beserta fasilitas penjenjangan versi file (_Versioning_). Setelah disetujui penuh, artikel berlanjut ke tahap _Copyediting_.

**2. Data Requirements**

- `revision_rounds`: Informasi due date perbaikan author.
- `copyediting_tasks`: Rekam aktivitas staf koreksi ejaan (_Copyeditor_).
- `submission_discussions`: Wadah tiket diskusi (_Message Bubble_).

**3. Business Rules**

- Tiap perputaran revisi dari Author melahirkan versi dokumen baru (tidak ada data lama yang dihapus / _Overwritten_).
- Artikel lolos ke fase _Copyediting_ hanya setelah di-_Accept_ oleh putusan editorial pasca-revisi.
- Terbitan tertunda sampai _Author_ secara sadar merestui (konfirmasi setuju) dengan hasil penyuntingan (Klausul Finalisasi Copyedit).

**4. Functional Requirements**

- **Create**: Author upload perbaikan file (`RevisionController@uploadRevision`). Editor membuka diskusi anyar (`DiscussionController@store`). Copyeditor mengunggah hasil sunting (`CopyeditingController@uploadCopyedited`).
- **Read**: Melihat utas versi histori naskah (`versionHistory()`).
- **Update**: Editor menerima atau memutarkan lagi naskah (`EditorRevisionController@decide`). Penyetujuan penulis (`authorApprove()`).

**5. Validation Rules**

- File lampiran revisi mutlak PDF/DOCX sebelum menekan Simpan.
- Pengecekan pada request kelas `StoreDiscussionRequest` saat mengutarakan balasan pada forum.

**6. User Interface Requirements**

- Panel panduan ulasan peninjau (`resources/js/components/RevisionNotePanel.tsx`): Kotak sorotan bacaan tempat Author dapat membaca keseluruhan reviu kritis pakar (tanpa identitas anonim). Berfungsi sebagai penunjuk jalan perbaikan makalah.
- Penampil hierarki sejarah lampiran dokumen (`resources/js/components/DocumentVersionList.tsx`): Daftar susunan tautan unduh berdasarkan jejak waktu. Mengamankan keutuhan arsip dari putaran awal hingga final. Berfungsi agar tim tidak kehilangan rekam berkas perputaran iterasi ronde yang lampau.
- Meja kerja sunting tiga kolom (`resources/js/pages/Copyediting/CopyeditorPanel.tsx`): Antarmuka layar super lebar yang terpisah vertikal: Layar A (Teks Ori), Layar B (Teks Baru), Layar C (Catatan). Berfungsi sebagai meja operasi _layout/copyediting_ bahasa yang ergonomis.
- Gelembung pesan forum obrolan (`resources/js/components/MessageBubble.tsx`): Kotak pesan dialog percakapan ala _WhatsApp_ / surel tertanam yang menyematkan metadata pengirim di laman `Discussion/Thread.tsx`. Berfungsi untuk mencatatkan keluhan, sanggahan perbaikan, maupun komunikasi informal selama proses iterasi revisi.

**7. Integration Requirements**

- Saling terkait dengan infrastruktur perputaran notifikasi email saat perputaran pesan baru (Modul 7).

---

### Modul 6: Production & Issue Management

**1. Definisi Entitas / Deskripsi Awal**
Modul operasional penerbitan, pendistribusian artikel secara kronologis menjadi wujud Terbitan (Issue), pengaturan halaman PDF Akhir (_Galleys_), hingga penguncian Table of Contents.

**2. Data Requirements**

- `issues`: Metadata terbitan (Volume, Nomor, Tahun, Deskripsi).
- `galleys`: Pengarsipan layout terpublikasi final dari satu naskah (Format File HTML/XML/PDF, DOI, Halaman, Sequence posisi urutan).

**3. Business Rules**

- Pembuatan Issue dilakukan secara khusus oleh **Production Editor / Admin**.
- Naskah antre masuk Issue hanya bagi naskah beraliran status _Completed_ dari Copyediting.
- Eksekusi _Publish Issue_ bersifat serentak: Seluruh manuskrip di dalamnya langsung disebar kepada dunia (_Published_ status).

**4. Functional Requirements**

- **Create**: Men-setup bundel Issue baru di `IssueController@store` dan menyimpan PDF akhir per manuskrip di `GalleyController@store`.
- **Read**: Menyajikan _Queue List_ antrean publikasi (`ProductionQueueController@index`) dan Halaman Katalog Issue Publik.
- **Update**: Menyusun tata letak halaman `GalleyController@updateMeta` (penetapan DOI/Halaman). Pengaturan daftar urutan isi manuskrip dalam issue (`assignToIssue()`). Menerbitkan Edisi Jurnal (`publish()`).
- **Delete**: _Destruct_ bundel Issue jika dan hanya jika belum ada manuskrip bersarang (`IssueController@destroy`).

**5. Validation Rules**

- Constraint pada tabel: `StoreIssueRequest` mengharamkan kesamaan kombinasi kombinasi _[Volume + Nomor + Tahun]_ di database jurnal yang sama.
- Validasi Keunikan DOI per baris manuskrip (`updateMeta`).

**6. User Interface Requirements**

- Pengatur urutan hierarki daftar isi jurnal (`resources/js/components/ArticleSequencer.tsx` & `TOCEditor.tsx`): Antarmuka list dinamis yang memungkinkan admin menyeret dan menjatuhkan (_Drag and Drop_) baris artikel ke atas atau bawah. Berfungsi menata letak estetis indeks Table of Contents (Daftar Isi) sebuah buku terbitan sebelum dibekukan.
- Kartu Edisi Jurnal (`resources/js/components/IssueCard.tsx`): Antarmuka visual blok kartu pameran yang disisipi Cover Gambar Issue (Edisi), Volume, Nomor, Tahun. Berfungsi merapikan dan menjadikan arsip _Back Issues_ menarik dipandang audiens.
- Kotak dialog daftar periksa rilis (_Checklist_) (`resources/js/components/PublishChecklist.tsx`): Sebuah modul _pop-up_ krusial berlapis ganda (mensyaratkan centang manual pada checkbox seperti _"Apakah DOI sudah final?"_) sesaat sebelum rilis. Berfungsi mencegah terbitnya edisi yang masih bolong kelengkapannya atau diakibatkan klik tanpa sadar.
- Halaman tata Kelola Metadata Cetak (_Pagination_) (`resources/js/pages/Production/Galley/SetMeta.tsx`): Lembar formulir presisi untuk menetapkan angka penomoran halaman (Hal 10-15) dan pengait URL DOI untuk Galley PDF akhirnya. Berfungsi men-standardisasi sitasi dokumen di jagat daring internasional.

**7. Integration Requirements**

- Menyediakan pipa transmisi langsung (`Api/PublishedArticleController`) agar sistem publik (Kelas B) bisa membaca dan mem-fetch artikel PDF diterbitkan ini secara REST.

---

### Modul 7: Notifikasi, Komunikasi & Diskusi Internal

**1. Definisi Entitas / Deskripsi Awal**
Jantung relai notifikasi sistem dan mekanisme otomasi pengiriman surel email yang dimanajemen secara independen pada _background tasks_.

**2. Data Requirements**

- `notifications`: Menyimpan peringatan _in-app_ (`unread` counter).
- `email_templates`: Konfigurasi _boilerplate_ email, berisikan tag format (_shortcodes_ seperti `{author_name}`).
- `announcements`: Pengumuman global dengan masa basi kalender (kedaluwarsa).
- `activity_logs`: Rangkaian seluruh perubahan data submission dari detik A sampai Z.

**3. Business Rules**

- Komunikasi tidak boleh _blocking_ (membuat website loading lama), setiap email dilontarkan melalui server antrean asinkron (Laravel Queue).
- Pengguna hanya melihat notifikasi miliknya (Auth Scoped).
- Activity Log tidak bisa ditarik/dihapus; pencatatan abadi (_append-only_).

**4. Functional Requirements**

- **Create/Send**: Pembuatan log jejak otomatis diawasi sistem Observer (`SubmissionObserver@created`/`updated`). Mendorong ke Antrean eksekusi email (`SendNotificationEmail.php` via Laravel Job). Mengunggah berita pengumuman (`AnnouncementController@store`).
- **Read**: Daftar lonceng peringatan `NotificationController@index` dan Log aktivitas terpisah `ActivityLogController@index`.
- **Update**: Membaca notifikasi `markRead()`, `markAllRead()`. Menyunting body pesan email template `Admin/EmailTemplateController@update`.
- **Delete**: Luruhnya pemberitahuan informasi apabila tanggal melewati kedaluwarsa di sistem.

**5. Validation Rules**

- _Template Check_: Rutinitas verifikasi sistem untuk mendeteksi _Missing Token_ saat Administrator membuat Email Template.
- Penanggalan warta informasi Announcement tak boleh berlalu surut (masa lampau).

**6. User Interface Requirements**

- Pusat Ikon Lonceng Notifikasi (`resources/js/components/NotificationBell.tsx`): _Widget_ kecil peluit notifikasi _in-app_ yang mekar ke bawah (_dropdown list_) jika ditekan, terletak sakral di _Navbar_ atas. Berfungsi sebagai interupsi kewaspadaan kepada penggunanya bahwa sebuah penugasan menunggunya.
- Pengelola format cetak biru surel (`resources/js/pages/Admin/EmailTemplate/Edit.tsx`): Halaman administrasi yang disokong perangkat _Rich Text Editor_ untuk menyusun draf email yang elegan. Berfungsi memberikan pimpinan redaksi keleluasaan merangkai diksi persuratan robot (variabel) secara estetis tanpa bersentuhan dengan program _backend_.
- Lini masa audit jejak tindakan (`resources/js/components/ActivityLogTimeline.tsx`): Diagram rel waktu linier yang berderet secara vertikal menjuntai ke bawah dari paling lawas ke hari ini (`Editorial/ActivityLog.tsx`). Berfungsi sebagai CCTV dokumenter (_Audit Trail_) jika terjadi miskomunikasi, salah klik status, penipuan integritas reviu, maupun penyangkalan aksi di masa lalu.
- Laci rekapitulasi surat pemberitahuan sistem (`resources/js/pages/Notifications/Index.tsx`): Keranjang besar yang menampung daftar panjang tabel riwayat seluruh _alert_ pemberitahuan, berbekal fitur "Tandai Semua Telah Dibaca". Berfungsi sebagai arsip bacaan kembali bagi para _user_ yang mendapati kotak notifikasinya kebanjiran informasi.

**7. Integration Requirements**

- `EmailNotificationService.php` berfungsi sebagai agregator yang bisa disuntikkan (_Dependency Injected_) di Controller mana pun yang membutuhkan transmisi surat elektrik.
