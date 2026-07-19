# Spesifikasi Desain View: Modul 6 — Production & Issue Management

## Kelas G — Tab 6: Production & Issue Management

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (_view_) dan komponen di Modul 6 Kelas G (Issue & Publishing Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path                                        | Penanggung Jawab   | Deskripsi Singkat Tugas                                                           |
| :---------------------- | :------------------------------------------------- | :----------------- | :-------------------------------------------------------------------------------- |
| `Index.tsx`             | `resources/js/pages/Production/Issue/Index.tsx`    | OKTA NUZULIFA      | Halaman daftar Issue Jurnal (filter: Draf / Terbit), serta form buat Issue baru.  |
| `Create.tsx`            | `resources/js/pages/Production/Issue/Create.tsx`   | ANGGASTA V. K.     | Formulir pembuatan Issue baru (Volume, Nomor, Tahun, Deskripsi, Cover).           |
| `Edit.tsx`              | `resources/js/pages/Production/Issue/Edit.tsx`     | ANGGASTA V. K.     | Formulir pengubahan metadata Issue yang berstatus Draft.                          |
| `Manage.tsx`            | `resources/js/pages/Production/Galley/Manage.tsx`  | M. ALVAN AZIZ W.   | Halaman manajemen Galley per artikel (unggah PDF final, penempatan ke Issue).     |
| `ArticleSequencer.tsx`  | `resources/js/components/ArticleSequencer.tsx`     | M. ALVAN AZIZ W.   | Komponen drag-and-drop untuk mengatur urutan susunan artikel di daftar isi Issue. |
| `Preview.tsx`           | `resources/js/pages/Production/Issue/Preview.tsx`  | ALYA AULIA AZZAHRA | Halaman pratinjau daftar isi (TOC) Issue sebelum benar-benar diterbitkan.         |
| `PublishChecklist.tsx`  | `resources/js/components/PublishChecklist.tsx`     | ALYA AULIA AZZAHRA | Dialog konfirmasi ganda berlapis checklist sebelum menerbitkan Issue.             |
| `SetMeta.tsx`           | `resources/js/pages/Production/Galley/SetMeta.tsx` | M. RAYHAN P. B.    | Formulir presisi penetapan nomor halaman (from-to) dan kode DOI artikel.          |
| `IssueCard.tsx`         | `resources/js/components/IssueCard.tsx`            | M. RAYHAN P. B.    | Kartu visual ringkasan Issue (Volume, Nomor, Tahun, Gambar Cover) di dashboard.   |
| `Index.tsx`             | `resources/js/pages/Production/Queue/Index.tsx`    | M. IMAN NUR RISKI  | Antrean naskah yang lolos Copyediting untuk masuk penjadwalan terbit.             |
| `TOCEditor.tsx`         | `resources/js/components/TOCEditor.tsx`            | M. IMAN NUR RISKI  | Komponen editor Table of Contents (TOC) untuk menyusun pengelompokan rubrik.      |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';
import { Submission } from './kelas_g_modul_2_submission_wizard';

// Struktur Data Issue Jurnal
export interface Issue {
    id: number;
    volume: number;
    number: number;
    year: number;
    title: string | null; // Judul khusus edisi tematik (opsional)
    description: string | null;
    cover_image_path: string | null;
    status: 'Draft' | 'Published';
    published_at: string | null;
    created_at: string;
}

// Struktur Data Galley (Dokumen Terbit Final)
export interface Galley {
    id: number;
    id_submission: number;
    id_issue: number | null;
    file_path: string;
    file_extension: 'pdf' | 'html' | 'xml';
    doi: string | null;
    pages: string | null; // Format: "10-15"
    sequence: number; // Urutan list dalam issue
    created_at: string;
}

// 1. Props untuk Production/Issue/Index.tsx
export interface IssueIndexProps extends PageProps {
    issues: Issue[];
}

// 2. Props untuk Production/Queue/Index.tsx
export interface ProductionQueueProps extends PageProps {
    queueSubmissions: (Submission & { copyedited_file_path: string })[];
}

// 3. Props untuk Preview Issue (Production/Issue/Preview.tsx)
export interface IssuePreviewProps extends PageProps {
    issue: Issue;
    articles: (Submission & { galley: Galley })[];
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Antrean Artikel Siap Terbit (`Production/Queue/Index.tsx`)

1.  **Header Area**: Judul `"Antrean Produksi"`, sub-judul deskriptif.
2.  **Daftar Antrean**:
    - Tampilkan grid kartu naskah yang bertuliskan status `"Siap Produksi"`.
    - Di setiap kartu, tampilkan judul artikel, pengarang, tautan unduh berkas hasil copyedit final, dan tombol aksi utama `"Jadwalkan Terbit"` (mengarahkan ke menu Galley Manage).

### B. Manajemen Galley per Artikel (`Production/Galley/Manage.tsx`)

1.  **Wrapper**: Lebar konten dibatasi `max-w-4xl mx-auto`.
2.  **Form Kelola Galley**:
    - **Unggah PDF Terbitan**: Area dropzone uploader untuk mengunggah file Layout Final (Galley) berformat PDF/HTML/XML.
    - **Pilih Edisi Terbitan (Issue)**: Dropdown pilihan (`<Select>`) yang berisi daftar Issue berstatus **Draft** yang telah disiapkan.
    - **Tombol Aksi**: Tombol `"Simpan Pengaturan"` dan tombol `"Ubah Halaman & DOI"` (mengarahkan ke SetMeta).

### C. Halaman Pengesahan Halaman & DOI (`Production/Galley/SetMeta.tsx`)

1.  **Form Input**:
    - **DOI (Digital Object Identifier)**: Input teks dengan placeholder `10.xxxx/xxxx.vX`. Wajib memiliki validasi keunikan agar tidak ada DOI ganda.
    - **Penomoran Halaman**: Input dua kolom input berdampingan: `Halaman Mulai` (From) dan `Halaman Selesai` (To) (misal: input `10` dan `15` akan disimpan ke database sebagai string `"10-15"`).

### D. Pratinjau Daftar Isi & Publikasi (`Production/Issue/Preview.tsx`)

Halaman ini meniru struktur Table of Contents (TOC) portal jurnal publik asli:

1.  **Issue Metadata**: Tampilkan gambar cover edisi jurnal di sebelah kiri, serta detail Volume, Nomor, Tahun di sebelah kanan.
2.  **Daftar Urutan Artikel (`<ArticleSequencer>`)**:
    - Tampilkan daftar baris judul artikel ilmiah beserta pengarang.
    - Integrasikan dengan library `@dnd-kit` untuk memungkinkan admin menggeser/menyeret baris artikel ke atas atau bawah secara interaktif (_drag-and-drop_) guna menentukan urutan letak cetak di daftar isi.
3.  **Aksi Rilis (`<PublishChecklist>`)**:
    - Tombol `"Terbitkan Edisi Ini"` (warna primer hijau) yang memicu dibukanya modal dialog checklist verifikasi akhir.

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<ArticleSequencer articles={...} onOrderChange={...} />`

- Gunakan `@dnd-kit/core` dan `@dnd-kit/sortable` untuk merakit list drag-and-drop yang mulus.
- Setiap baris yang diseret wajib menampilkan visual bayangan (_drag shadow_) dan ikon pegangan seret (`GripVertical` dari `lucide-react`) di sebelah kiri judul.

### 2. Komponen `<IssueCard issue={...} />`

- Gunakan komponen `<Card>` dengan visual bento-style:
    - Tampilkan cover gambar issue (jika kosong, sediakan gambar placeholder default buku jurnal).
    - Teks tebal: `Volume X, Nomor Y, Tahun Z`.
    - Badge indikator status: Hijau jika `Published`, Abu-abu jika `Draft`.

### 3. Komponen `<PublishChecklist isOpen={...} onClose={...} onConfirm={...} />`

- Modal konfirmasi keselamatan rilis. Sebelum tombol `"Konfirmasi Rilis"` aktif dan dapat diklik, admin wajib mencentang secara manual 3 syarat penting:
    1.  `[ ] Saya menyatakan seluruh file Galley PDF artikel di dalam edisi ini sudah final.`
    2.  `[ ] Saya menyatakan nomor halaman dan DOI masing-masing artikel sudah valid dan tidak ada duplikasi.`
    3.  `[ ] Saya sadar tindakan menerbitkan ini bersifat massal dan akan langsung mempublikasikan seluruh naskah di dalamnya ke dunia luar.`

---

## 5. Alur Interaksi & Routing Inertia

- **Pembuatan Issue Baru**:
    - Method: `POST` ke `/production/issue/store`.
    - Validasi: Divalidasi oleh `StoreIssueRequest` untuk menghalangi duplikasi kombinasi _[Volume + Nomor + Tahun]_.
- **Penjadwalan Artikel (Assign to Issue)**:
    - Method: `POST` ke `/production/galley/assign`.
    - Data: `{ id_submission, id_issue }`.
- **Pembaruan Urutan Artikel**:
    - Method: `PUT` ke `/production/issue/{id}/reorder`.
    - Data: `{ ordered_ids: number[] }` (dikirim saat seret dilepas).
- **Eksekusi Menerbitkan (Publish)**:
    - Method: `POST` ke `/production/issue/{id}/publish`.
    - Redirect: Kembali ke index issue dengan toast sukses: `"Edisi jurnal berhasil diterbitkan ke publik!"`
