# Spesifikasi Desain View: Modul 6 — Dashboard dan Pelaporan

## Kelas B — Tab 6: Dashboard & Pelaporan

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (_view_) dan komponen di Modul 6 Kelas B (Dashboard & Report Generator).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path                                     | Penanggung Jawab   | Deskripsi Singkat Tugas                                                            |
| :---------------------- | :---------------------------------------------- | :----------------- | :--------------------------------------------------------------------------------- |
| `User.tsx`              | `resources/js/pages/Dashboard/User.tsx`         | ILHAM ZAKKI S.     | Dashboard Dosen: ringkasan statistik proposal pribadi dan persentase keberhasilan. |
| `StatsCard.tsx`         | `resources/js/components/StatsCard.tsx`         | ILHAM ZAKKI S.     | Komponen kartu metrik data ringkasan (Total Proposal, Total Dana Cair, dll).       |
| `Admin.tsx`             | `resources/js/pages/Dashboard/Admin.tsx`        | AHMAD KHADIDI      | Dashboard Pimpinan/Admin LPPM: grafik helicopter-view data riset universitas.      |
| `BarChart.tsx`          | `resources/js/components/Charts/BarChart.tsx`   | AHMAD KHADIDI      | Komponen grafik batang interaktif untuk visualisasi serapan dana tahunan.          |
| `FacultyTable.tsx`      | `resources/js/components/FacultyTable.tsx`      | M. ABEL RADITYA P. | Tabel rekapitulasi data performa jumlah proposal & luaran per Fakultas/Prodi.      |
| `PieChart.tsx`          | `resources/js/components/Charts/PieChart.tsx`   | M. ABEL RADITYA P. | Komponen grafik lingkaran interaktif sebaran kategori proposal.                    |
| `Generator.tsx`         | `resources/js/pages/Admin/Report/Generator.tsx` | NURWAHDANIA        | Halaman kustom pencetak laporan dengan filter multi-select.                        |
| `MultiSelectFilter.tsx` | `resources/js/components/MultiSelectFilter.tsx` | NURWAHDANIA        | Dropdown pilihan ganda yang mendukung pemilihan banyak opsi sekaligus.             |
| `ExportButtons.tsx`     | `resources/js/components/ExportButtons.tsx`     | CHYNTYA KHUNI K.   | Grup tombol cetak/ekspor berkas data (Download PDF / Download Excel).              |
| `TopResearchList.tsx`   | `resources/js/components/TopResearchList.tsx`   | FAUZAN DIAS K.     | Komponen list papan klasemen (Leaderboard) 5 riset teraktif/terbaik.               |
| `TopLecturerList.tsx`   | `resources/js/components/TopLecturerList.tsx`   | FAUZAN DIAS K.     | Komponen list papan klasemen (Leaderboard) 5 Dosen terproduktif.                   |
| `ActivityLog.tsx`       | `resources/js/components/ActivityLog.tsx`       | NAJRIL ILHAM       | Widget linimasa CCTV kecil pelacak aktivitas sistem di sisi layar dashboard.       |
| `Index.tsx`             | `resources/js/pages/Admin/Settings/Index.tsx`   | HABIBULLOH H. H.   | Halaman kustomisasi identitas aplikasi (Ubah Nama App, Logo, Tenant).              |
| `SkeletonLoader.tsx`    | `resources/js/components/SkeletonLoader.tsx`    | ARVIN MAHMUD S.    | Komponen efek bayangan kerangka pemuatan data untuk transisi loading yang halus.   |
| `ErrorPage.tsx`         | `resources/js/pages/Errors/ErrorPage.tsx`       | ARVIN MAHMUD S.    | Halaman error kustom (404, 403, 500) yang interaktif dan responsif.                |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';

// Struktur Data Statistik Dashboard
export interface DashboardStats {
    total_proposals: number;
    approved_proposals: number;
    rejected_proposals: number;
    success_rate: number; // Persentase kelulusan
    total_absorbed_funding: number; // Dana cair
}

export interface ActivityLogItem {
    id: number;
    actor_name: string;
    description: string;
    created_at: string;
}

// 1. Props untuk Dashboard Dosen (Dashboard/User.tsx)
export interface UserDashboardProps extends PageProps {
    stats: DashboardStats;
    recentActivities: ActivityLogItem[];
}

