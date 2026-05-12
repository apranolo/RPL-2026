# Product Requirement Document (PRD)
## Submission System Terintegrasi — Kelas G
### Berbasis Open Journal Systems (OJS)

Dokumen ini berisi spesifikasi kebutuhan untuk 7 modul utama Submission System yang terintegrasi dengan proyek JurnalMu, disusun menggunakan standar format analisis kebutuhan.

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
- `invited_at` (Timestamp, Nullable)
- `accepted_at` (Timestamp, Nullable)

Untuk Profil Author:
- `orcid_id` (String, Nullable, Unique)
- `affiliation` (String, Required)
- `research_interests` (Text, Nullable)
- `biography` (Text, Nullable)

**3. Business Rules**
- Setiap pengguna yang baru mendaftar mendapat peran **Author** secara default.
- Peran Editor, Reviewer, dan lainnya hanya dapat diberikan oleh **Admin** melalui sistem undangan.
- Reviewer yang menolak undangan (Declined) tetap tercatat dalam log dan dapat diundang kembali di submission lain.
- Admin tidak dapat menghapus peran yang sedang aktif terkait dengan submission yang sedang berjalan.

**4. Functional Requirements**
- **Create**: Admin membuat undangan peran baru ke pengguna terdaftar. Pengguna baru mendaftar sebagai Author.
- **Read**: Halaman manajemen pengguna & peran untuk Admin. Halaman profil pribadi untuk semua peran.
- **Update**: Pengguna memperbarui profil (afiliasi, ORCID, bio). Admin mengubah status aktif/nonaktif peran.
- **Delete**: Admin mencabut peran dengan soft-delete (peran dinonaktifkan, bukan dihapus).

**5. Validation Rules**
- *Format ORCID*: Jika diisi, wajib mengikuti format `XXXX-XXXX-XXXX-XXXX`. Pesan: "Format ORCID tidak valid."
- *Required fields (Profil Author)*: Nama Lengkap dan Afiliasi wajib diisi sebelum dapat melakukan submission. Pesan: "Lengkapi profil Anda sebelum submit naskah."
- *Role Conflict*: Satu pengguna tidak dapat menjadi Author sekaligus Reviewer pada submission yang sama.

**6. User Interface Requirements**
- **Admin**: Tabel manajemen pengguna dengan kolom Nama, Email, Peran Aktif, dan tombol aksi (Invite Role, Revoke).
- **User**: Halaman profil dengan form edit, badge peran yang dimiliki, dan tombol accept/decline undangan peran.

**7. Integration Requirements**
- Menjadi fondasi sistem otorisasi untuk semua 6 modul lainnya.
- Data profil Author otomatis ditarik sebagai metadata kontributor saat proses submission (Modul 2).

---

### Modul 2: Author Submission Wizard

**1. Definisi Entitas / Deskripsi Awal**
Modul antarmuka utama bagi penulis (Author) untuk mengirimkan naskah ilmiah melalui proses multi-langkah (wizard) yang terstruktur, memastikan semua metadata dan dokumen terkumpul secara lengkap sebelum masuk ke meja editor.

**2. Data Requirements**

Tabel `submissions`:
- `id_submission` (Primary Key)
- `id_author` (Foreign Key ke `users`, Required)
- `id_journal` (Foreign Key ke `journals`, Required)
- `title` (String, Max 500, Required)
- `abstract` (Text, Required, Max 3000 karakter)
- `keywords` (String/JSON, Required)
- `language` (String, Default: `id`)
- `status` (Enum: Draft, Submitted, InReview, Revision, Accepted, Rejected, Published; Default: Draft)
- `submitted_at` (Timestamp, Nullable)
- `current_round` (Integer, Default: 1)

Tabel `submission_files`:
- `id_file` (Primary Key)
- `id_submission` (Foreign Key)
- `file_type` (Enum: ManuscriptMain, SupplementaryFile, RevisionFile, Galley)
- `file_path` (String, Required)
- `original_name` (String)
- `round` (Integer, Default: 1)

