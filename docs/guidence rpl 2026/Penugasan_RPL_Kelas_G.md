# Pembagian Tugas Proyek RPL — Kelas G
## Submission System Terintegrasi (OJS-based) untuk JurnalMu

Pembagian tugas ini difokuskan 100% pada **Pengembangan Fitur (Development)**, baik dari sisi *Backend* (Database, Model, Controller, Service) maupun *Frontend* (React Inertia Pages/Components). Setiap mahasiswa mendapatkan tepat **4 tugas** yang membentuk alur *end-to-end* sebuah fitur.

> **PENTING**: Sebelum mulai coding, setiap mahasiswa **wajib** membaca file berikut:
> - `docs/Technical_Guide.md` — Panduan arsitektur MVC & konvensi kode
> - `docs/Integration_Guide.md` — Panduan integrasi dengan proyek Kelas B
>
> Pembuatan komponen Data Layer (Migration, Model, Relasi) **disatukan dalam 1 task** agar kepemilikan struktur data utuh dan tidak terjadi *blocker* antar mahasiswa.

---

### 📑 TAB 1: Manajemen Peran & Profil Pengguna (Role Management)
*(Modul fondasi RBAC untuk seluruh ekosistem sistem. Dikerjakan oleh 5 Mahasiswa)*

| Task | Path (Laravel/React) | Nama Method | Nama Mahasiswa | Acuan / Dependensi |
| :--- | :--- | :--- | :--- | :--- |
| Buat Entitas Data (Migration, Model, Relasi) UserRole & Journal | `app/Models/UserRole.php`, `app/Models/Journal.php` dll | - | ALTAV ELFAZELL | PRD Modul 1 |
| Buat method controller index manajemen pengguna & peran (Admin) | `app/Http/Controllers/Admin/UserRoleController.php` | `index()` | ALTAV ELFAZELL | Tabel user_roles |
| Buat view tabel manajemen pengguna & peran (Admin) | `resources/js/pages/Admin/Users/Index.tsx` | - | ALTAV ELFAZELL | `index()` |
| Buat logic middleware guard per peran (RBAC) | `app/Http/Middleware/RoleMiddleware.php` | `handle()` | ALTAV ELFAZELL | Model UserRole |
| Buat method controller kirim undangan peran ke pengguna (Admin) | `app/Http/Controllers/Admin/UserRoleController.php` | `invite()` | FADLI HAFIZH SIDIQ | Model UserRole |
| Buat view form undangan peran baru (Admin) | `resources/js/pages/Admin/Users/InviteRole.tsx` | - | FADLI HAFIZH SIDIQ | `invite()` |
| Buat method controller accept/decline undangan peran (Pengguna) | `app/Http/Controllers/RoleInvitationController.php` | `respond()` | FADLI HAFIZH SIDIQ | - |
| Buat komponen RoleBadge (tampil multi-peran satu akun) | `resources/js/components/RoleBadge.tsx` | - | FADLI HAFIZH SIDIQ | - |
| Buat Entitas Data (Migration, Model, Relasi) AuthorProfile | `app/Models/AuthorProfile.php` dll | - | HANIF FALAH KURNIAWAN | PRD Modul 1 |
| Buat method controller tampilkan & simpan profil Author | `app/Http/Controllers/ProfileController.php` | `show()`, `update()` | HANIF FALAH KURNIAWAN | Model AuthorProfile |
| Buat view halaman profil Author (edit ORCID, afiliasi, bio) | `resources/js/pages/Profile/AuthorProfile.tsx` | - | HANIF FALAH KURNIAWAN | `show()` |
| Buat request class validasi UpdateProfileRequest | `app/Http/Requests/UpdateProfileRequest.php` | `rules()` | HANIF FALAH KURNIAWAN | - |
| Buat Entitas Data (Migration, Model, Relasi) ReviewerProfile | `app/Models/ReviewerProfile.php` dll | - | ADITIYA SUBAKTI | PRD Modul 1 |
| Buat method controller tampilkan & simpan profil Reviewer | `app/Http/Controllers/ReviewerProfileController.php` | `show()`, `update()` | ADITIYA SUBAKTI | Model ReviewerProfile |
| Buat view halaman profil Reviewer (keahlian, track record review) | `resources/js/pages/Profile/ReviewerProfile.tsx` | - | ADITIYA SUBAKTI | `show()` |
| Buat komponen SkillTagInput (input tag keahlian dinamis) | `resources/js/components/SkillTagInput.tsx` | - | ADITIYA SUBAKTI | - |
| Buat method controller cabut (revoke) peran pengguna (Admin) | `app/Http/Controllers/Admin/UserRoleController.php` | `revoke()` | ADITYA GAUTAMA | Model UserRole |
| Buat view modal konfirmasi revoke peran | `resources/js/components/RevokeRoleModal.tsx` | - | ADITYA GAUTAMA | `revoke()` |
| Buat method controller registrasi pengguna baru (Author default) | `app/Http/Controllers/Auth/RegisterController.php` | `register()` | ADITYA GAUTAMA | - |
| Buat konfigurasi routing & grup middleware per peran di web.php | `routes/web.php` (grup Author, Editor, Reviewer, dll) | - | ADITYA GAUTAMA | RoleMiddleware |

