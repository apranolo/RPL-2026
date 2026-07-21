# Spesifikasi Desain View: Modul 5 — Manajemen Luaran Penelitian
## Kelas B — Tab 5: Manajemen Luaran Penelitian

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (*view*) dan komponen di Modul 5 Kelas B (Research Outputs Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path | Penanggung Jawab | Deskripsi Singkat Tugas |
| :--- | :--- | :--- | :--- |
| `Index.tsx` | `resources/js/pages/Output/Index.tsx` | HIDAYAT LOSSEN | Halaman daftar portofolio luaran riset yang sudah diajukan oleh dosen. |
| `Create.tsx` | `resources/js/pages/Output/Create.tsx` | ALVIN LUQMANUL H. | Form utama tambah luaran (dengan dropdown pemilih jenis luaran). |
| `JournalForm.tsx` | `resources/js/components/Forms/JournalForm.tsx` | ALVIN LUQMANUL H. | Sub-form khusus luaran Jurnal Ilmiah (wajib menginput Tautan URL/DOI). |
| `HkiForm.tsx` | `resources/js/components/Forms/HkiForm.tsx` | FAIZ SADDAM R. M. | Sub-form khusus Hak Kekayaan Intelektual (HKI) / Paten (Input No. Paten). |
| `BookForm.tsx` | `resources/js/components/Forms/BookForm.tsx` | FAIZ SADDAM R. M. | Sub-form khusus Buku/Modul ajar (Wajib input nomor ISBN). |
| `ProductForm.tsx` | `resources/js/components/Forms/ProductForm.tsx` | AGUNG KURNIAWAN | Sub-form khusus produk fisik/prototipe rekayasa industri. |
| `FilePreview.tsx` | `resources/js/components/FilePreview.tsx` | AGUNG KURNIAWAN | Komponen pratinjau mini (inline preview) untuk gambar sertifikat atau cover PDF. |
| `Edit.tsx` | `resources/js/pages/Output/Edit.tsx` | AKBAR ZAQI F. | Halaman edit luaran dinamis (menyunting luaran yang dikembalikan/ditolak). |
| `OutputFormSelector.ts` | `resources/js/utils/OutputFormSelector.ts` | AKBAR ZAQI F. | Helper logika pengkondisian tampilan sub-form berdasarkan jenis luaran. |
| `Index.tsx` | `resources/js/pages/Admin/Output/Index.tsx` | FARIS ILHAM P. | Halaman daftar antrean verifikasi luaran masuk (Admin LPPM). |
| `VerifyModal.tsx` | `resources/js/components/VerifyModal.tsx` | FARIS ILHAM P. | Modal verifikasi persetujuan/penolakan berkas luaran dosen. |
| `Citation.tsx` | `resources/js/pages/Profile/Citation.tsx` | AGIL MAULANA | Halaman statistik portofolio sitasi & H-Index Dosen (Google Scholar sync). |
| `OutputShow.tsx` | `resources/js/pages/Public/OutputShow.tsx` | TUTUR PRYAMBADHA | Halaman katalog landing page publik detail informasi luaran universitas. |
| `GlobalSearch.tsx` | `resources/js/components/GlobalSearch.tsx` | TUTUR PRYAMBADHA | Widget kotak pencarian melayang (*Search Bar*) di header navigasi publik. |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';

// Struktur Data Luaran Penelitian (Polymorphic-like structure)
export interface ResearchOutput {
    id: number;
    id_contract: number;
    jenis_luaran: 'Jurnal' | 'HKI' | 'Buku' | 'Produk';
    judul_luaran: string;
    tahun_capaian: number;
    tautan_publikasi: string | null; // Wajib jika jenis_luaran == "Jurnal"
    file_sertifikat_atau_cover: string; // URL/Path gambar/PDF
    status_verifikasi: 'Draft' | 'Menunggu_Verifikasi' | 'Terverifikasi_LPPM' | 'Ditolak';
    created_at: string;
    
    // Field opsional penentu detail jenis
    doi?: string;
    no_paten?: string;
    isbn?: string;
}

// Struktur Data Sitasi Dosen
export interface Citation {
    id: number;
    id_user: number;
    h_index: number;
    total_citations: number;
    yearly_data: { year: number; citations: number }[]; // Data grafik
    last_synced_at: string;
}

// 1. Props untuk Output/Index.tsx
export interface OutputIndexProps extends PageProps {
    outputs: ResearchOutput[];
}

// 2. Props untuk Admin/Output/Index.tsx
export interface AdminOutputProps extends PageProps {
    pendingOutputs: (ResearchOutput & { dosen_name: string; judul_penelitian: string })[];
}

// 3. Props untuk Profile/Citation.tsx
export interface CitationProps extends PageProps {
    citationData: Citation | null;
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Formulir Pendaftaran Luaran Dinamis (`Output/Create.tsx`)
1.  **Form Selector**:
    *   Tampilkan dropdown utama `<Select>` untuk memilih `"Jenis Luaran"`.
    *   Gunakan logika helper `OutputFormSelector.ts` untuk memuat sub-form yang relevan secara instan tanpa memuat ulang halaman:
        *   Memilih `"Jurnal"` -> me-render `<JournalForm />` (isinya input judul jurnal, DOI, volume, nama jurnal).
        *   Memilih `"HKI"` -> me-render `<HkiForm />` (isinya input jenis paten, nomor paten, pemegang hak cipta).
        *   Memilih `"Buku"` -> me-render `<BookForm />` (isinya input ISBN, nama penerbit, jumlah halaman).
        *   Memilih `"Produk"` -> me-render `<ProductForm />` (isinya deskripsi produk, manfaat, instansi mitra).
2.  **Uploader & Preview**: Selipkan komponen `<FilePreview>` di bagian unggah berkas cover/sertifikat agar Dosen tahu berkasnya sudah benar.

### B. Verifikasi Luaran LPPM (`Admin/Output/Index.tsx`)
1.  **Split Viewer**:
    *   *Sisi Kiri*: Tabel daftar berkas luaran masuk yang mengantre diverifikasi.
    *   *Sisi Kanan*: Komponen peninjau mini `<FilePreview>` yang menampilkan preview visual sertifikat/cover buku yang diunggah secara inline tanpa download.
2.  **Aksi Penyetujuan**: Tombol verifikasi memicu dibukanya `<VerifyModal>` yang mewajibkan input pesan jika status diubah ke `Ditolak`.

### C. Profil Portofolio Sitasi Dosen (`Profile/Citation.tsx`)
1.  **Analytic Dashboard**:
    *   Tampilkan 2 Box Widget: `H-Index` (Angka besar) dan `Total Sitasi` (Angka besar).
    *   *Grafik Sitasi*: Chart garis (Line Chart) interaktif yang menampilkan tren sitasi tahunan dosen yang disinkronisasi dari Google Scholar.
    *   Kanan atas: Tombol `"Sinkronisasi Google Scholar"` (memicu loading state async).

### D. Landing Page Publik (`Public/OutputShow.tsx`)
1.  **Navbar Publik**: Sematkan `<GlobalSearch>` (search bar melayang).
2.  **Katalog Publik**: Grid kartu luaran universitas yang dapat dikunjungi oleh tamu/guest, dilengkapi fitur pencarian kata kunci dan filter jenis luaran.

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<FilePreview fileUrl={string} className="..." />`
*   Komponen inline renderer.
*   Jika tautan berupa ekstensi gambar (JPG/PNG), render `<img src={fileUrl} className="object-cover rounded-lg border" />`.
*   Jika tautan berupa berkas PDF, tampilkan ikon PDF besar dan tombol preview modal orisinal.

### 2. Komponen `<VerifyModal isOpen={...} onClose={...} onConfirm={...} />`
*   Dialog modal persetujuan:
    *   Sediakan tombol `"Setujui Verifikasi"` (Green).
    *   Sediakan tombol `"Tolak Berkas"` (Red) yang memunculkan Textarea `"Catatan Penolakan"`. Teks catatan wajib diisi jika tombol tolak ditekan.

### 3. Komponen `<GlobalSearch onSearch={...} />`
*   Widget input pencarian dengan ikon `Search` di sebelah kiri dan tombol kustom clear (X) di sebelah kanan.
*   Menggunakan efek melayang (*Floating Navbar Search*) yang responsif di desktop maupun perangkat mobile.

---

## 5. Alur Interaksi & Routing Inertia

*   **Penyimpanan Luaran**:
    *   Method: `POST` ke `/output/store/journal` (atau rute spesifik lainnya sesuai pilihan dropdown).
*   **Verifikasi LPPM**:
    *   Method: `POST` ke `/admin/output/verify/{id}`.
    *   Data: `{ status_verifikasi, reject_note }`.
*   **Sinkronisasi Sitasi**:
    *   Method: `POST` ke `/profile/citation/sync`.
    *   Redirect: Kembali ke halaman profil dengan toast sukses: `"Data sitasi Google Scholar berhasil disinkronkan!"`
