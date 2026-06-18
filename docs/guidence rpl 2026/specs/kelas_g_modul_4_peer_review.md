# Spesifikasi Desain View: Modul 4 — Peer Review System
## Kelas G — Tab 4: Peer Review System (Double-Blind Review)

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (*view*) dan komponen di Modul 4 Kelas G (Peer Review Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path | Penanggung Jawab | Deskripsi Singkat Tugas |
| :--- | :--- | :--- | :--- |
| `InviteReviewer.tsx` | `resources/js/pages/Review/InviteReviewer.tsx` | AGNES PUTRI ALFALAHI | Halaman pemilihan reviewer untuk editor (pencarian reviewer, daftar rekomendasi). |
| `ReviewerCandidateCard.tsx` | `resources/js/components/ReviewerCandidateCard.tsx` | AGNES PUTRI ALFALAHI | Kartu informasi reviewer (Bento/Card) memuat nama, rumpun keahlian, dan statistik performa. |
| `Invitation.tsx` | `resources/js/pages/Review/Invitation.tsx` | M. RIZQI AKBAR H. | Halaman bagi reviewer untuk menyetujui (*Accept*) atau menolak (*Decline*) penugasan. |
| `Dashboard.tsx` | `resources/js/pages/Review/Dashboard.tsx` | M. RIZQI AKBAR H. | Dashboard khusus Reviewer, memuat daftar tugas aktif, status review, dan countdown sisa hari. |
| `FormReview.tsx` | `resources/js/pages/Review/FormReview.tsx` | RIFAI AIHUNAN | Halaman pengisian ulasan reviewer, memuat naskah anonim (Double-Blind) dan form rubrik. |
| `RubricScoreInput.tsx` | `resources/js/components/RubricScoreInput.tsx` | RIFAI AIHUNAN | Komponen form rubrik skor interaktif (poin 1–5) dengan kalkulasi rata-rata *real-time*. |
| `Recommendation.tsx` | `resources/js/pages/Review/Recommendation.tsx` | FARID RIZQULLOH S. | Form rekomendasi akhir reviewer (Accept, Revision, Reject) beserta ulasan narasi. |
| `Summary.tsx` | `resources/js/pages/Review/Summary.tsx` | MOHAMAD ARYA F. | Halaman perbandingan ulasan multi-reviewer bagi Editor (matriks perbandingan). |
| `ReviewMatrixTable.tsx` | `resources/js/components/ReviewMatrixTable.tsx` | MOHAMAD ARYA F. | Komponen tabel matriks perbandingan nilai dan rekomendasi antar reviewer secara berdampingan. |
| `CancelReviewModal.tsx` | `resources/js/components/CancelReviewModal.tsx` | ANDRA PUTRA D. L. | Modal pop-up bagi editor untuk membatalkan penugasan reviewer yang mandek. |
| `ReviewRoundBadge.tsx` | `resources/js/components/ReviewRoundBadge.tsx` | ANDRA PUTRA D. L. | Badge penanda ronde penilaian aktif (misal: "Ronde 1", "Ronde 2"). |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';
import { Submission } from './kelas_g_modul_2_submission_wizard';

// Struktur Data Penugasan Reviewer
export interface ReviewAssignment {
    id: number;
    id_submission: number;
    id_reviewer: number; // FK ke users
    reviewer_name: string;
    due_date: string;
    status: 'Pending' | 'Accepted' | 'Declined' | 'Completed' | 'Cancelled';
    decline_reason: string | null;
    round: number;
    created_at: string;
}

// Struktur Data Rubrik & Evaluasi Reviewer
export interface ReviewFormScore {
    id: number;
    id_review_assignment: number;
    criterion_name: string; // Kriteria (misal: "Metodologi", "Orisinalitas")
    score: number; // Skala 1 - 5
}

export interface ReviewDecision {
    id: number;
    id_review_assignment: number;
    recommendation: 'Accept' | 'Minor_Revision' | 'Major_Revision' | 'Reject';
    overall_comment: string;
    confidential_comment: string | null; // Hanya dibaca Editor
    submitted_at: string;
}

// 1. Props untuk Review/InviteReviewer.tsx
export interface InviteReviewerProps extends PageProps {
    submission: Submission;
    reviewers: {
        id: number;
        name: string;
        skills: string[]; // Rumpun keahlian reviewer
        completed_reviews_count: number;
        average_days_taken: number; // Rata-rata waktu pengerjaan
    }[];
}

// 2. Props untuk Reviewer Dashboard (Review/Dashboard.tsx)
export interface ReviewerDashboardProps extends PageProps {
    activeAssignments: (ReviewAssignment & { submission_title: string })[];
    historyAssignments: (ReviewAssignment & { submission_title: string })[];
}

// 3. Props untuk Rekapitulasi Editor (Review/Summary.tsx)
export interface ReviewSummaryProps extends PageProps {
    submission: Submission;
    assignments: (ReviewAssignment & {
        scores: ReviewFormScore[];
        decision: ReviewDecision | null;
    })[];
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Undang Reviewer (`Review/InviteReviewer.tsx`)
1.  **Header Area**: Judul `"Undang Reviewer Jurnal"`, sub-judul menampilkan judul naskah penelitian yang dituju.
2.  **Grid Kandidat (`<ReviewerCandidateCard>`)**:
    *   Tampilkan layout **Bento Grid** atau grid 3 kolom berisi kartu kandidat reviewer.
    *   Tiap kartu memuat rumpun keahlian (menggunakan badge) dan statistik performa kerja reviewer (jumlah artikel dibaca, rata-rata hari pengerjaan).
    *   Tombol `"Kirim Undangan"` di dalam kartu yang memicu modal pemilihan tenggat waktu.

### B. Halaman Undangan Review (`Review/Invitation.tsx`)
1.  **Wrapper**: Dibatasi lebar konten `max-w-xl mx-auto py-12`.
2.  **Konten Undangan**:
    *   Tampilkan ringkasan naskah: Judul naskah & Abstrak (ingat: identitas penulis **disembunyikan** karena skema Double-Blind).
    *   Informasi deadline ulasan (due date countdown).
3.  **Kotak Pilihan Aksi**:
    *   Tombol hijau `"Terima Undangan"` -> memicu konfirmasi.
    *   Tombol merah `"Tolak Undangan"` -> membuka kolom alasan penolakan (misal: "Sakit", "Bentrok Jadwal", "Bukan Bidang Keahlian").

### C. Dashboard Reviewer (`Review/Dashboard.tsx`)
1.  **Statistik Reviewer**: Panel atas menampilkan ringkasan jumlah tugas review yang telah diselesaikan.
2.  **Tabel Antrean Tugas**:
    *   Pisahkan menjadi 2 Tab: **Tugas Aktif (Active Tasks)** dan **Riwayat Review (History)**.
    *   *Tabel Tugas Aktif*: Menampilkan Judul Naskah (Tanpa Penulis), Jurnal Target, Sisa Hari (due date countdown dengan warna merah jika < 3 hari), dan tombol aksi `"Mulai Review"`.

### D. Halaman Penilaian Rubrik (`Review/FormReview.tsx`)
Halaman ini menggunakan pembagian layar terpisah horizontal atau vertikal:
*   **Sisi Dokumen**: PDF viewer menampilkan manuskrip yang sudah dibersihkan metadata penulisnya (*anonymized document*).
*   **Sisi Form Rubrik (`<RubricScoreInput>`)**:
    *   Tabel penilaian kriteria (1–5) dengan radio button atau select box.
    *   Reviewer wajib mengisi seluruh poin kriteria sebelum diizinkan beralih ke halaman keputusan rekomendasi akhir.

### E. Matriks Ringkasan Ulasan (`Review/Summary.tsx`)
1.  **Header**: Rekap perbandingan ulasan untuk Editor Utama.
2.  **Matriks Komparasi (`<ReviewMatrixTable>`)**:
    *   Tabel komparasi side-by-side: Menjajajarkan ulasan, skor, dan rekomendasi dari Reviewer A, Reviewer B, dan Reviewer C secara vertikal.
    *   Mempermudah Editor membandingkan jika terjadi perbedaan pendapat (misal: Reviewer A menyetujui, Reviewer B menolak).

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<ReviewerCandidateCard reviewer={...} onInvite={...} />`
*   Desain Card minimalis dengan visualisasi tag keahlian:
    *   Tampilkan inisial nama reviewer di dalam `<Avatar>`.
    *   Visual tag keahlian: Badge hijau muda (`bg-emerald-50 text-emerald-700`).
    *   Statistik kerja: Menggunakan ikon `CheckCircle` (Jumlah review) dan `Clock` (Rata-rata durasi).

### 2. Komponen `<RubricScoreInput criteria={...} onChange={...} />`
*   Tabel form input poin rubrik. Setiap baris mewakili kriteria penilaian (misal: Orisinalitas, Metodologi, Tata Bahasa).
*   Kolom radio button untuk nilai `1 (Sangat Kurang)` s/d `5 (Sangat Baik)`.
*   Di bagian bawah tabel, tampilkan visualisasi skor agregat rata-rata yang terhitung secara dinamis (*real-time*).

### 3. Komponen `<ReviewMatrixTable assignments={...} />`
*   Tabel lebar yang membandingkan:
    *   *Baris 1*: Rekomendasi Akhir (`Accept` / `Reject` / dll).
    *   *Baris 2*: Total Skor Rata-rata.
    *   *Baris 3-N*: Catatan ulasan kualitatif untuk penulis dan catatan rahasia untuk editor.

### 4. Komponen `<CancelReviewModal isOpen={...} onClose={...} onConfirm={...} />`
*   Dialog konfirmasi pembatalan undangan review yang macet.
*   Wajib mencantumkan kolom teks input alasan pembatalan (misal: "Reviewer tidak merespons undangan selama > 7 hari").

---

## 5. Alur Interaksi & Routing Inertia

*   **Penerimaan/Penolakan Undangan**:
    *   Method: `POST` ke `/reviewer/invitation/{id_assignment}/respond`.
    *   Data: `{ status: 'Accepted' | 'Declined', decline_reason }`.
*   **Penyelamatan Draft Review**:
    *   Method: `POST` ke `/reviewer/review/{id_assignment}/save-draft`.
*   **Submit Rekomendasi Final**:
    *   Method: `POST` ke `/reviewer/review/{id_assignment}/submit`.
    *   Validasi: Divalidasi oleh `ReviewSubmissionRequest` untuk memastikan semua kriteria terisi dan overall comment terisi.