---

### 📑 TAB 2: Author Submission Wizard
*(Modul pengiriman naskah 5-langkah oleh Author. Dikerjakan oleh 6 Mahasiswa)*

| Task | Path (Laravel/React) | Nama Method | Nama Mahasiswa | Acuan / Dependensi |
| :--- | :--- | :--- | :--- | :--- |
| Buat Entitas Data (Migration, Model, Relasi) Submission & SubmissionFile | `app/Models/Submission.php`, `app/Models/SubmissionFile.php` dll | - | MUHAMMAD DZAKY MUAYYAD | PRD Modul 2 |
| Buat method controller index dashboard Author (daftar submission) | `app/Http/Controllers/SubmissionController.php` | `index()` | MUHAMMAD DZAKY MUAYYAD | Tabel submissions |
| Buat view dashboard Author (daftar submission + status badge) | `resources/js/pages/Submission/Index.tsx` | - | MUHAMMAD DZAKY MUAYYAD | `index()` |
| Buat komponen SubmissionStatusBadge (warna per status: Draft/Submitted/InReview/dll) | `resources/js/components/SubmissionStatusBadge.tsx` | - | MUHAMMAD DZAKY MUAYYAD | - |
| Buat method controller Wizard Step 1 (Start: pilih jurnal, persetujuan lisensi) | `app/Http/Controllers/SubmissionWizardController.php` | `start()`, `saveStep1()` | HARYANSYAH DWI NUGROHO | Model Submission |
| Buat view Wizard Step 1 (Pemilihan Jurnal & Persetujuan Syarat) | `resources/js/pages/Submission/Wizard/Step1Start.tsx` | - | HARYANSYAH DWI NUGROHO | `saveStep1()` |
| Buat method controller Wizard Step 2 (Upload file naskah & file tambahan) | `app/Http/Controllers/SubmissionWizardController.php` | `uploadFile()`, `saveStep2()` | HARYANSYAH DWI NUGROHO | - |
| Buat view Wizard Step 2 (Upload Manuscript utama + Supplementary Files) | `resources/js/pages/Submission/Wizard/Step2Upload.tsx` | - | HARYANSYAH DWI NUGROHO | `saveStep2()` |
| Buat method controller Wizard Step 3 (Metadata: Judul, Abstrak, Kata Kunci) | `app/Http/Controllers/SubmissionWizardController.php` | `saveStep3()` | ARIEL ZIJANT ATHALLAH | - |
| Buat view Wizard Step 3 (Form input Judul, Abstrak, Kata Kunci, Bahasa) | `resources/js/pages/Submission/Wizard/Step3Metadata.tsx` | - | ARIEL ZIJANT ATHALLAH | `saveStep3()` |
| Buat komponen KeywordInput (tambah/hapus tag kata kunci dinamis) | `resources/js/components/KeywordInput.tsx` | - | ARIEL ZIJANT ATHALLAH | Step3 |
| Buat method controller save draft submission (di semua step) | `app/Http/Controllers/SubmissionWizardController.php` | `saveDraft()` | ARIEL ZIJANT ATHALLAH | - |
| Buat Entitas Data (Migration, Model, Relasi) SubmissionContributor | `app/Models/SubmissionContributor.php` dll | - | MUHAMMAD FADLI NOOR HIDAYATULLAH | PRD Modul 2 |
| Buat method controller Wizard Step 4 (Contributors: data co-author) | `app/Http/Controllers/SubmissionWizardController.php` | `saveStep4()` | MUHAMMAD FADLI NOOR HIDAYATULLAH | Model Contributor |
| Buat view Wizard Step 4 (Tambah/hapus Co-Author dinamis) | `resources/js/pages/Submission/Wizard/Step4Contributors.tsx` | - | MUHAMMAD FADLI NOOR HIDAYATULLAH | `saveStep4()` |
| Buat komponen ContributorForm (form dinamis data co-author per baris) | `resources/js/components/ContributorForm.tsx` | - | MUHAMMAD FADLI NOOR HIDAYATULLAH | Step4 |
| Buat method controller Wizard Step 5 (Confirm & Submit final) | `app/Http/Controllers/SubmissionWizardController.php` | `confirm()`, `finalSubmit()` | FAUZAN SADIDA RAMADHAN | - |
| Buat view Wizard Step 5 (Ringkasan semua data + tombol Submit) | `resources/js/pages/Submission/Wizard/Step5Confirm.tsx` | - | FAUZAN SADIDA RAMADHAN | `confirm()` |
| Buat komponen WizardProgressBar (step indicator dengan status tiap langkah) | `resources/js/components/WizardProgressBar.tsx` | - | FAUZAN SADIDA RAMADHAN | - |
| Buat request class validasi FinalSubmitRequest | `app/Http/Requests/FinalSubmitRequest.php` | `rules()` | FAUZAN SADIDA RAMADHAN | - |
| Buat method controller detail & status tracking submission (sisi Author) | `app/Http/Controllers/SubmissionController.php` | `show()` | DZAKY RIDHWAN ROSYADA | - |
| Buat view detail submission Author (riwayat status + dokumen) | `resources/js/pages/Submission/Show.tsx` | - | DZAKY RIDHWAN ROSYADA | `show()` |
| Buat method controller batalkan (soft-delete) submission Draft | `app/Http/Controllers/SubmissionController.php` | `cancel()` | DZAKY RIDHWAN ROSYADA | - |
| Buat komponen SubmissionTimeline (timeline visual riwayat status) | `resources/js/components/SubmissionTimeline.tsx` | - | DZAKY RIDHWAN ROSYADA | - |

