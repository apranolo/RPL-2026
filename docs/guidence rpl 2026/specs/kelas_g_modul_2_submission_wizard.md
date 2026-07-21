# Spesifikasi Desain View: Modul 2 — Author Submission Wizard
## Kelas G — Tab 2: Author Submission Wizard (5-Step Form)

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (*view*) dan komponen di Modul 2 Kelas G.

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path | Penanggung Jawab | Deskripsi Singkat Tugas |
| :--- | :--- | :--- | :--- |
| `Index.tsx` | `resources/js/pages/Submission/Index.tsx` | MUHAMMAD DZAKY MUAYYAD | Dashboard Author: daftar pengajuan naskah beserta status dan tanggal. |
| `SubmissionStatusBadge.tsx` | `resources/js/components/SubmissionStatusBadge.tsx` | MUHAMMAD DZAKY MUAYYAD | Komponen stiker warna status naskah (Draft, In Review, Accepted, Published, dll). |
| `Step1Start.tsx` | `resources/js/pages/Submission/Wizard/Step1Start.tsx` | HARYANSYAH DWI NUGROHO | Langkah 1: Pemilihan jurnal target dan persetujuan syarat/ketentuan lisensi. |
| `Step2Upload.tsx` | `resources/js/pages/Submission/Wizard/Step2Upload.tsx` | HARYANSYAH DWI NUGROHO | Langkah 2: Unggah dokumen utama (Manuscript) dan dokumen tambahan (Supplementary). |
| `Step3Metadata.tsx` | `resources/js/pages/Submission/Wizard/Step3Metadata.tsx` | ARIEL ZIJANT ATHALLAH | Langkah 3: Form metadata naskah (Judul, Abstrak, Bahasa, Kata Kunci). |
| `KeywordInput.tsx` | `resources/js/components/KeywordInput.tsx` | ARIEL ZIJANT ATHALLAH | Komponen input kata kunci interaktif berbasis *chips/tags* (ditekan Enter). |
| `Step4Contributors.tsx` | `resources/js/pages/Submission/Wizard/Step4Contributors.tsx` | MUHAMMAD FADLI NOOR H. | Langkah 4: Pengelolaan daftar tim penulis pendamping (Co-Authors) secara dinamis. |
| `ContributorForm.tsx` | `resources/js/components/ContributorForm.tsx` | MUHAMMAD FADLI NOOR H. | Formulir baris dinamis (kloning baris) untuk mengisi nama, email, dan afiliasi Co-Author. |
| `Step5Confirm.tsx` | `resources/js/pages/Submission/Wizard/Step5Confirm.tsx` | FAUZAN SADIDA RAMADHAN | Langkah 5: Ringkasan seluruh data yang telah diisi dan tombol finalisasi submit. |
| `WizardProgressBar.tsx` | `resources/js/components/WizardProgressBar.tsx` | FAUZAN SADIDA RAMADHAN | Komponen indikator langkah wizard horizontal (Langkah 1 s/d 5) dengan status centang. |
| `Show.tsx` | `resources/js/pages/Submission/Show.tsx` | DZAKY RIDHWAN ROSYADA | Tampilan detail naskah author, riwayat status, dan pengunduhan file terkirim. |
| `SubmissionTimeline.tsx` | `resources/js/components/SubmissionTimeline.tsx` | DZAKY RIDHWAN ROSYADA | Papan linimasa riwayat status pelacakan naskah (seperti pelacakan paket e-commerce). |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';

// Struktur Data Submission
export interface Submission {
    id: number;
    id_user: number;
    id_journal: number;
    title: string | null;
    abstract: string | null;
    keywords: string[] | null;
    language: string;
    status: 'Draft' | 'Submitted' | 'In_Review' | 'Copyediting' | 'Production' | 'Published' | 'Declined';
    created_at: string;
    updated_at: string;
    journal?: {
        name: string;
    };
    files?: SubmissionFile[];
    contributors?: Contributor[];
}

export interface SubmissionFile {
    id: number;
    id_submission: number;
    file_path: string;
    file_type: 'ManuscriptMain' | 'Supplementary';
    file_size: number;
    created_at: string;
}

export interface Contributor {
    id: number;
    id_submission: number;
    name: string;
    email: string;
    affiliation: string;
    is_corresponding: boolean;
}

// 1. Props untuk Submission/Index.tsx (Dashboard)
export interface IndexProps extends PageProps {
    submissions: Submission[];
}

// 2. Props untuk Halaman Detail (Submission/Show.tsx)
export interface ShowProps extends PageProps {
    submission: Submission;
    logs: {
        id: number;
        status_before: string;
        status_after: string;
        note: string;
        created_at: string;
    }[];
}