// 2. Props untuk Dashboard Admin (Dashboard/Admin.tsx)
export interface AdminDashboardProps extends PageProps {
    stats: DashboardStats;
    yearlyFundingData: { year: number; amount: number }[];
    facultyPerformance: { faculty_name: string; submitted: number; accepted: number }[];
    topResearch: { id: number; title: string; citations: number }[];
    topLecturers: { name: string; score: number }[];
    systemLogs: ActivityLogItem[];
}

// 3. Props untuk Admin/Report/Generator.tsx
export interface ReportGeneratorProps extends PageProps {
    availableFaculties: string[];
    availableSchemas: string[];
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Dashboard Dosen (`Dashboard/User.tsx`)

1.  **Grid Metrik (`<StatsCard>`)**:
    - Tampilkan grid kartu metrik 4 kolom di bagian atas: `Total Proposal`, `Status Lolos`, `Total Dana Cair`, dan `Persentase Sukses`.
2.  **Ringkasan Aktivitas**:
    - Tampilkan list aktivitas pengusulan proposal terakhir dan tabel status pengisian logbook.

### B. Dashboard LPPM Helicopter View (`Dashboard/Admin.tsx`)

Halaman ini dirancang kaya grafik dan interaktif:

1.  **Row 1 (Kartu Ringkasan Global)**:
    - Sandingkan kartu metrik global kampus: total anggaran terserap, total proposal masuk di universitas, dan total penelitian terpublikasi.
2.  **Row 2 (Visualisasi Grafik - Split Screen)**:
    - _Kiri (Lebar: 60%)_: Grafik batang `<BarChart>` yang menampilkan fluktuasi dana terserap tahunan.
    - _Kanan (Lebar: 40%)_: Grafik lingkaran `<PieChart>` yang menampilkan sebaran kategori proposal.
3.  **Row 3 (Klasemen & CCTV Log)**:
    - _Kolom 1_: Klasemen top 5 dosen terproduktif (`<TopLecturerList>`).
    - _Kolom 2_: Klasemen top 5 riset teraktif (`<TopResearchList>`).
    - _Kolom 3_: Timeline log aktivitas sistem secara live (`<ActivityLog>`).

### C. Halaman Generator Laporan (`Admin/Report/Generator.tsx`)

1.  **Filter Panel**:
    - Form filter menggunakan komponen multi-select dropdown (`<MultiSelectFilter>`) untuk menyaring data berdasar fakultas, tahun anggaran, dan jenis skema.
2.  **Tombol Ekstrak (`<ExportButtons>`)**:
    - Sediakan grup tombol di sisi kanan bawah filter panel untuk langsung mencetak data menjadi PDF (DOMPDF) atau Excel (Laravel Excel).

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<StatsCard title={...} value={...} icon={...} trend={...} />`

- Gunakan komponen kartu dengan detail visual:
    - Ikon Lucide di pojok kanan atas berlatar lingkaran warna redup.
    - Angka utama berukuran besar (`text-3xl font-extrabold`).
    - Teks tren hijau/merah kecil di bagian bawah (misal: `+12% dibanding tahun lalu`).

### 2. Komponen `<SkeletonLoader className="..." />`

- Menghilangkan efek lompatan visual (_Layout Shift_) saat data sedang di-fetch.
- Gunakan animasi denyut visual (_pulsing animation_): `animate-pulse bg-slate-200 rounded-lg`.

### 3. Komponen `<TopLecturerList data={...} />` & `<TopResearchList data={...} />`

- Menampilkan peringkat leaderboard dengan lencana angka emas `Surya Gold` untuk juara 1, perak untuk juara 2, dan perunggu untuk juara 3.

---

## 5. Alur Interaksi & Routing Inertia

- **Pemicu Download Excel**:
    - Method: `GET` ke `/admin/report/export-excel` (dengan parameter filter).
- **Pemicu Download PDF**:
    - Method: `GET` ke `/admin/report/export-pdf` (dengan parameter filter).
- **Ubah Pengaturan Aplikasi**:
    - Method: `PUT` ke `/admin/settings/update` (menggunakan FormData untuk mengunggah logo baru).