---

### 📑 TAB 3: Editorial Desk & Assignment
*(Modul pusat kendali Editor dalam menerima dan mendistribusikan naskah. Dikerjakan oleh 6 Mahasiswa)*

| Task | Path (Laravel/React) | Nama Method | Nama Mahasiswa | Acuan / Dependensi |
| :--- | :--- | :--- | :--- | :--- |
| Buat Entitas Data (Migration, Model, Relasi) EditorialAssignment & EditorialDecision | `app/Models/EditorialAssignment.php`, `app/Models/EditorialDecision.php` dll | - | ADITYA BINTANG RIANDA SYAHPUTRA | PRD Modul 3 |
| Buat method controller inbox naskah baru (Editor Dashboard) | `app/Http/Controllers/Editorial/DeskController.php` | `inbox()` | ADITYA BINTANG RIANDA SYAHPUTRA | Tabel submissions |
| Buat view inbox Editor (tab: Unassigned / Active / Awaiting Decision / Archived) | `resources/js/pages/Editorial/Desk/Inbox.tsx` | - | ADITYA BINTANG RIANDA SYAHPUTRA | `inbox()` |
| Buat komponen InboxTab (navigasi tab dengan counter naskah per status) | `resources/js/components/InboxTab.tsx` | - | ADITYA BINTANG RIANDA SYAHPUTRA | - |
| Buat method controller assign Section Editor ke submission | `app/Http/Controllers/Editorial/DeskController.php` | `assignEditor()` | AFIF HADRIANSYAH | Model EditorialAssignment |
| Buat view modal penugasan Section Editor | `resources/js/components/AssignEditorModal.tsx` | - | AFIF HADRIANSYAH | `assignEditor()` |
| Buat method controller desk review (AcceptForReview / DeskReject) | `app/Http/Controllers/Editorial/DecisionController.php` | `deskReview()` | AFIF HADRIANSYAH | - |
| Buat view panel keputusan desk review (form catatan wajib jika reject) | `resources/js/pages/Editorial/Desk/DeskReview.tsx` | - | AFIF HADRIANSYAH | `deskReview()` |
| Buat method controller detail submission untuk Editor (tampil naskah) | `app/Http/Controllers/Editorial/DeskController.php` | `show()` | MUHAMMAD IRFAN HABIBI | - |
| Buat view detail submission Editor (inline PDF viewer + panel riwayat) | `resources/js/pages/Editorial/Desk/Show.tsx` | - | MUHAMMAD IRFAN HABIBI | `show()` |
| Buat komponen InlinePdfViewer React (render PDF tanpa download) | `resources/js/components/InlinePdfViewer.tsx` | - | MUHAMMAD IRFAN HABIBI | - |
| Buat method controller riwayat semua keputusan per submission | `app/Http/Controllers/Editorial/DecisionController.php` | `history()` | MUHAMMAD IRFAN HABIBI | Model EditorialDecision |
| Buat Entitas Data (Migration, Model, Relasi) PlagiarismCheck | `app/Models/PlagiarismCheck.php` dll | - | M. ILHAM NURDIN | PRD Modul 3 |
| Buat method controller upload laporan cek plagiasi (Editor) | `app/Http/Controllers/Editorial/PlagiarismController.php` | `store()` | M. ILHAM NURDIN | Model PlagiarismCheck |
| Buat view upload & tampil hasil cek plagiasi | `resources/js/pages/Editorial/Desk/Plagiarism.tsx` | - | M. ILHAM NURDIN | `store()` |
| Buat komponen SimilarityBadge (badge warna persentase kemiripan) | `resources/js/components/SimilarityBadge.tsx` | - | M. ILHAM NURDIN | - |
| Buat method controller keputusan final Editor (Accept / Reject) | `app/Http/Controllers/Editorial/DecisionController.php` | `finalDecision()` | PRIMUS UTAMA SATYA | - |
| Buat view form keputusan final Editor (catatan wajib min. 50 karakter) | `resources/js/pages/Editorial/Desk/FinalDecision.tsx` | - | PRIMUS UTAMA SATYA | `finalDecision()` |
| Buat request class validasi EditorialDecisionRequest | `app/Http/Requests/EditorialDecisionRequest.php` | `rules()` | PRIMUS UTAMA SATYA | - |
| Buat komponen DecisionHistoryPanel (timeline keputusan editorial) | `resources/js/components/DecisionHistoryPanel.tsx` | - | PRIMUS UTAMA SATYA | - |
| Buat method controller diskusi internal Editor ↔ Author (per submission) | `app/Http/Controllers/Editorial/EditorialDiscussionController.php` | `store()`, `index()` | FUAD NURYANDITO | - |
| Buat view thread diskusi editorial per submission | `resources/js/pages/Editorial/Desk/Discussion.tsx` | - | FUAD NURYANDITO | `index()` |
| Buat komponen DiscussionThread (UI thread-style: subjek, pesan, reply) | `resources/js/components/DiscussionThread.tsx` | - | FUAD NURYANDITO | - |
| Buat method controller update round tracking submission (ronde ke-N) | `app/Http/Controllers/Editorial/DeskController.php` | `updateRound()` | FUAD NURYANDITO | Model Submission |