Tabel `submission_contributors`:
- `id_contributor` (Primary Key)
- `id_submission` (Foreign Key)
- `full_name` (String, Required)
- `email` (String, Required)
- `affiliation` (String, Required)
- `orcid_id` (String, Nullable)
- `is_corresponding` (Boolean, Default: false)

**3. Business Rules**
- Hanya pengguna dengan peran **Author** yang dapat membuat submission baru.
- Submission hanya dapat diedit/dilanjutkan wizard-nya jika status masih **Draft**.
- Setelah dikonfirmasi submit, status berubah menjadi **Submitted** dan naskah masuk antrian Editor.
- Author wajib menyertakan minimal satu Co-Author (diri sendiri otomatis terdaftar sebagai *Corresponding Author*).
- File naskah utama wajib berformat `.docx` atau `.pdf` dengan ukuran maksimal 20MB.

**4. Functional Requirements**
- **Create**: Wizard 5-langkah: Start → Upload → Metadata → Contributors → Confirm.
- **Read**: Halaman daftar semua submission milik Author (Dashboard Author) dengan status tracking.
- **Update**: Author melanjutkan draft yang belum selesai. Author mengunggah revisi saat diminta Editor.
- **Delete**: Author dapat membatalkan (soft-delete) submission yang masih berstatus Draft.

**5. Validation Rules**
- *Required*: Judul, Abstrak, Kata Kunci, File Naskah, minimal 1 kontributor. Pesan: "Field [nama] wajib diisi."
- *File Upload*: Naskah utama wajib `.docx` atau `.pdf`, maks 20MB. Pesan: "Format file tidak valid atau ukuran melebihi 20MB."
- *Abstract Length*: Abstrak minimal 150 karakter, maksimal 3000 karakter.
- *Keywords*: Minimal 3 kata kunci, maksimal 10 kata kunci.

**6. User Interface Requirements**
- Wizard dengan progress bar di bagian atas (menampilkan step yang aktif dan yang sudah selesai).
- Tombol "Save Draft" tersedia di setiap step agar Author tidak kehilangan progress.
- Halaman Dashboard Author menampilkan status submission dalam bentuk timeline/badge berwarna.

**7. Integration Requirements**
- Data submission yang berstatus Submitted secara otomatis muncul di inbox Editor (Modul 3).
- File revisi yang diunggah Author terhubung dengan putaran review yang aktif (Modul 4 & 5).

---

### Modul 3: Editorial Desk & Assignment

**1. Definisi Entitas / Deskripsi Awal**
Modul pusat kendali bagi Editor-in-Chief dan Section Editor dalam menerima, mengevaluasi awal, dan mendistribusikan naskah masuk kepada reviewer yang tepat.

**2. Data Requirements**

Tabel `editorial_assignments`:
- `id_assignment` (Primary Key)
- `id_submission` (Foreign Key)
- `id_editor` (Foreign Key ke `users`)
- `role` (Enum: Editor, SectionEditor)
- `assigned_at` (Timestamp)

Tabel `editorial_decisions`:
- `id_decision` (Primary Key)
- `id_submission` (Foreign Key)
- `id_editor` (Foreign Key)
- `decision` (Enum: AcceptForReview, DeskReject, RequestRevision, Accept, Reject)
- `decision_note` (Text, Nullable)
- `round` (Integer, Default: 1)
- `decided_at` (Timestamp)

Tabel `plagiarism_checks`:
- `id_check` (Primary Key)
- `id_submission` (Foreign Key)
- `similarity_percentage` (Decimal, Nullable)
- `report_file_path` (String, Nullable)
- `checked_by` (Foreign Key ke `users`)
- `checked_at` (Timestamp)

