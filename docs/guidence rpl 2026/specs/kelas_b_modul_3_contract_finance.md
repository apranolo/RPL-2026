# Spesifikasi Desain View: Modul 3 — Manajemen Kontrak dan Pendanaan
## Kelas B — Tab 3: Manajemen Kontrak & Pendanaan

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (*view*) dan komponen di Modul 3 Kelas B (Contract & Finance Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path | Penanggung Jawab | Deskripsi Singkat Tugas |
| :--- | :--- | :--- | :--- |
| `Index.tsx` | `resources/js/pages/Finance/Contract/Index.tsx` | M. NAUFAL AFRIZA | Halaman utama daftar kontrak penelitian (sisi Admin Keuangan). |
| `Show.tsx` | `resources/js/pages/Finance/Contract/Show.tsx` | GILANG JA'FAR P. | Halaman detail draf surat perjanjian digital (*Digital Agreement*). |
| `StatusBadge.tsx` | `resources/js/components/StatusBadge.tsx` | GILANG JA'FAR P. | Komponen lencana warna penanda status kontrak (Aktif, Selesai, Ditangguhkan). |
| `Create.tsx` | `resources/js/pages/Finance/Funding/Create.tsx` | AKMAL PUTRA RAIHAN | Formulir pembuatan termin pencairan dana (alokasi nominal & persentase). |
| `FundingInfo.tsx` | `resources/js/pages/Proposal/FundingInfo.tsx` | HAYQAL AKBAR R. I. | Panel informasi serapan dana penelitian bagi Dosen (progress bar cair vs sisa). |
| `ReceiptModal.tsx` | `resources/js/components/ReceiptModal.tsx` | HAYQAL AKBAR R. I. | Modal dialog preview slip transfer bukti pembayaran kuitansi dana termin. |
| `Upload.tsx` | `resources/js/pages/Finance/Contract/Upload.tsx` | DIMAS FADLY M. A. | Halaman unggah berkas kontrak fisik yang sudah ditandatangani basah. |
| `Index.tsx` | `resources/js/pages/Finance/Report/Index.tsx` | ZAINAL BASRI K. | Halaman laporan audit monitoring keuangan (tabular rekapitulasi). |
| `FilterBar.tsx` | `resources/js/components/FilterBar.tsx` | ZAINAL BASRI K. | Komponen filter laporan keuangan (berdasarkan Tahun, Skema Pendanaan). |
| `Logs.tsx` | `resources/js/pages/Finance/Funding/Logs.tsx` | M. BURHANUDIN A.B. | Halaman log audit histori perubahan termin pembayaran dan pencairan. |
| `BankForm.tsx` | `resources/js/pages/Profile/BankForm.tsx` | KHANSA KAMILAH L. | Formulir pengisian data rekening bank Dosen (Nama Bank, No Rekening, Cabang). |
| `currency.ts` | `resources/js/utils/currency.ts` | KHANSA KAMILAH L. | Helper utilitas untuk melakukan format nominal angka menjadi Rupiah (IDR). |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';
import { Proposal } from './kelas_b_modul_1_proposal_management';

// Struktur Data Kontrak Penelitian
export interface Contract {
    id: number;
    nomor_kontrak: string;
    id_proposal: number;
    total_pendanaan_disetujui: number;
    status_kontrak: 'Aktif' | 'Selesai' | 'Ditangguhkan';
    created_at: string;
    proposal?: Proposal;
}

// Struktur Data Termin Pencairan Dana
export interface FundingTermin {
    id: number;
    id_contract: number;
    termin_number: number; // Term 1, Term 2, dst
    percentage: number; // Persentase (misal: 30 untuk 30%)
    amount: number; // Nominal Rupiah
    status_pencairan: 'Belum_Cair' | 'Proses_Transfer' | 'Sudah_Cair';
    bukti_transfer_path: string | null;
    cair_at: string | null;
}

// 1. Props untuk Finance/Contract/Index.tsx
export interface ContractIndexProps extends PageProps {
    contracts: Contract[];
}

// 2. Props untuk Dosen (Proposal/FundingInfo.tsx)
export interface DosenFundingProps extends PageProps {
    contract: Contract;
    termins: FundingTermin[];
    totalCair: number;
    sisaDana: number;
}

// 3. Props untuk Finance/Report/Index.tsx
export interface FinanceReportProps extends PageProps {
    reportData: {
        nomor_kontrak: string;
        judul_penelitian: string;
        total_dana: number;
        dana_cair: number;
        dana_sisa: number;
        status_kontrak: string;
    }[];
    availableYears: number[];
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Digital Agreement (`Finance/Contract/Show.tsx`)
1.  **Wrapper**: Dibungkus `<AppLayout>` dengan opsi lebar halaman `max-w-4xl mx-auto`.
2.  **Surat Perjanjian**: Tampilkan desain naskah kontrak legal di dalam `<Card className="p-8">` dengan border tipis, menyerupai lembaran kertas cetak (menggunakan tipografi formal, spasi paragraf rapi, dan kolom tanda tangan di bawah).
3.  **Status**: Sematkan `<StatusBadge>` di pojok kanan atas halaman kontrak.

### B. Form Pembuatan Termin Dana (`Finance/Funding/Create.tsx`)
1.  **Visual Input**:
    *   Sediakan input persentase pencairan (misal: Term 1 = `30%`, Term 2 = `40%`, Term 3 = `30%`).
    *   Tampilkan kalkulasi nominal Rupiah (`amount`) secara otomatis saat persentase diinput (memanfaatkan helper `formatRp` dari `currency.ts`).
2.  **Aturan Pengaman**:
    *   *Constraint*: Validasi `StoreFundingRequest` di backend akan menolak penyimpanan jika akumulasi persentase seluruh termin **tidak genap 100%**.
    *   *Monev Lock*: Tombol proses transfer termin lanjutan dinonaktifkan secara otomatis jika status Laporan Kemajuan di modul Monev belum berstatus `"Disetujui"`.

### C. Dashboard Keuangan Dosen (`Proposal/FundingInfo.tsx`)
1.  **Informasi Finansial**:
    *   Tampilkan widget progress bar serapan keuangan (`Serapan Finansial: 70%`) menggunakan warna hijau utama.
    *   Sandingkan dua box informasi: `Total Dana Cair (Rupiah)` dan `Sisa Dana Belum Cair (Rupiah)`.
2.  **Bukti Transfer**:
    *   Daftar list termin yang sudah cair dilengkapi tombol aksi `"Unduh Bukti Transfer"`. Jika ditekan, buka `<ReceiptModal>` untuk menampilkan berkas transfer (JPG/PDF).

### D. Tabel Laporan Keuangan LPPM (`Finance/Report/Index.tsx`)
1.  **Header Laporan**: Judul halaman audit dan komponen filter bar (`<FilterBar>`) di atas tabel.
2.  **Filter Filter**:
    *   Dropdown pencarian tahun anggaran dan filter skema pendanaan untuk penyaringan cepat.

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<StatusBadge status={string} />`
*   Badge penanda status kontrak:
    *   `Aktif`: `bg-emerald-50 text-emerald-800 border-emerald-200`
    *   `Selesai`: `bg-sky-50 text-sky-800 border-sky-200`
    *   `Ditangguhkan`: `bg-rose-50 text-rose-800 border-rose-200`

### 2. Komponen `<ReceiptModal isOpen={...} onClose={...} fileUrl={string} />`
*   Modal dialog pop-up yang menyematkan dokumen transfer bank.
*   Jika berformat gambar, tampilkan gambar langsung dengan resolusi responsif. Jika formatnya PDF, gunakan inline iframe viewer atau tombol download.

### 3. Komponen `<FilterBar years={...} onChange={...} />`
*   Form filter satu baris berisi: `Dropdown Tahun` (Select), `Dropdown Skema` (Select), dan tombol `"Reset Filter"` (Outline).

---

## 5. Alur Interaksi & Routing Inertia

*   **Pembuatan Draft Kontrak**:
    *   Method: `POST` ke `/finance/contract/generate`.
*   **Penginputan Termin**:
    *   Method: `POST` ke `/finance/funding/store-termin`.
    *   Validasi: Validasi persentase total 100% via `StoreFundingRequest`.
*   **Pengunggahan Bukti Transfer**:
    *   Method: `POST` ke `/finance/funding/upload-bukti` (menggunakan FormData untuk berkas JPG/PDF maks 5MB).
*   **Pembaruan Rekening Bank Dosen**:
    *   Method: `PUT` ke `/profile/bank/update`.