---

### 📑 TAB 4: Peer Review System
*(Modul inti peninjauan naskah dengan Double-Blind Review. Dikerjakan oleh 6 Mahasiswa)*

| Task | Path (Laravel/React) | Nama Method | Nama Mahasiswa | Acuan / Dependensi |
| :--- | :--- | :--- | :--- | :--- |
| Buat Entitas Data (Migration, Model, Relasi) ReviewAssignment & ReviewForm | `app/Models/ReviewAssignment.php`, `app/Models/ReviewForm.php` dll | - | AGNES PUTRI ALFALAHI | PRD Modul 4 |
| Buat method controller kirim undangan review ke Reviewer | `app/Http/Controllers/Review/ReviewAssignmentController.php` | `invite()` | AGNES PUTRI ALFALAHI | Model ReviewAssignment |
| Buat view panel pemilihan kandidat & pengiriman undangan Reviewer | `resources/js/pages/Review/InviteReviewer.tsx` | - | AGNES PUTRI ALFALAHI | `invite()` |
| Buat komponen ReviewerCandidateCard (card profil reviewer + keahlian) | `resources/js/components/ReviewerCandidateCard.tsx` | - | AGNES PUTRI ALFALAHI | - |
| Buat method controller accept/decline undangan review oleh Reviewer | `app/Http/Controllers/Review/ReviewAssignmentController.php` | `respond()` | MUHAMMAD RIZQI AKBAR HIDAYAT | - |
| Buat view halaman undangan review (tombol Accept/Decline + alasan penolakan) | `resources/js/pages/Review/Invitation.tsx` | - | MUHAMMAD RIZQI AKBAR HIDAYAT | `respond()` |
| Buat method controller index daftar tugas review aktif (Reviewer Dashboard) | `app/Http/Controllers/Review/ReviewerDashboardController.php` | `index()` | MUHAMMAD RIZQI AKBAR HIDAYAT | - |
| Buat view dashboard Reviewer (daftar tugas + status + due date countdown) | `resources/js/pages/Review/Dashboard.tsx` | - | MUHAMMAD RIZQI AKBAR HIDAYAT | `index()` |
| Buat Entitas Data (Migration, Model, Relasi) ReviewDecision | `app/Models/ReviewDecision.php` dll | - | RIFAI AIHUNAN | PRD Modul 4 |
| Buat method controller tampilkan naskah anonim (anonimisasi Double-Blind) | `app/Http/Controllers/Review/ReviewController.php` | `showManuscript()` | RIFAI AIHUNAN | AnonymizeService |
| Buat view form penilaian rubrik Reviewer (skor per kriteria, 1–5) | `resources/js/pages/Review/FormReview.tsx` | - | RIFAI AIHUNAN | `showManuscript()` |
| Buat komponen RubricScoreInput (input skor per kriteria + auto-kalkulasi agregat real-time) | `resources/js/components/RubricScoreInput.tsx` | - | RIFAI AIHUNAN | FormReview.tsx |
| Buat method controller submit rekomendasi final Reviewer | `app/Http/Controllers/Review/ReviewController.php` | `submitRecommendation()` | FARID RIZQULLOH SAPUTRA | Model ReviewDecision |
| Buat view form rekomendasi akhir (Accept / Minor / Major / Reject + overall comment) | `resources/js/pages/Review/Recommendation.tsx` | - | FARID RIZQULLOH SAPUTRA | `submitRecommendation()` |
| Buat method controller save draft penilaian Reviewer (sebelum submit final) | `app/Http/Controllers/Review/ReviewController.php` | `saveDraft()` | FARID RIZQULLOH SAPUTRA | - |
| Buat request class validasi ReviewSubmissionRequest | `app/Http/Requests/ReviewSubmissionRequest.php` | `rules()` | FARID RIZQULLOH SAPUTRA | - |
| Buat method controller rekap hasil review multi-reviewer untuk Editor | `app/Http/Controllers/Review/ReviewSummaryController.php` | `index()` | MOHAMAD ARYA FARIZKY | - |
| Buat view matriks perbandingan rekomendasi multi-reviewer (side-by-side) | `resources/js/pages/Review/Summary.tsx` | - | MOHAMAD ARYA FARIZKY | `index()` |
| Buat komponen ReviewMatrixTable (tabel perbandingan skor + rekomendasi antar reviewer) | `resources/js/components/ReviewMatrixTable.tsx` | - | MOHAMAD ARYA FARIZKY | - |
| Buat method controller perpanjang due date undangan review | `app/Http/Controllers/Review/ReviewAssignmentController.php` | `extendDue()` | MOHAMAD ARYA FARIZKY | - |
| Buat method controller batalkan undangan review (Cancel jika tidak merespons) | `app/Http/Controllers/Review/ReviewAssignmentController.php` | `cancel()` | ANDRA PUTRA DANISWARA LAMATO | - |
| Buat view modal konfirmasi pembatalan undangan review | `resources/js/components/CancelReviewModal.tsx` | - | ANDRA PUTRA DANISWARA LAMATO | `cancel()` |
| Buat logic service anonimisasi dokumen untuk Double-Blind Review | `app/Services/AnonymizeService.php` | `anonymize()` | ANDRA PUTRA DANISWARA LAMATO | - |
| Buat komponen ReviewRoundBadge (tampil badge putaran review ke-N) | `resources/js/components/ReviewRoundBadge.tsx` | - | ANDRA PUTRA DANISWARA LAMATO | - |

