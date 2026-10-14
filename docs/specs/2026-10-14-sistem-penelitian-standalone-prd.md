# Design Spec: Sistem Penelitian Terintegrasi Standalone (Repository Fork)

Dokumen ini merupakan rancangan desain arsitektur dan spesifikasi teknis untuk implementasi sistem *standalone* di repositori *fork*. Dokumen ini merujuk secara komprehensif pada dokumen PRD utama di [docs/PRD_Sistem_Penelitian_Terintegrasi_Standalone.md](file:///c:/xampp/htdocs/RPL-2026/docs/PRD_Sistem_Penelitian_Terintegrasi_Standalone.md).

## 1. Ringkasan Eksekutif
Sistem Penelitian Terintegrasi didekopling dari sistem JurnalMu dan Submission System OJS (Kelas G). Modul Kelas G tetap berada di repositori `RPL-2026`, sedangkan repositori *fork* dikonversi secara menyeluruh menjadi sistem web *standalone* mandiri untuk pengelolaan siklus hidup riset multi-kampus (*Multi-Institution SIM-Penelitian*).

## 2. Arsitektur & Lingkungan
- Framework: Laravel 12 + React 19 (Inertia.js) + Tailwind CSS 4 + shadcn/ui.
- Tenancy: Multi-Institution berbasis `university_id` pada seluruh entitas riset.
- RBAC: 5 Peran operasional (Super Admin, Admin Kampus/LPPM, Admin Keuangan, Reviewer, Peneliti).

## 3. Modul Inti & Alur Kerja
1. Modul 1: Manajemen Skema Pendanaan & Proposal Penelitian
2. Modul 2: Penugasan Reviewer & Penilaian Substansi Proposal
3. Modul 3: Manajemen Kontrak & Pendanaan (Finance)
4. Modul 4: Monitoring dan Evaluasi (Monev) Pelaksanaan Riset
5. Modul 5: Pelaporan & Verifikasi Luaran Penelitian (Jurnal, Buku, HKI, Produk)
6. Modul 6: Evaluasi Akhir Penelitian, Penutupan Kontrak, & SKTS

## 4. Basis Data Bersih (21 Tabel)
- Inti & Tenancy: `universities`, `roles`, `users`, `role_user`, `activity_logs`, `notifications`.
- Modul 1: `research_schemas`, `proposals`, `proposal_documents`.
- Modul 2: `assessment_criteria`, `reviews`.
- Modul 3: `contracts`, `fundings`.
- Modul 4: `monev_schedules`, `progress_reports`.
- Modul 5: `research_outputs`, `journal_outputs`, `book_outputs`, `hki_outputs`, `product_outputs`.
- Modul 6: `evaluations`.

## 5. Purge Manifest (Eliminasi di Fork)
- Seluruh modul Submission OJS (Kelas G): Controller `Submission`, `SubmissionWizard`, `Editorial/*`, `Copyediting/*`, `Production/*`, `Revision/*`, Model `Submission*`, `Editorial*`, `Galley`, `Article`, Halaman `pages/Submission/`, dll.
- Seluruh modul legacy JurnalMu: Controller `Dikti/*`, `AdminKampus/*`, `AccreditationTemplate*`, `Pembinaan*`, Model `Pembinaan*`, `JournalAssessment*`, Halaman `pages/Dikti/`, `pages/Browse/`, dll.

## 6. Penanganan Kasus Batas (Edge Cases)
Mencakup 11 skenario kritis meliputi: manipulasi akses lintas kampus (IDOR), pencegahan konflik kepentingan reviewer, proteksi batas waktu skema (deadline race conditions), penanganan reviewer mangkir/ghosting, selisih skor reviewer ekstrem (discrepancy tie-breaker), pemblokiran dana termin tanpa kelulusan Monev, dan deteksi klaim luaran ganda.

## 7. Rujukan Dokumen Lengkap
Silakan merujuk ke dokumen PRD lengkap di:
- [PRD_Sistem_Penelitian_Terintegrasi_Standalone.md](file:///c:/xampp/htdocs/RPL-2026/docs/PRD_Sistem_Penelitian_Terintegrasi_Standalone.md)
