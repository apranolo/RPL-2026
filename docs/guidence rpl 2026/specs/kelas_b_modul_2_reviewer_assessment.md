# Spesifikasi Desain View: Modul 2 — Manajemen Reviewer dan Penilaian
## Kelas B — Tab 2: Manajemen Reviewer & Penilaian

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (*view*) dan komponen di Modul 2 Kelas B (Review & Evaluation Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path | Penanggung Jawab | Deskripsi Singkat Tugas |
| :--- | :--- | :--- | :--- |
| `Index.tsx` | `resources/js/pages/Reviewer/Index.tsx` | M. HILMI PRASTOWO | Dashboard Reviewer: daftar proposal penelitian yang ditugaskan untuk dinilai. |
| `Assign.tsx` | `resources/js/pages/Admin/Reviewer/Assign.tsx` | FARHAN NUR ICHSAN | Halaman plotting penunjukan reviewer untuk proposal (Admin Kampus). |
| `AssignModal.tsx` | `resources/js/components/AssignModal.tsx` | FARHAN NUR ICHSAN | Modal dialog konfirmasi pencocokan proposal dengan reviewer terpilih. |
| `FormReview.tsx` | `resources/js/pages/Reviewer/FormReview.tsx` | NAUFAL MUKHTAR K. | Halaman pengisian formulir penilaian proposal dan rubrik skor. |
| `Summary.tsx` | `resources/js/pages/Admin/Reviewer/Summary.tsx` | FAHMI HIDAYAT | Rekap hasil review (tabel kalkulasi multi-reviewer) & penetapan putusan LPPM. |
| `Schedule.tsx` | `resources/js/pages/Admin/Reviewer/Schedule.tsx` | CANDRA KURNIAWAN | Halaman konfigurasi kalender penjadwalan rentang waktu review. |
| `DatePicker.tsx` | `resources/js/components/DatePicker.tsx` | CANDRA KURNIAWAN | Komponen kalender interaktif (pop-over calendar) untuk memilih rentang tanggal. |
| `NotificationBell.tsx` | `resources/js/components/NotificationBell.tsx` | DIMAS CANDRA P. | Widget bel notifikasi pada header navigasi untuk pemberitahuan tugas review. |
| `Index.tsx` | `resources/js/pages/Admin/Criteria/Index.tsx` | DIMAS CANDRA P. | Halaman manajemen master parameter kriteria penilaian proposal. |
| `Create.tsx` | `resources/js/pages/Admin/Criteria/Create.tsx` | HUSNA SALSABILLA | Formulir tambah kriteria penilaian baru menggunakan input baris dinamis. |
| `Edit.tsx` | `resources/js/pages/Admin/Criteria/Edit.tsx` | HUSNA SALSABILLA | Formulir penyuntingan bobot dan detail kriteria penilaian. |
| `DynamicInput.tsx` | `resources/js/components/DynamicInput.tsx` | HUSNA SALSABILLA | Komponen input dinamis (tambah/kurang baris input) untuk master kriteria. |
| `ReviewHistory.tsx` | `resources/js/pages/Proposal/ReviewHistory.tsx` | FADHIL FIRMANSYAH | Halaman riwayat ulasan reviewer khusus bagi dosen pengusul proposal. |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';
import { Proposal } from './kelas_b_modul_1_proposal_management';

// Struktur Data Plotting Reviewer
export interface PlotReviewer {
    id: number;
    id_proposal: number;
    id_reviewer: number;
    tanggal_mulai_review: string;
    tanggal_selesai_review: string;
    status: 'Pending' | 'Completed';
    skor_total: number;
    keputusan_rekomendasi: 'Diterima' | 'Ditolak' | 'Revisi' | null;
    reviewer?: {
        name: string;
    };
}

// Struktur Data Kriteria Penilaian
export interface AssessmentCriteria {
    id: number;
    criteria_name: string;
    weight: number; // Bobot persentase (misal: 25 untuk 25%)
    max_score: number; // Skor maksimal kriteria (misal: 10 atau 100)
}

// 1. Props untuk Reviewer/Index.tsx
export interface ReviewerIndexProps extends PageProps {
    assignedReviews: (PlotReviewer & { proposal_title: string; schema_name: string })[];
}

// 2. Props untuk Admin/Reviewer/Assign.tsx
export interface AssignReviewerProps extends PageProps {
    unassignedProposals: Proposal[];
    availableReviewers: { id: number; name: string; expertise: string }[];
}

// 3. Props untuk Admin/Reviewer/Summary.tsx
export interface ReviewSummaryProps extends PageProps {
    proposal: Proposal;
    reviews: (PlotReviewer & {
        scores: { criteria_name: string; score: number }[];
        catatan_evaluasi: string | null;
    })[];
    averageScore: number;
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Dashboard Reviewer (`Reviewer/Index.tsx`)
1.  **Header**: Judul `"Dashboard Penilai (Reviewer)"`, sub-judul deskripsi antrean tugas.
2.  **Tabel Penugasan**:
    *   *Kolom*: `Judul Proposal`, `Skema Penelitian`, `Pengusul`, `Tenggat Waktu`, `Sisa Hari (Countdown)`, `Aksi`.
    *   *Sisa Hari*: Visual warna merah jika sisa waktu review `< 3 hari` untuk meningkatkan atensi reviewer.
    *   *Aksi*: Tombol `<Button>` dengan label `"Mulai Menilai"` (mengarahkan ke FormReview).

### B. Plotting Reviewer LPPM (`Admin/Reviewer/Assign.tsx`)
1.  **Tata Letak**: Tabel pencocokan proposal dengan reviewer.
2.  **Mekanisme Plotting**:
    *   Setiap baris proposal menyertakan dropdown pencarian reviewer (`availableReviewers`).
    *   Pilih nama reviewer dari dropdown, lalu tekan tombol `"Assign"` yang memicu pembukaan `<AssignModal>` konfirmasi.

### C. Halaman Rubrik Penilaian Reviewer (`Reviewer/FormReview.tsx`)
1.  **Split Layout**:
    *   *Kolom Kiri*: PDF viewer proposal penelitian dosen yang dinilai.
    *   *Kolom Kanan*: Formulir kuesioner penilaian rubrik skor (`AssessmentCriteria`).
2.  **Kalkulasi Real-Time**:
    *   Reviewer menginput poin angka kriteria.
    *   Visualisasi di bagian bawah secara otomatis menampilkan rata-rata kalkulasi nilai (*real-time*).
    *   *Kondisional*: Jika reviewer merekomendasikan `"Revisi"` atau `"Ditolak"`, tampilkan kolom wajib Textarea `"Catatan Evaluasi"`.

### D. Rekap Hasil Review LPPM (`Admin/Reviewer/Summary.tsx`)
1.  **Rekap Matriks**: Menampilkan nilai rata-rata dari multi-reviewer (menggunakan linear table side-by-side).
2.  **Aksi Putusan Akhir**:
    *   LPPM memilih putusan akhir: `Diterima`, `Ditolak`, atau `Revisi`.
    *   Tombol `"Simpan Putusan LPPM"` untuk mengunci hasil dan memicu notifikasi.

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<DatePicker value={date} onChange={setDate} />`
*   Komponen input kalender responsif (Pop-over calendar menggunakan `react-day-picker` & `date-fns`).
*   Membatasi pemilihan tanggal agar tidak bisa memilih tanggal di masa lampau untuk jadwal review baru.

### 2. Komponen `<DynamicInput values={list} onChange={setList} />`
*   Input formulir dinamis khusus untuk halaman tambah kriteria penilaian.
*   Tombol `"Tambah Baris"` (ikon plus) menyisipkan kolom kriteria baru, dan tombol ikon sampah di ujung kanan baris untuk menghapus kriteria terkait.

### 3. Komponen `<AssignModal isOpen={...} onClose={...} onConfirm={...} data={...} />`
*   Modal dialog konfirmasi yang menampilkan ringkasan data pencocokan: `"Apakah Anda yakin ingin menugaskan [Nama Reviewer] untuk menilai proposal berjudul [Judul Proposal]?"`.

---

## 5. Alur Interaksi & Routing Inertia

*   **Plotting Reviewer**:
    *   Method: `POST` ke `/admin/reviewer/assign`.
    *   Data: `{ id_proposal, id_reviewer }`.
*   **Penyimpanan Penilaian**:
    *   Method: `POST` ke `/reviewer/assessment/{id_plot_reviewer}`.
    *   Validasi: `StoreReviewRequest` memvalidasi kelengkapan isian angka kriteria dan catatan kondisional.
*   **Pemberitahuan Tugas Baru (Notification)**:
    *   Metode `notifyReviewer()` dipicu dari backend untuk menyalakan notifikasi lonceng reviewer secara seketika (*real-time notification*).
