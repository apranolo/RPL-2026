# Spesifikasi Desain View: Modul 3 — Editorial Desk & Assignment
## Kelas G — Tab 3: Editorial Desk & Assignment

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (*view*) dan komponen di Modul 3 Kelas G (Editorial Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path | Penanggung Jawab | Deskripsi Singkat Tugas |
| :--- | :--- | :--- | :--- |
| `Inbox.tsx` | `resources/js/pages/Editorial/Desk/Inbox.tsx` | ADITYA BINTANG R. S. | Dashboard Inbox Editor utama, menampilkan daftar antrean naskah berdasarkan status tab. |
| `InboxTab.tsx` | `resources/js/components/InboxTab.tsx` | ADITYA BINTANG R. S. | Navigasi tab horizontal (Unassigned, Active, Awaiting Decision, Archived) beserta counter jumlah naskah. |
| `AssignEditorModal.tsx` | `resources/js/components/AssignEditorModal.tsx` | AFIF HADRIANSYAH | Modal dialog bagi Editor Utama untuk membagi tugas / menunjuk Section Editor. |
| `DeskReview.tsx` | `resources/js/pages/Editorial/Desk/DeskReview.tsx` | AFIF HADRIANSYAH | Form putusan awal: Lolos ke Review (*Accept for Review*) atau Tolak Langsung (*Desk Reject*). |
| `Show.tsx` | `resources/js/pages/Editorial/Desk/Show.tsx` | MUHAMMAD IRFAN H. | Halaman utama detail naskah sisi editor (memuat PDF viewer, tombol aksi, dan sidebar sejarah keputusan). |
| `InlinePdfViewer.tsx` | `resources/js/components/InlinePdfViewer.tsx` | MUHAMMAD IRFAN H. | Komponen penampil PDF yang ditanam langsung di halaman detail (*embed PDF viewer*). |
| `Plagiarism.tsx` | `resources/js/pages/Editorial/Desk/Plagiarism.tsx` | M. ILHAM NURDIN | Halaman unggah laporan cek plagiasi (Turnitin/iThenticate) dan input persentase kemiripan. |
| `SimilarityBadge.tsx` | `resources/js/components/SimilarityBadge.tsx` | M. ILHAM NURDIN | Indikator visual persentase plagiasi (Merah jika tinggi, Hijau/Biru jika aman). |
| `FinalDecision.tsx` | `resources/js/pages/Editorial/Desk/FinalDecision.tsx` | PRIMUS UTAMA SATYA | Form pengambilan keputusan akhir redaksi (Accept, Revision, atau Reject) dengan catatan wajib. |
| `DecisionHistoryPanel.tsx` | `resources/js/components/DecisionHistoryPanel.tsx` | PRIMUS UTAMA SATYA | Panel linimasa riwayat keputusan editorial per naskah yang ditampilkan di sidebar halaman. |
| `Discussion.tsx` | `resources/js/pages/Editorial/Desk/Discussion.tsx` | FUAD NURYANDITO | Halaman utas diskusi internal tertutup antara Editor dan Author. |
| `DiscussionThread.tsx` | `resources/js/components/DiscussionThread.tsx` | FUAD NURYANDITO | Komponen chat/diskusi berbasis thread (pesan berantai, subjek, lampiran, tombol balas). |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';
import { Submission } from './kelas_g_modul_2_submission_wizard';

// Struktur Data Editorial Assignment
export interface EditorialAssignment {
    id: number;
    id_submission: number;
    id_editor: number; // Foreign Key ke users
    editor_name: string;
    role: 'Editor' | 'SectionEditor';
    assigned_at: string;
}

// Struktur Data Keputusan Editorial
export interface EditorialDecision {
    id: number;
    id_submission: number;
    id_user: number; // Aktor yang memutuskan
    user_name: string;
    decision_type: 'Accept_For_Review' | 'Desk_Reject' | 'Accept_Submission' | 'Revisions_Required' | 'Reject_Submission';
    decision_note: string;
    round: number;
    created_at: string;
}

// Struktur Data Hasil Cek Plagiasi
export interface PlagiarismCheck {
    id: number;
    id_submission: number;
    similarity_index: number; // Persentase (0-100)
    report_file_path: string;
    checked_at: string;
}

// 1. Props untuk Editorial/Desk/Inbox.tsx
export interface InboxProps extends PageProps {
    submissions: Submission[];
    counters: {
        unassigned: number;
        active: number;
        awaiting_decision: number;
        archived: number;
    };
}

// 2. Props untuk Detail Editor (Editorial/Desk/Show.tsx)
export interface ShowProps extends PageProps {
    submission: Submission;
    plagiarism: PlagiarismCheck | null;
    assignments: EditorialAssignment[];
    decisions: EditorialDecision[];
    availableSectionEditors?: { id: number; name: string }[];
}
```

---

## 3. Tata Letak & Navigasi Antarmuka (UI Layouts)

### A. Dashboard Inbox Editor (`Editorial/Desk/Inbox.tsx`)
1.  **Wrapper**: Dibungkus `<AppLayout>` dengan navigasi remah roti (*breadcrumbs*) yang sesuai.
2.  **Inbox Header**: Judul `"Inbox Editorial"`, sub-judul deskriptif.
3.  **Navigasi Tab (`<InboxTab>`)**:
    *   Tampilkan 4 tab horizontal: **Belum Ditugaskan (Unassigned)**, **Aktif (Active)**, **Menunggu Keputusan (Awaiting Decision)**, dan **Diarsipkan (Archived)**.
    *   Setiap tab menyertakan gelembung angka (*badge counter*) di samping label teksnya (misal: `"Unassigned [3]"`).
4.  **Tabel Antrean Naskah**:
    *   Tampilkan tabel dinamis berdasarkan tab yang aktif.
    *   *Kolom*: `Judul Naskah & Penulis`, `Tanggal Kirim`, `Hasil Plagiasi`, `Reviewer Aktif`, `Aksi`.
    *   *Kolom Hasil Plagiasi*: Mengintegrasikan `<SimilarityBadge>` (jika sudah dicek) atau teks `"Belum Cek"` (jika kosong).

### B. Halaman Detail Editor (`Editorial/Desk/Show.tsx`)
Halaman ini menggunakan pembagian layar dua kolom (*Split Screen*) di desktop untuk efisiensi pembacaan naskah:
*   **Kolom Kiri (Lebar: 70% - Area Pembaca)**:
    *   *Metadata Singkat*: Judul, abstrak, kata kunci, dan daftar file unggahan.
    *   *Inline PDF Viewer (`<InlinePdfViewer>`)*: Penampil file PDF artikel manuskrip utama langsung di halaman web tanpa di-download secara lokal.
*   **Kolom Kanan (Lebar: 30% - Panel Kontrol & Aksi)**:
    *   *Menu Cepat Aksi*:
        *   Tombol `"Cek Plagiasi"` (mengarahkan ke menu plagiasi).
        *   Tombol `"Tunjuk Section Editor"` (khusus Editor Utama - memicu modal).
        *   Tombol `"Desk Review"` (untuk keputusan awal).
        *   Tombol `"Rekomendasi Akhir"` / `"Keputusan Akhir"`.
    *   *Panel Riwayat Keputusan (`<DecisionHistoryPanel>`)*: Sidebar yang menampilkan daftar keputusan terdahulu untuk melacak progres ronde review naskah.

### C. Halaman Cek Plagiasi (`Editorial/Desk/Plagiarism.tsx`)
1.  **Wrapper**: Dibatasi lebar konten `max-w-2xl mx-auto`.
2.  **Form Input**:
    *   **Upload Laporan Turnitin/iThenticate**: File uploader (hanya PDF, maks 10MB) menggunakan `<FileUploader>`.
    *   **Persentase Kemiripan (Similarity Index)**: Input angka `0` s/d `100` persen dengan ikon `%` di sebelah kanan input. Tampilkan pesan kesalahan lewat `<InputError>`.
3.  **Visual Feedback**: Menampilkan visual indikator warna secara *real-time* berdasarkan angka kemiripan yang diinputkan.

### D. Halaman Keputusan Final (`Editorial/Desk/FinalDecision.tsx`)
1.  **Wrapper**: Dibatasi lebar konten `max-w-2xl mx-auto`.
2.  **Pilihan Keputusan**: Dropdown `<Select>` dengan pilihan: `Setujui Terbit (Accept)`, `Revisi Ringan (Minor Revision)`, `Revisi Mayor (Major Revision)`, `Tolak Naskah (Reject)`.
3.  **Catatan Keputusan**: Textarea besar untuk memberikan argumen / ulasan redaksi.
    *   *Aturan Validasi*: Teks **wajib diisi minimal 50 karakter** jika keputusan yang dipilih adalah `Tolak Naskah` (untuk menghindari penolakan sepihak tanpa penjelasan logis).

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<InboxTab counters={...} activeTab={...} onChange={...} />`
*   Desain tab horizontal modern (menggunakan `@radix-ui/react-tabs` atau kustom CSS Tailwind).
*   Berikan counter melingkar (`rounded-full bg-slate-100 text-xs px-2 py-0.5 text-slate-600`) yang berubah warna menjadi hijau (`bg-primary text-white`) ketika tab tersebut aktif.

### 2. Komponen `<InlinePdfViewer filePath={string} />`
*   Menanamkan dokumen PDF menggunakan iframe Google Docs Viewer, embed tag HTML5, atau PDF.js.
*   Wajib memiliki rasio aspek responsif (`aspect-[3/4]`) dan tinggi yang disesuaikan layar editor (`min-h-[600px]`).

### 3. Komponen `<SimilarityBadge score={number} />`
*   Badge penanda tingkat kemiripan naskah hasil Turnitin:
    *   `Skor 0% - 15% (Aman)`: `bg-emerald-50 text-emerald-800 border-emerald-200`
    *   `Skor 16% - 25% (Peringatan Awal)`: `bg-amber-50 text-amber-800 border-amber-200`
    *   `Skor > 25% (Bahaya Plagiasi)`: `bg-rose-50 text-rose-800 border-rose-200`

### 4. Komponen `<AssignEditorModal isOpen={...} onClose={...} onSubmit={...} />`
*   Dialog modal yang berisi daftar nama *Section Editor* yang tersedia di sistem beserta bidang fokus keilmuannya.
*   Admin dapat mencari nama editor di search bar modal dan memilih salah satu nama untuk ditugaskan.

### 5. Komponen `<DiscussionThread messages={...} onSendMessage={...} />`
*   UI mirip forum diskusi:
    *   Tampilkan gelembung pesan (*chat bubble*) dengan inisial nama pengirim, waktu kirim, dan link lampiran dokumen.
    *   Sediakan input area text editor di bagian bawah dilengkapi tombol lampiran file klip kertas (*Attachment*) dan tombol `"Kirim Balasan"`.

---

## 5. Alur Interaksi & Routing Inertia

*   **Pemberian Putusan Desk Review**:
    *   Method: `POST` ke `/editorial/desk-review/{id_submission}`.
    *   Data: `{ decision_type, decision_note }`.
    *   Redirect: Kembali ke Inbox dengan pesan sukses.
*   **Pengunggahan Hasil Plagiasi**:
    *   Method: `POST` ke `/editorial/plagiarism/{id_submission}`.
    *   Redirect: `editorial.desk.show` dengan visual badge similarity terupdate.
*   **Putusan Final Editorial**:
    *   Method: `POST` ke `/editorial/final-decision/{id_submission}`.
    *   Validasi: Divalidasi oleh `EditorialDecisionRequest` untuk minimal kata ulasan.