---

### 📑 TAB 5: Revision & Copyediting Workflow
*(Modul manajemen revisi pasca-review dan penyuntingan bahasa/format. Dikerjakan oleh 6 Mahasiswa)*

| Task | Path (Laravel/React) | Nama Method | Nama Mahasiswa | Acuan / Dependensi |
| :--- | :--- | :--- | :--- | :--- |
| Buat Entitas Data (Migration, Model, Relasi) RevisionRound & CopyeditingTask | `app/Models/RevisionRound.php`, `app/Models/CopyeditingTask.php` dll | - | SEPTIAN EKO NUGROHO | PRD Modul 5 |
| Buat method controller kirim notifikasi hasil keputusan ke Author | `app/Http/Controllers/Revision/RevisionController.php` | `notifyAuthor()` | SEPTIAN EKO NUGROHO | Model RevisionRound |
| Buat view panel revisi Author (catatan Editor dari Reviewer + form upload) | `resources/js/pages/Revision/AuthorRevision.tsx` | - | SEPTIAN EKO NUGROHO | `notifyAuthor()` |
| Buat komponen RevisionNotePanel (tampil catatan revisi dari Editor) | `resources/js/components/RevisionNotePanel.tsx` | - | SEPTIAN EKO NUGROHO | - |
| Buat method controller upload file revisi oleh Author | `app/Http/Controllers/Revision/RevisionController.php` | `uploadRevision()` | MUHAMMAD AULIA LUTHFI | Model RevisionRound |
| Buat view form upload file revisi + tombol submit revisi | `resources/js/pages/Revision/UploadRevision.tsx` | - | MUHAMMAD AULIA LUTHFI | `uploadRevision()` |
| Buat method controller versioning dokumen (histori file semua ronde) | `app/Http/Controllers/Revision/RevisionController.php` | `versionHistory()` | MUHAMMAD AULIA LUTHFI | Model SubmissionFile |
| Buat komponen DocumentVersionList (daftar versi file berlabel per ronde) | `resources/js/components/DocumentVersionList.tsx` | - | MUHAMMAD AULIA LUTHFI | - |
| Buat method controller review revisi oleh Editor (Accept / Kembali ke Review / Minta Revisi Lagi) | `app/Http/Controllers/Revision/EditorRevisionController.php` | `decide()` | KUKUH YOGI PANGESTU | - |
| Buat view panel keputusan Editor setelah revisi masuk | `resources/js/pages/Revision/EditorDecision.tsx` | - | KUKUH YOGI PANGESTU | `decide()` |
| Buat method controller assign Copyeditor ke submission (setelah Accept) | `app/Http/Controllers/Copyediting/CopyeditingController.php` | `assign()` | KUKUH YOGI PANGESTU | Model CopyeditingTask |
| Buat view panel penugasan Copyeditor (Admin/Editor) | `resources/js/pages/Copyediting/Assign.tsx` | - | KUKUH YOGI PANGESTU | `assign()` |
| Buat method controller upload file yang sudah di-copyedit (Copyeditor) | `app/Http/Controllers/Copyediting/CopyeditingController.php` | `uploadCopyedited()` | HAFIDZ CHAIRUL AMIN | - |
| Buat view panel tiga kolom Copyeditor (File Original \| File Copyedited \| Catatan) | `resources/js/pages/Copyediting/CopyeditorPanel.tsx` | - | HAFIDZ CHAIRUL AMIN | `uploadCopyedited()` |
| Buat method controller persetujuan Author atas hasil copyediting | `app/Http/Controllers/Copyediting/CopyeditingController.php` | `authorApprove()` | HAFIDZ CHAIRUL AMIN | - |
| Buat view konfirmasi persetujuan Author (sebelum masuk tahap Production) | `resources/js/pages/Copyediting/AuthorApproval.tsx` | - | HAFIDZ CHAIRUL AMIN | `authorApprove()` |
| Buat Entitas Data (Migration, Model, Relasi) SubmissionDiscussion & DiscussionMessage | `app/Models/SubmissionDiscussion.php`, `app/Models/DiscussionMessage.php` dll | - | ALFIN AHMAD JUNIAR | PRD Modul 5 |
| Buat method controller buat thread diskusi baru (per stage: Editorial, Copyediting, dll) | `app/Http/Controllers/DiscussionController.php` | `store()` | ALFIN AHMAD JUNIAR | Model SubmissionDiscussion |
| Buat view thread diskusi (Subject + Pesan + Attachment + Reply) | `resources/js/pages/Discussion/Thread.tsx` | - | ALFIN AHMAD JUNIAR | `store()` |
| Buat komponen MessageBubble (UI pesan diskusi per pengirim + attachment link) | `resources/js/components/MessageBubble.tsx` | - | ALFIN AHMAD JUNIAR | - |
| Buat method controller balas pesan dalam thread diskusi | `app/Http/Controllers/DiscussionController.php` | `reply()` | M FAUZAN PRADIPTHA DIMAS CRISWARA | Model DiscussionMessage |
| Buat method controller upload attachment di dalam diskusi | `app/Http/Controllers/DiscussionController.php` | `uploadAttachment()` | M FAUZAN PRADIPTHA DIMAS CRISWARA | - |
| Buat view daftar semua thread diskusi per submission | `resources/js/pages/Discussion/Index.tsx` | - | M FAUZAN PRADIPTHA DIMAS CRISWARA | `reply()` |
| Buat request class validasi StoreDiscussionRequest | `app/Http/Requests/StoreDiscussionRequest.php` | `rules()` | M FAUZAN PRADIPTHA DIMAS CRISWARA | - |