// 3. Props untuk submission wizard (Step 1 s/d 5)
export interface WizardProps extends PageProps {
    submission: Submission;
    journals?: { id: number; name: string }[];
}
```

---

## 3. Aliran & Tata Letak Langkah Wizard (Wizard Step Layouts)

Setiap halaman Wizard (Step 1-5) memiliki struktur layout yang seragam:
1.  **ProgressBar Area**: Posisikan `<WizardProgressBar currentStep={N} />` di bagian paling atas form.
2.  **Card Layout**: Konten dibungkus dalam `<Card className="mt-6">` dengan lebar form dibatasi `max-w-4xl mx-auto`.
3.  **Navigation Footer (Bawah Card)**:
    *   Kiri: Tombol `"Kembali"` (kecuali Step 1) beralih ke Step N-1.
    *   Kanan: Tombol `"Simpan sebagai Draft"` (Secondary Button) dan tombol `"Lanjut"` (Primary Button).

### A. Wizard Step 1: Start (`Step1Start.tsx`)
*   **Pilihan Jurnal**: Dropdown `<Select>` untuk memilih jurnal target.
*   **Syarat & Ketentuan**: Daftar poin-poin checklist persetujuan lisensi (minimal 4 poin komitmen orisinalitas naskah).
*   **Validasi**: Tombol `"Lanjut"` hanya aktif jika **seluruh** kotak checklist sudah dicentang oleh penulis.

### B. Wizard Step 2: Upload Files (`Step2Upload.tsx`)
*   **File Uploader (Manuscript Utama)**: Area dropzone interaktif khusus file docx/pdf (maksimal 20MB). Berikan feedback jika file berhasil diunggah.
*   **Daftar File Unggahan**: Tabel/List berisi file utama dan opsi untuk mengunggah berkas tambahan (Supplementary files seperti dataset/gambar) dengan label tipe file yang jelas.

### C. Wizard Step 3: Metadata (`Step3Metadata.tsx`)
*   **Judul & Abstrak**: Input text besar untuk judul dan Textarea untuk abstrak (dengan counter huruf/kata).
*   **Kata Kunci (Keywords)**: Integrasikan dengan komponen `<KeywordInput>` untuk memisahkan kata kunci menjadi chips/badges setelah menekan tombol Enter.

### D. Wizard Step 4: Contributors (`Step4Contributors.tsx`)
*   **corresponding Author**: Menampilkan informasi default akun penulis yang sedang login (otomatis terpilih sebagai corresponding author).
*   **Tim Penulis Tambahan**: Tombol aksi `Add Contributor` yang akan menyisipkan baris form dinamis (`<ContributorForm>`) baru ke bawah secara tak terbatas. Setiap baris memuat isian Nama, Email, Afiliasi, dan tombol hapus baris (X).

### E. Wizard Step 5: Confirm (`Step5Confirm.tsx`)
*   **Ringkasan Tampilan**: Menampilkan seluruh data rangkuman dari Step 1 hingga Step 4 secara terstruktur (menggunakan accordion atau pembagian seksi informasi yang jelas).
*   **Validasi Akhir**: Menampilkan ceklist kelayakan dokumen. Jika ada berkas atau isian wajib yang terlewat, tombol `"Submit Final"` tidak dapat diklik dan memunculkan peringatan berwarna merah.

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<WizardProgressBar currentStep={number} />`
*   Indikator langkah horizontal: `1. Start ── 2. Upload ── 3. Metadata ── 4. Contributors ── 5. Confirm`.
*   Langkah yang aktif diberikan warna `text-primary` dan garis hijau.
*   Langkah yang sudah selesai diverifikasi diberikan ikon centang hijau (`Check` dari `lucide-react`).

### 2. Komponen `<KeywordInput values={keywords} onChange={setKeywords} />`
*   Input text di mana setiap kali user mengetik kata dan menekan `Enter` atau `,` (koma), teks tersebut bertransformasi menjadi badge/chip yang memiliki tombol hapus `X`.

### 3. Komponen `<ContributorForm index={number} data={...} onChange={...} onRemove={...} />`
*   Sub-form satu baris dinamis yang digunakan pada Step 4. Terdiri dari input horizontal: `Nama`, `Email`, `Afiliasi`, dan tombol ikon `Trash` untuk menghapus data kontributor pendamping tersebut.

### 4. Komponen `<SubmissionStatusBadge status={string} />`
*   Mengikuti skema warna global dengan teks penyesuaian:
    *   `Draft`: `bg-slate-100 text-slate-800 border-slate-200`
    *   `Submitted` / `Production`: `bg-sky-50 text-sky-800 border-sky-200`
    *   `In_Review`: `bg-amber-50 text-amber-800 border-amber-200`
    *   `Published`: `bg-emerald-50 text-emerald-800 border-emerald-200`
    *   `Declined`: `bg-rose-50 text-rose-800 border-rose-200`

### 5. Komponen `<SubmissionTimeline logs={logs} />`
*   Papan timeline vertikal yang memetakan histori alur naskah.
*   Format titik timeline: `[Icon Status] - [Judul Status] - [Waktu Detik/Jam/Hari] - [Catatan Catatan Editor]`.

---

## 5. Alur Interaksi & Routing Inertia

*   **Penyimpanan Draft Sementara (Tiap Step)**:
    *   Setiap kali tombol `"Lanjut"` atau `"Simpan sebagai Draft"` ditekan, kirim request `POST` ke rute penyimpanan draft `/submission/wizard/save-draft` untuk merekam progres.
*   **Pembatalan Pengajuan**:
    *   Tombol `"Batalkan Pengajuan"` pada halaman detail memicu `DELETE` ke `/submission/{id}/cancel` untuk menghapus draf naskah secara aman (soft-delete).
*   **Penyelesaian Akhir (Final Submit)**:
    *   Method: `POST` ke `/submission/wizard/{id}/submit-final`.
    *   Backend melakukan validasi `FinalSubmitRequest` dan melempar user ke halaman Dashboard (`/submission`) dengan alert toast sukses: `"Naskah ilmiah berhasil diajukan dan sedang mengantre di meja editor!"`
