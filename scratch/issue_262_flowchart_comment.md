# Alur Proses Bisnis & Diagram (Flowchart & Sequence Diagram) - Modul Manajemen Reviewer dan Penilaian (Kelas B - TAB 2)

Dokumentasi ini melengkapi laporan pengecekan modul pada Issue #262 dengan menggambarkan alur proses bisnis bisnis dan urutan eksekusi teknis endpoint API untuk **Modul 2: Manajemen Reviewer dan Penilaian**.

---

## 1. Diagram Flowchart Proses Bisnis Modul 2

Diagram berikut menggambarkan alur kerja pengguna dari penunjukan reviewer oleh Admin, proses penilaian oleh Reviewer, rekap kalkulasi nilai, hingga penentuan keputusan dan cetak Berita Acara:

```mermaid
flowchart TD
    Start([Proposal Lolos Administrasi]) --> AdminAssign[Admin LPPM / Kampus<br/>Assign Reviewer ke Proposal]
    AdminAssign --> SetSchedule[Admin Atur Jadwal Penilaian<br/>ReviewSchedule]
    SetSchedule --> ReviewerNotify[Sistem Kirim Notifikasi<br/>ke Reviewer]
    
    ReviewerNotify --> ReviewerDashboard[Reviewer Akses Dashboard Review<br/>GET /reviewer/assignments]
    ReviewerDashboard --> FormReview[Reviewer Isi Form Penilaian<br/>POST /reviewer/assessment]
    
    FormReview --> CalculateScore[Sistem Hitung Skor Kriteria<br/>AssessmentCriteria & Total Score]
    CalculateScore --> SubmitStatus[Status Review Set ke Completed]
    
    SubmitStatus --> AdminRekap[Admin Akses Rekap Penilaian<br/>GET /admin/reviews/summary]
    AdminRekap --> CalcService[ReviewCalculationService<br/>Kalkulasi Rata-rata Skor Reviewer]
    
    CalcService --> Decision{Admin Ambil Keputusan<br/>POST /admin/decision}
    Decision -- Diterima --> StatusAccepted[Status Proposal: Diterima]
    Decision -- Ditolak --> StatusRejected[Status Proposal: Ditolak]
    
    StatusAccepted --> DosenViewHistory[Dosen Lihat Riwayat Review<br/>GET /proposal/history]
    StatusRejected --> DosenViewHistory
    
    DosenViewHistory --> PrintBA[Cetak Berita Acara Review<br/>GET /proposal/print-ba]
    PrintBA --> End([Proses Penilaian Selesai])
```

---

## 2. Sequence Diagram Eksekusi Endpoint & Controller Modul 2

Diagram berikut mendeskripsikan urutan pemanggilan pesan (message sequence) dari Inertia React UI, Middleware Otorisasi, Controller, Service Calculation, hingga Persistensi Database:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Kampus / LPPM
    actor Reviewer as Reviewer
    actor Dosen as Dosen Pengusul
    participant UI as Inertia React UI
    participant Middleware as Role Middleware
    participant AssignCtrl as Admin\AssignController
    participant RevCtrl as ReviewController
    participant CalcService as ReviewCalculationService
    participant DecCtrl as Admin\DecisionController
    participant DocCtrl as ReviewDocumentController
    participant DB as Database (MySQL)

    %% 1. Penunjukan Reviewer
    Admin->>UI: Klik "Penunjukan Reviewer"
    UI->>Middleware: POST /admin/assign (proposal_id, reviewer_id)
    Middleware->>AssignCtrl: assign(Request $request)
    AssignCtrl->>DB: INSERT INTO reviews (proposal_id, reviewer_id, status='assigned')
    DB-->>AssignCtrl: Review Record Created
    AssignCtrl-->>UI: Redirect Back (Flash Success)

    %% 2. Pengisian Penilaian Reviewer
    Reviewer->>UI: Buka Form Penilaian
    UI->>Middleware: GET /reviewer/assessment/{reviewId}
    Middleware->>RevCtrl: reviewForm(Request, $reviewId)
    RevCtrl->>DB: SELECT * FROM reviews & assessment_criterias
    DB-->>RevCtrl: Data Review & Kriteria
    RevCtrl-->>UI: Render FormReview.tsx (props)
    
    Reviewer->>UI: Submit Form Penilaian (Skor & Catatan)
    UI->>Middleware: POST /reviewer/assessment/{reviewId}
    Middleware->>RevCtrl: storeAssessment(StoreReviewRequest)
    RevCtrl->>DB: UPDATE reviews SET total_score, notes, status='completed'
    DB-->>RevCtrl: Saved
    RevCtrl-->>UI: Redirect /reviewer/assignments

    %% 3. Rekap & Penentuan Keputusan Admin
    Admin->>UI: Buka Rekap Penilaian
    UI->>Middleware: GET /admin/reviews/summary
    Middleware->>CalcService: calculate(proposal_id)
    CalcService->>DB: SELECT scores FROM reviews WHERE proposal_id=X
    DB-->>CalcService: Raw Scores
    CalcService-->>UI: Summary Table (Average Score)

    Admin->>UI: Submit Keputusan (Diterima/Ditolak)
    UI->>Middleware: POST /admin/decision (proposal_id, status, reason)
    Middleware->>DecCtrl: decide(Request)
    DecCtrl->>DB: UPDATE proposals SET status_proposal='Diterima'/'Ditolak'
    DB-->>DecCtrl: Proposal Status Updated
    DecCtrl-->>UI: Redirect Summary Page

    %% 4. Riwayat & Cetak Berita Acara
    Dosen->>UI: Klik "Cetak Berita Acara"
    UI->>Middleware: GET /proposal/{id}/print-ba
    Middleware->>DocCtrl: printBA($proposalId)
    DocCtrl->>DB: SELECT proposal, reviews, criteria
    DB-->>DocCtrl: Complete Review Data
    DocCtrl-->>UI: Render View / Stream PDF (berita_acara.blade.php)
```

---

## 3. Penjelasan Lifecycle & Status Transisi Modul 2

1. **Status Task Review (`reviews.status`)**:
   - `assigned`: Reviewer telah ditunjuk oleh Admin Kampus / LPPM.
   - `in_progress`: Reviewer sedang mengisi form kriteria penilaian.
   - `completed`: Reviewer telah mengirimkan skor akhir dan catatan penilaian.

2. **Status Proposal Terkait (`proposals.status_proposal`)**:
   - `Administrasi_Valid`: Proposal lolos validasi dokumen dan siap ditunjuk reviewer.
   - `Dalam_Review`: Proposal sedang dalam proses penilaian oleh reviewer.
   - `Diterima`: Proposal disetujui berdasarkan rata-rata nilai rekap review.
   - `Ditolak`: Proposal tidak lolos penilaian subtansi review.