---

### 📑 TAB 6: Production & Issue Management
*(Modul penerbitan artikel ke dalam Issue jurnal. Dikerjakan oleh 6 Mahasiswa)*

| Task | Path (Laravel/React) | Nama Method | Nama Mahasiswa | Acuan / Dependensi |
| :--- | :--- | :--- | :--- | :--- |
| Buat Entitas Data (Migration, Model, Relasi) Issue & Galley | `app/Models/Issue.php`, `app/Models/Galley.php` dll | - | OKTA NUZULIFA | PRD Modul 6 |
| Buat method controller index daftar Issue (Draft & Published) | `app/Http/Controllers/Production/IssueController.php` | `index()` | OKTA NUZULIFA | Tabel issues |
| Buat view daftar Issue (tabel dengan filter Draft/Published) | `resources/js/pages/Production/Issue/Index.tsx` | - | OKTA NUZULIFA | `index()` |
| Buat method controller buat Issue baru | `app/Http/Controllers/Production/IssueController.php` | `store()` | OKTA NUZULIFA | Model Issue |
| Buat view form buat Issue baru (Volume, Nomor, Tahun, Judul tematik, Deskripsi) | `resources/js/pages/Production/Issue/Create.tsx` | - | ANGGASTA VYAKTATAMA KAHFI | `store()` |
| Buat method controller edit metadata Issue | `app/Http/Controllers/Production/IssueController.php` | `update()` | ANGGASTA VYAKTATAMA KAHFI | - |
| Buat view form edit Issue | `resources/js/pages/Production/Issue/Edit.tsx` | - | ANGGASTA VYAKTATAMA KAHFI | `update()` |
| Buat request class validasi StoreIssueRequest (termasuk uniqueness Volume+Nomor+Tahun) | `app/Http/Requests/StoreIssueRequest.php` | `rules()` | ANGGASTA VYAKTATAMA KAHFI | - |
| Buat method controller upload Galley file (PDF / HTML / XML) per artikel | `app/Http/Controllers/Production/GalleyController.php` | `store()` | M ALVAN AZIZ WIRDIAN | Model Galley |
| Buat view manajemen Galley per artikel (daftar + upload + label) | `resources/js/pages/Production/Galley/Manage.tsx` | - | M ALVAN AZIZ WIRDIAN | `store()` |
| Buat method controller jadwalkan artikel ke sebuah Issue | `app/Http/Controllers/Production/GalleyController.php` | `assignToIssue()` | M ALVAN AZIZ WIRDIAN | - |
| Buat komponen ArticleSequencer (drag-and-drop urutan artikel dalam Issue) | `resources/js/components/ArticleSequencer.tsx` | - | M ALVAN AZIZ WIRDIAN | `assignToIssue()` |
| Buat method controller publish Issue (semua artikel Published serentak) | `app/Http/Controllers/Production/IssueController.php` | `publish()` | ALYA AULIA AZZAHRA | - |
| Buat view preview Issue sebelum publish (Table of Contents publik) | `resources/js/pages/Production/Issue/Preview.tsx` | - | ALYA AULIA AZZAHRA | `publish()` |
| Buat komponen PublishChecklist (dialog konfirmasi + checklist sebelum publish) | `resources/js/components/PublishChecklist.tsx` | - | ALYA AULIA AZZAHRA | - |
| Buat method controller kelola Back Issues (arsip terbitan yang sudah terbit) | `app/Http/Controllers/Production/IssueController.php` | `archive()` | ALYA AULIA AZZAHRA | - |
| Buat method controller set nomor halaman & DOI per artikel dalam Issue | `app/Http/Controllers/Production/GalleyController.php` | `updateMeta()` | MUHAMMAD RAYHAN PANJI BANURAGA | Model Galley |
| Buat view form penetapan halaman (from–to) & DOI artikel | `resources/js/pages/Production/Galley/SetMeta.tsx` | - | MUHAMMAD RAYHAN PANJI BANURAGA | `updateMeta()` |
| Buat method controller hapus Issue Draft (hanya jika belum ada artikel) | `app/Http/Controllers/Production/IssueController.php` | `destroy()` | MUHAMMAD RAYHAN PANJI BANURAGA | - |
| Buat komponen IssueCard (card tampilan ringkasan Issue di daftar) | `resources/js/components/IssueCard.tsx` | - | MUHAMMAD RAYHAN PANJI BANURAGA | - |
| Buat method controller antrian artikel siap terbit (Production Queue) | `app/Http/Controllers/Production/ProductionQueueController.php` | `index()` | M. IMAN NUR RISKI | Tabel submissions |
| Buat view antrian artikel siap produksi (filter: Belum dijadwalkan / Sudah dijadwalkan) | `resources/js/pages/Production/Queue/Index.tsx` | - | M. IMAN NUR RISKI | `index()` |
| Buat API Endpoint artikel Published untuk konsumsi portal publik JurnalMu (Kelas B) | `app/Http/Controllers/Api/PublishedArticleController.php` | `index()`, `show()` | M. IMAN NUR RISKI | Tabel galleys |
| Buat komponen TOCEditor (Table of Contents editor urutan artikel dalam Issue) | `resources/js/components/TOCEditor.tsx` | - | M. IMAN NUR RISKI | ArticleSequencer |