**3. Business Rules**
- Hanya **Editor-in-Chief** yang dapat melakukan keputusan *Desk Reject*.
- *Section Editor* yang ditugaskan berhak menugaskan reviewer dan membuat keputusan rekomendasi, namun keputusan final (Accept/Reject) tetap di tangan Editor.
- Setiap keputusan editorial wajib disertai catatan/alasan.
- Setelah keputusan dibuat, Author secara otomatis mendapat notifikasi.

**4. Functional Requirements**
- **Create**: Penugasan Section Editor ke submission. Pembuatan keputusan editorial.
- **Read**: Inbox naskah baru, daftar naskah aktif per status, riwayat keputusan per submission.
- **Update**: Mengganti Section Editor yang ditugaskan.
- **Delete**: Tidak ada penghapusan permanen. Keputusan bersifat append-only (log).

**5. Validation Rules**
- *Required Note*: Catatan keputusan wajib diisi minimal 50 karakter jika keputusan adalah DeskReject atau Reject.
- *Assignment Conflict*: Editor tidak bisa menugaskan dirinya sendiri sebagai reviewer pada submission yang sama.

**6. User Interface Requirements**
- **Editor Dashboard**: Inbox dibagi dalam tab: Unassigned, Active, Awaiting Decision, Archived.
- Tampilan detail submission dengan PDF viewer inline untuk membaca naskah.
- Panel samping untuk rekap riwayat keputusan dan assignment.

**7. Integration Requirements**
- Keputusan AcceptForReview memicu pembuatan antrian penugasan reviewer di Modul 4.
- Keputusan final Accept memindahkan submission ke alur Copyediting (Modul 5).

---

### Modul 4: Peer Review System

**1. Definisi Entitas / Deskripsi Awal**
Modul inti yang mengelola seluruh proses peninjauan naskah oleh pakar sejawat (peer reviewer), dari pengiriman undangan hingga pemberian rekomendasi akhir, dengan dukungan sistem Double-Blind Review.

**2. Data Requirements**

Tabel `review_assignments`:
- `id_review` (Primary Key)
- `id_submission` (Foreign Key)
- `id_reviewer` (Foreign Key ke `users`)
- `round` (Integer, Default: 1)
- `status` (Enum: Invited, Accepted, Declined, Completed, Cancelled; Default: Invited)
- `invited_at` (Timestamp)
- `due_date` (Date, Required)
- `accepted_at` (Timestamp, Nullable)
- `declined_reason` (Text, Nullable)

Tabel `review_forms`:
- `id_form_entry` (Primary Key)
- `id_review` (Foreign Key)
- `criterion_name` (String)
- `score` (Integer, Range 1-5)
- `comment` (Text, Nullable)

Tabel `review_decisions`:
- `id_review_decision` (Primary Key)
- `id_review` (Foreign Key)
- `recommendation` (Enum: Accept, MinorRevision, MajorRevision, Reject)
- `overall_comment` (Text, Required)
- `confidential_note` (Text, Nullable — hanya terlihat Editor, bukan Author)
- `submitted_at` (Timestamp)

**3. Business Rules**
- Sistem menggunakan **Double-Blind Review**: dokumen naskah yang dikirim ke Reviewer sudah dianonimkan (nama Author dihilangkan). Reviewer tidak mengetahui identitas Author, dan Author tidak mengetahui identitas Reviewer.
- Reviewer wajib merespons undangan (Accept/Decline) dalam **7 hari**. Jika tidak, status otomatis menjadi Cancelled.
- Reviewer tidak dapat submit rekomendasi jika belum mengisi semua kriteria penilaian.
- Editor dapat melihat `confidential_note`, namun Author hanya melihat `overall_comment`.

**4. Functional Requirements**
- **Create**: Editor membuat undangan review. Reviewer mengisi form penilaian dan rekomendasi.
- **Read**: Reviewer melihat daftar undangan dan naskah (versi anonim). Editor melihat rekap hasil semua reviewer per submission.
- **Update**: Reviewer menyimpan draft penilaian sebelum submit final. Editor memperpanjang due date.
- **Delete**: Editor membatalkan undangan (Cancel) jika reviewer tidak merespons.

