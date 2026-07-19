# Spesifikasi Desain View: Modul 5 — Revision & Copyediting Workflow

## Kelas G — Tab 5: Revision & Copyediting Workflow

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (_view_) dan komponen di Modul 5 Kelas G (Revision & Copyediting Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen   | Target Path                                          | Penanggung Jawab      | Deskripsi Singkat Tugas                                                                        |
| :------------------------ | :--------------------------------------------------- | :-------------------- | :--------------------------------------------------------------------------------------------- |
| `AuthorRevision.tsx`      | `resources/js/pages/Revision/AuthorRevision.tsx`     | SEPTIAN EKO NUGROHO   | Panel revisi author: menampilkan catatan revisi editor dan ulasan reviewer.                    |
| `RevisionNotePanel.tsx`   | `resources/js/components/RevisionNotePanel.tsx`      | SEPTIAN EKO NUGROHO   | Komponen penampil ulasan kritik reviewer dan instruksi perbaikan dari editor.                  |
| `UploadRevision.tsx`      | `resources/js/pages/Revision/UploadRevision.tsx`     | MUHAMMAD AULIA LUTHFI | Halaman formulir pengunggahan dokumen perbaikan (versi baru) oleh author.                      |
| `DocumentVersionList.tsx` | `resources/js/components/DocumentVersionList.tsx`    | MUHAMMAD AULIA LUTHFI | Komponen list vertikal sejarah file naskah untuk melacak versi dokumen per ronde.              |
| `EditorDecision.tsx`      | `resources/js/pages/Revision/EditorDecision.tsx`     | KUKUH YOGI PANGESTU   | Panel bagi editor untuk menilai berkas revisi author (Terima, Tolak, atau Minta Revisi Ulang). |
| `Assign.tsx`              | `resources/js/pages/Copyediting/Assign.tsx`          | KUKUH YOGI PANGESTU   | Panel penugasan staf penyunting bahasa (_Copyeditor_) oleh editor/admin.                       |
| `CopyeditorPanel.tsx`     | `resources/js/pages/Copyediting/CopyeditorPanel.tsx` | HAFIDZ CHAIRUL AMIN   | Meja kerja 3 kolom copyeditor (File Ori, File Hasil Sunting, Catatan Koreksi).                 |
| `AuthorApproval.tsx`      | `resources/js/pages/Copyediting/AuthorApproval.tsx`  | HAFIDZ CHAIRUL AMIN   | Halaman persetujuan author terhadap hasil suntingan copyeditor sebelum masuk produksi.         |
| `Thread.tsx`              | `resources/js/pages/Discussion/Thread.tsx`           | ALFIN AHMAD JUNIAR    | Halaman detail utas diskusi (menampilkan pesan berantai dan form balas pesan).                 |
| `MessageBubble.tsx`       | `resources/js/components/MessageBubble.tsx`          | ALFIN AHMAD JUNIAR    | Komponen gelembung chat visual mirip WhatsApp/Surel untuk pesan diskusi.                       |
| `Index.tsx`               | `resources/js/pages/Discussion/Index.tsx`            | M. FAUZAN P. D. C.    | Halaman utama daftar seluruh utas diskusi/tiket per submission.                                |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';
import { Submission, SubmissionFile } from './kelas_g_modul_2_submission_wizard';

// Struktur Data Ronde Revisi
export interface RevisionRound {
    id: number;
    id_submission: number;
    round_number: number;
    editor_decision_note: string; // Instruksi perbaikan
    due_date: string;
    status: 'Awaiting_Revision' | 'Submitted' | 'Approved' | 'Rejected';
    created_at: string;
}

// Struktur Data Tugas Copyediting
export interface CopyeditingTask {
    id: number;
    id_submission: number;
    id_copyeditor: number;
    status: 'Assigned' | 'In_Progress' | 'Completed' | 'Author_Approved';
    assigned_at: string;
    completed_at: string | null;
}

// Struktur Data Diskusi Internal
export interface SubmissionDiscussion {
    id: number;
    id_submission: number;
    subject: string;
    stage: 'Editorial' | 'Review' | 'Copyediting' | 'Production';
    created_by: number;
    created_at: string;
}

export interface DiscussionMessage {
    id: number;
    id_discussion: number;
    id_sender: number;
    sender_name: string;
    message_text: string;
    attachment_path: string | null;
    created_at: string;
}

// 1. Props untuk Revision/AuthorRevision.tsx
export interface AuthorRevisionProps extends PageProps {
    submission: Submission;
    currentRound: RevisionRound;
    fileHistory: SubmissionFile[];
}

// 2. Props untuk Copyediting/CopyeditorPanel.tsx
export interface CopyeditorPanelProps extends PageProps {
    submission: Submission;
    task: CopyeditingTask;
    originalFiles: SubmissionFile[];
    copyeditedFiles: SubmissionFile[];
}

// 3. Props untuk Discussion/Index.tsx
export interface DiscussionIndexProps extends PageProps {
    submission: Submission;
    discussions: (SubmissionDiscussion & {
        message_count: number;
        last_message_at: string;
    })[];
}

// 4. Props untuk Discussion/Thread.tsx
export interface DiscussionThreadProps extends PageProps {
    discussion: SubmissionDiscussion;
    messages: DiscussionMessage[];
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Panel Revisi Author (`Revision/AuthorRevision.tsx`)

1.  **Header Halaman**: Judul `"Perbaikan Naskah (Revisi)"`, sub-judul menampilkan nomor ronde perbaikan aktif (misal: `"Ronde Ke-2"`).
2.  **Catatan Ulasan Redaksi (`<RevisionNotePanel>`)**:
    - Letakkan di bagian atas halaman dengan kotak info khusus (_AlertBox/Callout_) berlatar warna kuning redup (`bg-amber-50/50 border-amber-200`) agar author fokus membaca ulasan kritis editor dan reviewer.
3.  **Unggah Berkas Revisi (`UploadRevision.tsx` & `<DocumentVersionList>`)**:
    - _Sisi Kiri_: Area dropzone pengunggahan berkas versi revisi baru (format PDF/DOCX, maks 20MB).
    - _Sisi Kanan_: Menampilkan daftar versi berkas naskah terdahulu (`<DocumentVersionList>`) secara vertikal terurut waktu, untuk mencegah author bingung membedakan berkas lama dan baru.

### B. Meja Kerja Copyeditor (`Copyediting/CopyeditorPanel.tsx`)

Komponen ini didesain lebar menggunakan layout tiga kolom vertikal (_Three-Column Workspace_) untuk ergonomi kerja penyuntingan:

1.  **Kolom Kiri (Layar A: Berkas Asli - Lebar 35%)**:
    - Menampilkan detail artikel naskah original (Acceptance version) dan tombol unduh.
2.  **Kolom Tengah (Layar B: Berkas Baru - Lebar 35%)**:
    - Area dropzone khusus bagi Copyeditor untuk mengunggah file naskah ilmiah yang telah dirapikan tata bahasanya (_Copyedited File_).
3.  **Kolom Kanan (Layar C: Catatan Koreksi - Lebar 30%)**:
    - Form input catatan penyuntingan bahasa yang menjelaskan perubahan penting apa saja yang telah dilakukan.

### C. Persetujuan Copyediting Author (`Copyediting/AuthorApproval.tsx`)

1.  **Wrapper**: Konten form berpusat di tengah (`max-w-xl mx-auto py-12`).
2.  **Klausul Finalisasi**:
    - Menampilkan tautan unduh naskah hasil copyedit.
    - Dosen/Author membaca hasil penyuntingan dan mencentang checkbox: `"Saya menyetujui hasil penyuntingan bahasa naskah ini dan menyatakan siap masuk ke tahap produksi cetak."`
3.  **Tombol Konfirmasi**: Tombol `"Setujui Hasil Copyedit"` berwarna primer yang akan mengunci naskah untuk dikirim ke tim Modul 6 (Production).

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<RevisionNotePanel note={string} />`

- Menampilkan teks instruksi revisi editor dengan dukungan formatting dasar (bold/italic/bullet points).
- Gunakan ikon `AlertCircle` di samping judul catatan untuk menarik perhatian visual author.

### 2. Komponen `<DocumentVersionList files={files} />`

- Sejarah versi berkas naskah:
    - Tampilkan list terurut waktu: `[Ronde 1: File_A.docx] ── [Ronde 2: File_B.docx]`.
    - Sertakan ukuran file, tanggal unggah, dan ikon tombol `Download` (`DownloadCloud` dari `lucide-react`).

### 3. Komponen `<MessageBubble message={...} isCurrentUser={boolean} />`

- Gelembung chat diskusi visual:
    - Jika pengirim adalah user yang sedang login (`isCurrentUser === true`), posisikan gelembung chat di sebelah kanan dengan warna latar hijau muda (`bg-emerald-50 text-emerald-950`).
    - Jika pengirim adalah user lain, posisikan di sebelah kiri dengan warna latar abu-abu terang (`bg-slate-100 text-slate-900`).
    - Sertakan avatar inisial nama, nama lengkap, penunjuk waktu chat (_timestamp_), serta link download lampiran (jika ada file tersemat).

---

## 5. Alur Interaksi & Routing Inertia

- **Penyampaian Berkas Revisi**:
    - Method: `POST` ke `/revision/upload/{id_revision_round}`.
    - Redirect: Kembali ke panel detail naskah dengan toast sukses: `"Berkas revisi berhasil diajukan untuk dinilai Editor!"`
- **Aksi Diskusi Baru (Thread)**:
    - Method: `POST` ke `/discussion/store`.
    - Data: `{ id_submission, subject, message_text, attachment }`.
- **Persetujuan Copyedit oleh Author**:
    - Method: `POST` ke `/copyediting/approve/{id_copyediting_task}`.
    - Redirect: Mengubah status naskah secara database menjadi siap masuk antrean produksi.