---

### 📑 TAB 7: Notifikasi, Komunikasi & Diskusi Internal
*(Modul infrastruktur komunikasi seluruh pemangku peran. Dikerjakan oleh 5 Mahasiswa)*

| Task | Path (Laravel/React) | Nama Method | Nama Mahasiswa | Acuan / Dependensi |
| :--- | :--- | :--- | :--- | :--- |
| Buat Entitas Data (Migration, Model, Relasi) Notification & ActivityLog | `app/Models/Notification.php`, `app/Models/ActivityLog.php` dll | - | RYAN ANANDA DJAWA | PRD Modul 7 |
| Buat method controller index notifikasi milik user (untuk bell dropdown) | `app/Http/Controllers/NotificationController.php` | `index()` | RYAN ANANDA DJAWA | Tabel notifications |
| Buat view/komponen dropdown bell notifikasi (5 terbaru + badge unread) | `resources/js/components/NotificationBell.tsx` | - | RYAN ANANDA DJAWA | `index()` |
| Buat method controller tandai notifikasi dibaca (satu & semua) | `app/Http/Controllers/NotificationController.php` | `markRead()`, `markAllRead()` | RYAN ANANDA DJAWA | - |
| Buat Entitas Data (Migration, Model, Relasi) EmailTemplate | `app/Models/EmailTemplate.php` dll | - | CARESS SUCHI DABRILA | PRD Modul 7 |
| Buat method controller index kelola template email (Admin/Editor) | `app/Http/Controllers/Admin/EmailTemplateController.php` | `index()` | CARESS SUCHI DABRILA | Model EmailTemplate |
| Buat view halaman daftar manajemen template email | `resources/js/pages/Admin/EmailTemplate/Index.tsx` | - | CARESS SUCHI DABRILA | `index()` |
| Buat method controller update isi template email | `app/Http/Controllers/Admin/EmailTemplateController.php` | `update()` | CARESS SUCHI DABRILA | - |
| Buat view form edit template email (rich text editor + preview variabel) | `resources/js/pages/Admin/EmailTemplate/Edit.tsx` | - | SALSABILA NURLAILI | `update()` |
| Buat logic service pengiriman email otomatis per event | `app/Services/EmailNotificationService.php` | `send()` | SALSABILA NURLAILI | Model EmailTemplate |
| Buat logic observer/event trigger notifikasi in-app saat event submission | `app/Observers/SubmissionObserver.php` | `created()`, `updated()` | SALSABILA NURLAILI | Model Notification |
| Buat view halaman "Semua Notifikasi" (daftar lengkap + filter status baca) | `resources/js/pages/Notifications/Index.tsx` | - | SALSABILA NURLAILI | - |
| Buat Entitas Data (Migration, Model, Relasi) Announcement | `app/Models/Announcement.php` dll | - | ABHIRAMA BALAPHRADANA VISHNU R | PRD Modul 7 |
| Buat method controller CRUD Announcement (Admin) | `app/Http/Controllers/Admin/AnnouncementController.php` | `index()`, `store()`, `update()`, `destroy()` | ABHIRAMA BALAPHRADANA VISHNU R | Model Announcement |
| Buat view daftar manajemen Announcement (Admin) | `resources/js/pages/Admin/Announcement/Index.tsx` | - | ABHIRAMA BALAPHRADANA VISHNU R | `index()` |
| Buat view form tambah & edit Announcement (dengan field tanggal kadaluarsa) | `resources/js/pages/Admin/Announcement/Form.tsx` | - | ABHIRAMA BALAPHRADANA VISHNU R | `store()` |
| Buat method controller index Activity Log per submission (untuk Editor) | `app/Http/Controllers/ActivityLogController.php` | `index()` | REGIANA HERMAWAN | Tabel activity_logs |
| Buat view timeline Activity Log per submission (kronologis semua aksi) | `resources/js/pages/Editorial/ActivityLog.tsx` | - | REGIANA HERMAWAN | `index()` |
| Buat komponen ActivityLogTimeline (UI timeline vertikal per aksi + aktor) | `resources/js/components/ActivityLogTimeline.tsx` | - | REGIANA HERMAWAN | - |
| Buat logic Queue Job pengiriman email via Laravel Queue (async, non-blocking) | `app/Jobs/SendNotificationEmail.php` | `handle()` | REGIANA HERMAWAN | EmailNotificationService |

---

## Rekap Distribusi Mahasiswa per Modul

| Modul | Jumlah Mahasiswa | Total Task |
| :--- | :---: | :---: |
| TAB 1 — Role Management | 5 | 20 |
| TAB 2 — Author Submission Wizard | 6 | 24 |
| TAB 3 — Editorial Desk & Assignment | 6 | 24 |
| TAB 4 — Peer Review System | 6 | 24 |
| TAB 5 — Revision & Copyediting | 6 | 24 |
| TAB 6 — Production & Issue Management | 6 | 24 |
| TAB 7 — Notifikasi & Komunikasi | 5 | 20 |
| **TOTAL** | **40** | **160** |

---

## Panduan Umum Pengerjaan

### Urutan Pengerjaan yang Disarankan
1. **Baca PRD Modul** yang relevan sebelum mulai.
2. **Baca `Technical_Guide.md`** untuk memahami konvensi MVC dan aliran data Inertia.js.
3. **Baca `Integration_Guide.md`** jika tugas Anda bersinggungan dengan data dari Kelas B.
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