**5. Validation Rules**
- *Required Score*: Semua kriteria penilaian wajib diisi. Pesan: "Harap isi semua skor penilaian sebelum submit."
- *Score Range*: Skor tiap kriteria antara 1–5. Pesan: "Skor harus berada di rentang 1 hingga 5."
- *Required Comment*: `overall_comment` wajib diisi minimal 100 karakter.
- *Due Date*: Form review tidak bisa di-submit setelah due date terlewat.

**6. User Interface Requirements**
- **Reviewer Dashboard**: Daftar undangan (Accept/Decline), daftar tugas review aktif, form penilaian dengan auto-kalkulasi skor agregat real-time.
- **Editor View**: Matriks perbandingan rekomendasi multi-reviewer side-by-side.
- File naskah ditampilkan via inline PDF viewer tanpa metadata identitas.

**7. Integration Requirements**
- Setelah semua reviewer submit, Editor di Modul 3 mendapat notifikasi untuk membuat keputusan final.
- Rekomendasi Revision memicu Author di Modul 5 untuk mengunggah revisi.

---

### Modul 5: Revision & Copyediting Workflow

**1. Definisi Entitas / Deskripsi Awal**
Modul yang mengelola proses pasca-review: komunikasi revisi antara Author dan Editor, serta tahap penyuntingan (copyediting) oleh Copyeditor untuk memastikan naskah siap produksi.

**2. Data Requirements**

Tabel `revision_rounds`:
- `id_round` (Primary Key)
- `id_submission` (Foreign Key)
- `round_number` (Integer)
- `revision_due_date` (Date, Nullable)
- `revision_note` (Text — catatan revisi dari Editor untuk Author)
- `status` (Enum: AwaitingRevision, Submitted, ReviewedByEditor)

Tabel `copyediting_tasks`:
- `id_task` (Primary Key)
- `id_submission` (Foreign Key)
- `id_copyeditor` (Foreign Key ke `users`, Nullable)
- `status` (Enum: Pending, InProgress, AwaitingAuthorConfirm, Completed)
- `editor_note` (Text, Nullable)
- `copyeditor_note` (Text, Nullable)

Tabel `submission_discussions`:
- `id_discussion` (Primary Key)
- `id_submission` (Foreign Key)
- `stage` (Enum: Submission, Review, Copyediting, Production)
- `initiated_by` (Foreign Key ke `users`)
- `subject` (String, Required)
- `created_at` (Timestamp)

Tabel `discussion_messages`:
- `id_message` (Primary Key)
- `id_discussion` (Foreign Key)
- `sender_id` (Foreign Key ke `users`)
- `body` (Text, Required)
- `attachment_path` (String, Nullable)
- `sent_at` (Timestamp)

**3. Business Rules**
- Author wajib mengunggah file revisi sebelum batas waktu yang ditetapkan Editor.
- Setiap ronde revisi menghasilkan versi file baru — file lama tidak dihapus (versioning).
- Setelah Author submit revisi, Editor meninjau dan menentukan: langsung Accept, kembali ke Reviewer, atau minta revisi lagi.
- Tahap Copyediting hanya dimulai setelah Editor membuat keputusan **Accept**.
- Author wajib menyetujui hasil copyediting sebelum naskah masuk ke tahap Production.

**4. Functional Requirements**
- **Create**: Author mengunggah file revisi. Copyeditor mengunggah versi yang sudah disunting.
- **Read**: Timeline riwayat semua versi file per ronde. Thread diskusi per tahap.
- **Update**: Editor memperpanjang batas waktu revisi. Copyeditor mengedit catatan.
- **Delete**: Tidak ada penghapusan file (semua versi dipertahankan sebagai arsip).

