# Spesifikasi Desain View: Modul 4 — Monitoring dan Evaluasi (Monev) Penelitian

## Kelas B — Tab 4: Monitoring dan Evaluasi Penelitian (Monev)

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (_view_) dan komponen di Modul 4 Kelas B (Progress Monitoring & Evaluation Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path                                        | Penanggung Jawab  | Deskripsi Singkat Tugas                                                          |
| :---------------------- | :------------------------------------------------- | :---------------- | :------------------------------------------------------------------------------- |
| `Index.tsx`             | `resources/js/pages/Progress/Index.tsx`            | ARYA DWIKUNCORO   | Halaman daftar logbook dan laporan kemajuan milik Dosen (progress list).         |
| `Create.tsx`            | `resources/js/pages/Progress/Create.tsx`           | MUHAMMAD RAFINDRA | Formulir pengisian entri logbook harian & unggah Laporan Kemajuan/Akhir.         |
| `RichTextEditor.tsx`    | `resources/js/components/RichTextEditor.tsx`       | MUHAMMAD RAFINDRA | Komponen penyunting teks kaya (WYSIWYG) untuk deskripsi aktivitas logbook.       |
| `Index.tsx`             | `resources/js/pages/Reviewer/Evaluation/Index.tsx` | M. NUR RASYID     | Halaman daftar naskah laporan dosen yang perlu dievaluasi oleh Reviewer.         |
| `Show.tsx`              | `resources/js/pages/Reviewer/Evaluation/Show.tsx`  | M. NUR RASYID     | Halaman detail pembacaan laporan kemajuan dosen beserta berkas pendukung.        |
| `Note.tsx`              | `resources/js/pages/Reviewer/Evaluation/Note.tsx`  | MEGA RUKMANA D.   | Halaman pengisian catatan evaluasi dan putusan verifikasi kemajuan riset.        |
| `ProgressTimeline.tsx`  | `resources/js/components/ProgressTimeline.tsx`     | MEGA RUKMANA D.   | Komponen visual linimasa progres riset (jejak langkah mileston dari 0% ke 100%). |
| `Schedule.tsx`          | `resources/js/pages/Admin/Monev/Schedule.tsx`      | RAFLI GUNAWAN     | Halaman pengelolaan timeline kalender pengisian monev bagi Admin LPPM.           |
| `Report.tsx`            | `resources/js/pages/Admin/Monev/Report.tsx`        | MUHAMMAD ROJULAN  | Tabel rekap status kemajuan global dan putusan status keberlanjutan proyek.      |
| `AlertWarning.tsx`      | `resources/js/components/AlertWarning.tsx`         | MUHAMMAD ROJULAN  | Komponen kotak alert peringatan visual untuk keterlambatan/stagnasi riset.       |
| `RemindBtn.tsx`         | `resources/js/pages/Admin/Monev/RemindBtn.tsx`     | DEN HANIEF L. I.  | Tombol aksi cepat untuk mengirim notifikasi/email pengingat manual ke Dosen.     |
| `ProgressBar.tsx`       | `resources/js/components/ProgressBar.tsx`          | M. RASYIT REDHA   | Komponen visual horizontal progress bar indikator persentase capaian.            |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';
import { Contract } from './kelas_b_modul_3_contract_finance';

// Struktur Data Laporan Progress / Monev
export interface ProgressReport {
    id: number;
    id_contract: number;
    jenis_laporan: 'Logbook' | 'Laporan_Kemajuan' | 'Laporan_Akhir';
    tanggal_pelaporan: string;
    persentase_progres: number; // Angka 0 - 100
    deskripsi_kegiatan: string; // HTML dari WYSIWYG
    file_dokumen_lampiran: string | null;
    catatan_evaluator: string | null;
    status_monev: 'Pending' | 'Direview' | 'Diterima' | 'Ditolak';
    created_at: string;
}

// 1. Props untuk Progress/Index.tsx
export interface ProgressIndexProps extends PageProps {
    contract: Contract;
    reports: ProgressReport[];
    overallPercentage: number;
}

// 2. Props untuk Reviewer (Reviewer/Evaluation/Index.tsx)
export interface EvaluatorIndexProps extends PageProps {
    pendingEvaluations: {
        id_contract: number;
        judul_penelitian: string;
        nama_dosen: string;
        last_reported_at: string;
        last_percentage: number;
    }[];
}

// 3. Props untuk Admin (Admin/Monev/Report.tsx)
export interface AdminMonevReportProps extends PageProps {
    rekapData: {
        id_contract: number;
        nomor_kontrak: string;
        judul_penelitian: string;
        nama_dosen: string;
        logbook_count: number;
        current_progress: number;
        status_proyek: 'Lanjut' | 'Stop' | 'Pending';
        is_late: boolean;
    }[];
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Pengisian Logbook Dosen (`Progress/Create.tsx`)

1.  **Form Layout**: Gunakan tata letak formulir vertikal yang dibatasi `max-w-3xl mx-auto`.
2.  **Fields**:
    - **Jenis Laporan**: Dropdown `<Select>` pilihan `Logbook`, `Laporan Kemajuan`, atau `Laporan Akhir`.
    - **Persentase Progres**: Input numerik (range `0` s/d `100`).
        - _Aturan Bisnis_: Persentase bersifat _incremental_ (tidak boleh diinput lebih rendah dari persentase entri sebelumnya).
    - **Deskripsi Aktivitas**: Integrasikan komponen `<RichTextEditor>` untuk mengetik catatan harian lapangan.
    - **Unggah Berkas Pendukung**: File Uploader khusus berkas PDF (lampiran wajib jika memilih Laporan Kemajuan/Akhir).

### B. Evaluasi Progres Reviewer (`Reviewer/Evaluation/Index.tsx`)

1.  **Filter Search**: Sediakan bar pencarian cepat (_Live Search_) di atas tabel antrean untuk mencari judul proposal atau nama dosen.
2.  **Tabel Antrean Evaluasi**:
    - _Kolom_: `Judul Penelitian`, `Dosen Pengusul`, `Progres Terakhir (%)`, `Aksi`.
    - _Kolom Progres_: Tampilkan komponen visual `<ProgressBar>` di dalam sel tabel.

### C. Halaman Detail & Catatan Evaluator (`Reviewer/Evaluation/Show.tsx`)

1.  **Split Screen**:
    - _Kiri_: Menampilkan isi logbook (deskripsi kegiatan kaya format) dan link berkas lampiran.
    - _Kanan_: Menampilkan komponen linimasa vertikal `<ProgressTimeline>` untuk melihat lompatan kemilangan progres dari awal hingga sekarang. Di bawahnya, terdapat tombol aksi `"Isi Catatan Evaluasi"` yang mengarahkan ke form catatan/verifikasi (`Note.tsx`).

### D. Rekap Progres LPPM (`Admin/Monev/Report.tsx`)

1.  **Tabel Monitoring Global**: Rekap seluruh status pengerjaan proyek dosen.
2.  **Peringatan Keterlambatan**: Jika dosen terdeteksi stagnan (tidak mengunggah logbook > 14 hari), baris tabel ditandai warna kuning redup dan menyematkan komponen `<AlertWarning>`.
3.  **Aksi Cepat**: Sertakan tombol `<RemindBtn>` di kolom aksi untuk mengirim email pengingat secara manual jika sistem cron asinkronus belum memicu pengingat otomatis.

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<RichTextEditor value={text} onChange={setText} />`

- Menyediakan toolbar pemformatan dasar teks (Bold, Italic, Underline, Bullet/Numbered List).
- Dapat menggunakan library ringan seperti Quill, Trix, atau Editor HTML textarea sederhana berbasis Tailwind styling.

### 2. Komponen `<ProgressTimeline steps={logs} />`

- Linimasa horizontal/vertikal interaktif. Menampilkan milestone pencapaian persentase: `0% ── 25% ── 50% ── 75% ── 100%`.
- Titik-titik milestone akan menyala hijau jika persentase pengajuan dosen sudah melewati batas tersebut.

### 3. Komponen `<AlertWarning message={string} />`

- Kotak info peringatan dengan latar kuning menyala/merah muda (`bg-red-50 text-red-800 border-red-200`) dilengkapi ikon `AlertTriangle` untuk menarik perhatian LPPM.

### 4. Komponen `<ProgressBar percentage={number} />`

- Indikator visual kemajuan horizontal:
    - Gunakan `<div className="w-full bg-slate-100 rounded-full h-2">` sebagai background.
    - Gunakan bar warna hijau: `<div className="bg-primary h-2 rounded-full" style={{ width: `${percentage}%` }}>` untuk visualisasi persentase.

---

## 5. Alur Interaksi & Routing Inertia

- **Penyimpanan Laporan Kemajuan**:
    - Method: `POST` ke `/progress/store`.
    - Validasi: Validasi limit numerik 0-100 dan kewajiban berkas lampiran.
- **Pengiriman Catatan Evaluator**:
    - Method: `POST` ke `/reviewer/evaluation/note/{id_monev}`.
    - Data: `{ catatan_evaluator, status_monev }`.
- **Pemicu Pengingat Manual (Reminder)**:
    - Method: `POST` ke `/admin/reminder/send-manual`.
    - Data: `{ id_contract }` (mengirim email asinkron asertif).
