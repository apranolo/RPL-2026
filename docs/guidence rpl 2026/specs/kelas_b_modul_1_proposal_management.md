# Spesifikasi Desain View: Modul 1 — Manajemen Proposal Penelitian

## Kelas B — Tab 1: Manajemen Proposal Penelitian

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (_view_) dan komponen di Modul 1 Kelas B (Proposal Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path                                   | Penanggung Jawab    | Deskripsi Singkat Tugas                                                            |
| :---------------------- | :-------------------------------------------- | :------------------ | :--------------------------------------------------------------------------------- |
| `Index.tsx`             | `resources/js/pages/Proposal/Index.tsx`       | IRHAM ASDURROH      | Halaman daftar proposal milik Dosen (tabel proposal & badge status).               |
| `Show.tsx`              | `resources/js/pages/Proposal/Show.tsx`        | IRHAM ASDURROH      | Halaman rincian detail proposal, status evaluasi, dan riwayat revisi.              |
| `Create.tsx`            | `resources/js/pages/Proposal/Create.tsx`      | BAHARUDIN ALVIN D.  | Formulir pengajuan proposal baru (Judul, Abstrak, Skema Pendanaan).                |
| `Edit.tsx`              | `resources/js/pages/Proposal/Edit.tsx`        | FIDYAH RAHMAN       | Formulir edit proposal (hanya aktif jika berstatus Draft atau dikembalikan admin). |
| `FileUploader.tsx`      | `resources/js/components/FileUploader.tsx`    | AHMAD TIBYAN HAKIM  | Komponen unggah dokumen proposal berformat PDF (Drag & Drop interaktif).           |
| `Index.tsx`             | `resources/js/pages/Admin/Proposal/Index.tsx` | M. FADHILA ULINNUHA | Halaman kelola verifikasi administrasi seluruh proposal masuk bagi Admin LPPM.     |
| `ActionButtons.tsx`     | `resources/js/components/ActionButtons.tsx`   | M. FADHILA ULINNUHA | Komponen tombol Approve (hijau) & Reject (merah) dengan popup input alasan tolak.  |
| `Index.tsx`             | `resources/js/pages/Admin/Schema/Index.tsx`   | RAKA BONDAN P.      | Halaman manajemen master data Skema Penelitian (Admin Kampus).                     |
| `Create.tsx`            | `resources/js/pages/Admin/Schema/Create.tsx`  | ASYIFA CITRA R.     | Formulir penambahan Skema Penelitian baru (Nama Skema, Deskripsi, Dana Maks).      |
| `Edit.tsx`              | `resources/js/pages/Admin/Schema/Edit.tsx`    | ASYIFA CITRA R.     | Formulir penyuntingan kriteria atau pagu anggaran Skema Penelitian.                |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';

// Struktur Data Skema Penelitian
export interface ResearchSchema {
    id: number;
    schema_name: string;
    description: string;
    max_funding: number; // Angka pagu dana maksimal
    is_active: boolean;
    created_at: string;
}

// Struktur Data Proposal Penelitian
export interface Proposal {
    id: number;
    id_pengusul: number;
    id_skema_pendanaan: number;
    judul_penelitian: string;
    abstrak: string;
    latar_belakang: string;
    file_dokumen_proposal: string; // URL/Path berkas PDF
    status_proposal: 'Draft' | 'Submitted' | 'Administrasi_Valid' | 'Ditolak';
    tanggal_pengajuan: string;
    created_at: string;
    pengusul?: {
        name: string;
        nidn: string;
        faculty: string;
    };
    schema?: ResearchSchema;
}

// 1. Props untuk Proposal/Index.tsx
export interface ProposalIndexProps extends PageProps {
    proposals: Proposal[];
}

// 2. Props untuk Admin/Proposal/Index.tsx
export interface AdminProposalIndexProps extends PageProps {
    incomingProposals: Proposal[];
}

// 3. Props untuk Admin/Schema/Index.tsx
export interface SchemaIndexProps extends PageProps {
    schemas: ResearchSchema[];
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Dashboard Proposal Dosen (`Proposal/Index.tsx`)

1.  **Wrapper**: Dibungkus `<AppLayout>` dengan breadcrumbs Dashboard Dosen.
2.  **Header**: Judul Halaman `"Proposal Penelitian Saya"`. Sisi kanan memuat tombol `<Link href={route('proposal.create')}>` berlabel `"Ajukan Proposal Baru"`.
3.  **Tabel Daftar Proposal**:
    - Tampilkan tabel dengan kolom: `Judul Penelitian`, `Skema Pendanaan`, `Tanggal Pengajuan`, `Status`, `Aksi`.
    - _Kolom Status_: Gunakan status badge seragam (Draft = Grey, Submitted = Blue, Administrasi_Valid = Green, Ditolak = Red).
    - _Kolom Aksi_: Jika status `Draft`, tampilkan tombol Edit (Pencil) dan Hapus (Trash). Jika status `Submitted` atau `Administrasi_Valid`, hanya tampilkan tombol Lihat Detail (Eye).

### B. Form Pengusulan Proposal (`Proposal/Create.tsx` / `Edit.tsx`)

1.  **Card Layout**: Membatasi lebar form `max-w-3xl mx-auto`.
2.  **Form Fields**:
    - **Skema Pendanaan**: Dropdown `<Select>` memuat daftar skema aktif yang ditarik dari backend.
    - **Judul Penelitian**: Input text biasa (maks 255 karakter).
    - **Abstrak**: Textarea besar dengan indikator hitungan karakter (maksimal 2000 karakter).
    - **Latar Belakang**: Textarea besar atau WYSIWYG editor sederhana.
    - **Unggah Dokumen Proposal**: Integrasikan komponen `<FileUploader>` untuk mengunggah dokumen PDF.
3.  **Validasi Form**: Tampilkan `<InputError>` di bawah setiap input.

### C. Verifikasi Administrasi Admin LPPM (`Admin/Proposal/Index.tsx`)

1.  **Tabel Proposal Masuk**: Menampilkan daftar seluruh proposal masuk dari dosen.
2.  **Kolom Aksi Verifikasi (`<ActionButtons>`)**:
    - Setiap baris data menyertakan tombol grup `"Verifikasi"` (Approve / Reject).
    - Tombol Approve memicu pengubahan status menjadi `Administrasi_Valid`.
    - Tombol Reject memicu modal pop-up yang mewajibkan admin mengisi alasan penolakan secara spesifik.

### D. Manajemen Skema (Admin/Schema/Index.tsx)

1.  **Tabel Skema**: Daftar skema pendanaan universitas.
2.  **Kolom**: `Nama Skema`, `Pagu Maksimal Dana (Rupiah)`, `Status Keaktifan`, `Aksi` (Edit/Nonaktifkan).

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<FileUploader value={file} onChange={setFile} accept=".pdf" maxSize={10} />`

- Desain area seret dan lepas (_Drag & Drop_) interaktif.
- Tampilkan ikon file PDF (`FileText` dari `lucide-react`) dan nama file yang terpilih.
- Berikan indikator persentase loading selama pengunggahan file berlangsung.
- _Aturan Validasi Client_: Jika file bukan PDF atau ukuran file melebihi 10MB, batalkan upload dan tampilkan teks peringatan berwarna merah.

### 2. Komponen `<ActionButtons onApprove={...} onReject={...} />`

- Menyandingkan dua tombol aksi:
    - Tombol **Setujui**: `<Button className="bg-emerald-600 hover:bg-emerald-700 text-white">`
    - Tombol **Tolak**: `<Button variant="destructive">`
- Tombol Tolak wajib membuka kotak dialog `<Dialog>` konfirmasi yang menyertakan Textarea alasan penolakan. Tombol konfirmasi tolak di dalam modal hanya aktif jika alasan penolakan terisi minimal 15 karakter.

---

## 5. Alur Interaksi & Routing Inertia

- **Penyimpanan Proposal**:
    - Method: `POST` ke `/proposal/store`.
    - Request Class: `StoreProposalRequest` (melindungi duplikasi judul di tahun yang sama).
- **Aksi Edit Proposal**:
    - Method: `PUT` ke `/proposal/update/{id}`.
- **Verifikasi LPPM**:
    - Approve: `POST` ke `/admin/proposal/{id}/approve`.
    - Reject: `POST` ke `/admin/proposal/{id}/reject` dengan payload `{ reject_reason }`.