**5. Validation Rules**
- *File Required*: Author wajib mengunggah minimal satu file revisi sebelum submit revisi. Pesan: "Unggah file revisi terlebih dahulu."
- *Format File*: File revisi wajib `.docx` atau `.pdf`. Pesan: "Format file tidak didukung."
- *Revision Due Date*: Jika melewati batas waktu, form upload revisi dinonaktifkan dan status berubah otomatis.

**6. User Interface Requirements**
- **Author**: Panel revisi menampilkan catatan Editor dari Reviewer, kolom upload file revisi, dan tombol submit revisi.
- **Copyeditor**: Panel tiga kolom (File Original | File Copyedited | Catatan) untuk memudahkan proses sunting.
- **Diskusi**: UI Thread-style mirip email (Subject, Pesan, Attachment, Reply).

**7. Integration Requirements**
- File revisi final yang disetujui Editor diteruskan ke Modul 6 (Production) sebagai bahan Galley.
- Setiap aksi (revisi submit, copyediting selesai) memicu notifikasi di Modul 7.

---

### Modul 6: Production & Issue Management

**1. Definisi Entitas / Deskripsi Awal**
Modul pengelolaan artikel yang telah melewati seluruh tahap editorial dan siap diterbitkan. Modul ini mengelola pembuatan terbitan (Issue), penempatan artikel, dan proses publikasi akhir.

**2. Data Requirements**

Tabel `issues`:
- `id_issue` (Primary Key)
- `id_journal` (Foreign Key ke `journals`)
- `volume` (Integer, Required)
- `number` (Integer, Required)
- `year` (Year, Required)
- `title` (String, Nullable — untuk Issue tematik)
- `description` (Text, Nullable)
- `published_at` (Timestamp, Nullable — NULL berarti belum terbit)
- `status` (Enum: Draft, Published; Default: Draft)

Tabel `galleys`:
- `id_galley` (Primary Key)
- `id_submission` (Foreign Key)
- `id_issue` (Foreign Key, Nullable — NULL berarti belum dijadwalkan)
- `label` (String, e.g., "PDF", "HTML", "XML")
- `file_path` (String, Required)
- `page_from` (Integer, Nullable)
- `page_to` (Integer, Nullable)
- `doi` (String, Nullable, Unique)
- `sequence` (Integer — urutan dalam Issue)

**3. Business Rules**
- Hanya **Production Editor** dan **Admin** yang dapat membuat dan mengelola Issues.
- Artikel hanya dapat masuk ke Issue jika statusnya telah **Accepted** dan proses Copyediting telah **Completed**.
- Satu artikel hanya dapat masuk ke satu Issue.
- Saat sebuah Issue di-*publish*, semua artikel di dalamnya statusnya berubah menjadi **Published** secara serentak.
- DOI harus bersifat unik di seluruh sistem jika diisi.

**4. Functional Requirements**
- **Create**: Membuat Issue baru. Menambahkan Galley file untuk artikel. Menjadwalkan artikel ke Issue.
- **Read**: Tampilan daftar Issue (Published & Draft). Tampilan preview Issue sebelum publish.
- **Update**: Mengubah metadata Issue. Mengubah urutan artikel dalam Issue. Mengubah nomor halaman.
- **Delete**: Menghapus Issue yang masih Draft (jika belum ada artikel di dalamnya).

**5. Validation Rules**
- *Unique Issue*: Kombinasi Volume + Number + Tahun + Jurnal harus unik. Pesan: "Issue dengan volume dan nomor tersebut sudah ada."
- *Unique DOI*: DOI tidak boleh duplikat. Pesan: "DOI sudah terdaftar pada artikel lain."
- *Publish Requirement*: Issue tidak bisa di-publish jika tidak memiliki minimal 1 artikel.

**6. User Interface Requirements**
- **Issue Table of Contents Editor**: Tampilan drag-and-drop untuk mengatur urutan artikel dalam sebuah Issue.
- Tombol "Preview Issue" untuk melihat tampilan publik sebelum publish.
- Tombol "Publish Issue" dengan dialog konfirmasi dan checklist akhir.

**7. Integration Requirements**
- Artikel yang Published otomatis muncul di portal publik JurnalMu (Kelas B).
- DOI yang diisi teregistrasi dan muncul di halaman detail artikel publik.

---

### Modul 7: Notifikasi, Komunikasi & Diskusi Internal

**1. Definisi Entitas / Deskripsi Awal**
Modul infrastruktur komunikasi yang memastikan semua pemangku peran mendapat informasi yang tepat pada waktu yang tepat, baik melalui notifikasi in-app maupun email otomatis.

**2. Data Requirements**

Tabel `notifications`:
- `id_notification` (Primary Key)
- `id_user` (Foreign Key ke `users` — penerima)
- `type` (String — nama event, e.g., `ReviewInvited`, `DecisionMade`)
- `data` (JSON — berisi konteks notifikasi: id_submission, judul, nama pengirim)
- `read_at` (Timestamp, Nullable — NULL berarti belum dibaca)
- `created_at` (Timestamp)

Tabel `email_templates`:
- `id_template` (Primary Key)
- `id_journal` (Foreign Key, Nullable — NULL berarti template global)
- `event_key` (String, Unique per journal, e.g., `REVIEW_INVITATION`)
- `subject` (String, Required)
- `body_html` (Text, Required — mendukung variabel: `{author_name}`, `{submission_title}`, dll)

Tabel `announcements`:
- `id_announcement` (Primary Key)
- `id_journal` (Foreign Key)
- `title` (String, Required)
- `content` (Text, Required)
- `published_at` (Timestamp)
- `expires_at` (Timestamp, Nullable)

Tabel `activity_logs`:
- `id_log` (Primary Key)
- `id_submission` (Foreign Key, Nullable)
- `id_user` (Foreign Key)
- `action` (String — e.g., "submitted_revision", "made_decision")
- `description` (Text)
- `logged_at` (Timestamp)

**3. Business Rules**
- Setiap event penting (submit, undangan, keputusan) wajib menghasilkan notifikasi in-app.
- Email otomatis dikirim menggunakan template yang dapat dikustomisasi per jurnal oleh Admin/Editor.
- Pengguna dapat menandai notifikasi sebagai sudah dibaca secara satu per satu atau semua sekaligus.
- Activity Log bersifat append-only (tidak dapat diubah atau dihapus) untuk menjaga integritas audit trail.
- Announcement tampil di halaman utama portal jurnal dan memiliki fitur kadaluarsa otomatis.

**4. Functional Requirements**
- **Create**: Sistem membuat notifikasi otomatis saat event terjadi. Admin/Editor membuat Announcement.
- **Read**: Bell notification dengan badge unread count. Halaman "Semua Notifikasi". Halaman Activity Log per submission (untuk Editor).
- **Update**: Tandai notifikasi sebagai dibaca. Admin mengedit template email.
- **Delete**: Admin menghapus Announcement yang sudah kadaluarsa.

**5. Validation Rules**
- *Template Variable*: Sistem memvalidasi bahwa variabel dalam template email (e.g., `{submission_title}`) dikenali. Pesan: "Variabel `{nama_var}` tidak dikenali."
- *Announcement Date*: Tanggal kadaluarsa Announcement tidak boleh lebih awal dari tanggal publikasi.

**6. User Interface Requirements**
- **Bell Icon** di Navbar dengan badge angka merah untuk unread count.
- Dropdown notifikasi menampilkan 5 notifikasi terbaru dengan link langsung ke konteks terkait.
- Halaman pengaturan email template dengan rich text editor untuk body email.
- Halaman Activity Log per submission menampilkan timeline kronologis semua aksi.

**7. Integration Requirements**
- Terintegrasi dengan semua modul lain sebagai consumer event.
- Menggunakan Laravel Queue (`database` driver) untuk pengiriman email agar tidak memblokir request.
