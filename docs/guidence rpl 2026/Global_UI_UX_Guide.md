# Panduan Global Gaya Visual & Standar Implementasi View (React Inertia)
## Proyek RPL 2026 — Sistem Penelitian Terintegrasi (Kelas B) & Submission System (Kelas G)

Dokumen ini adalah acuan standar UI/UX, styling, dan pola coding frontend menggunakan **React, Inertia.js, Tailwind CSS v4, dan shadcn/ui**. Seluruh mahasiswa Kelas B dan Kelas G wajib mengikuti panduan ini saat membuat halaman (*view*) dan komponen agar tampilan akhir aplikasi konsisten, terintegrasi, dan memiliki nilai estetika premium.

---

## 1. Sistem Desain & Estetika Visual (Design Tokens)

Semua styling wajib memanfaatkan variabel CSS yang sudah dikonfigurasi pada file `resources/css/app.css` (Tema: *The Progressive Aurora*). Jangan menuliskan kode warna Hex secara manual di class HTML/React.

### A. Palet Warna Utama
*   **Muhammadiyah Green (`--primary`)**: `#00853c`
    *   *Penggunaan*: Tombol aksi utama (Submit/Simpan), tautan aktif, tab aktif, dan penanda fokus penting.
    *   *Tailwind Class*: `bg-primary`, `text-primary`, `border-primary`.
*   **Progressive Teal (`--secondary`)**: `#04a64b`
    *   *Penggunaan*: Tombol sekunder, lencana/badge bernilai positif, aksen visual penunjang.
    *   *Tailwind Class*: `bg-secondary`, `text-secondary`.
*   **Surya Gold (`--accent`)**: `#fcee1f`
    *   *Penggunaan*: Rating bintang, lencana status khusus, dan teks sorotan penting (gunakan secara hemat).
    *   *Tailwind Class*: `bg-accent`, `text-accent`.
*   **Accent Red (`--destructive` / `--accent-red`)**: `#dc2626` / `#ef4444`
    *   *Penggunaan*: Aksi berisiko tinggi seperti Delete/Hapus, Revoke/Cabut, Reject/Tolak, dan pesan error validasi.
    *   *Tailwind Class*: `bg-destructive`, `text-destructive`, `bg-accent-red`.

### B. Tipografi & Sudut Elemen
*   **Font Utama**: **Plus Jakarta Sans** (diatur otomatis secara global).
*   **Border Radius**: Gunakan `rounded-lg` (setara dengan `10px` / `0.625rem`) untuk tombol, kartu (*card*), modal/dialog, dan input form.
*   **Ketebalan Font**:
    *   Judul Halaman: `font-bold` atau `font-extrabold`
    *   Sub-judul / Label Form: `font-semibold`
    *   Deskripsi / Teks Utama: `font-normal` atau `text-muted-foreground` untuk keterangan tambahan.

---

## 2. Struktur Layout Halaman Utama (Page Layout)

Setiap halaman utama yang dibuat mahasiswa wajib dibungkus dengan komponen `<AppLayout>` dan diatur secara semantik menggunakan Grid/Flexbox dengan margin yang konsisten.

### Contoh Implementasi Halaman Standar:
```tsx
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

// Rute navigasi remah roti (breadcrumbs)
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daftar Proposal', href: route('proposal.index') },
];

interface Props {
    // Definisikan tipe props di sini
}

export default function ProposalIndex({}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Proposal Penelitian" />
            
            {/* Wrapper utama halaman dengan padding yang responsif */}
            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                
                {/* 1. Header Halaman (Judul & Tombol Aksi Kanan) */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                            Daftar Proposal
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Kelola pengajuan proposal penelitian Anda di sini.
                        </p>
                    </div>
                    {/* Area Aksi Kanan, misal tombol tambah */}
                    <div className="flex items-center gap-2">
                        {/* <Button>Tambah Proposal</Button> */}
                    </div>
                </div>

                {/* 2. Area Konten Halaman */}
                <div className="grid gap-6">
                    {/* Letakkan tabel, list card, atau form di sini */}
                </div>
            </div>
        </AppLayout>
    );
}
```

---

## 3. Komponen Reusable & Skema Warna Status (Status Badges)

Status dokumen/proses di Kelas B dan Kelas G wajib diseragamkan warnanya agar mempermudah pemahaman pengguna. Gunakan variasi warna berikut:

| Status | Makna | Kombinasi Warna Tailwind |
| :--- | :--- | :--- |
| **Draft / Pending** | Dokumen baru dibuat, belum dikirim, atau menunggu antrean | `bg-slate-100 text-slate-800 border-slate-200` |
| **Active / In Review** | Sedang dalam proses review, penilaian, atau pengerjaan aktif | `bg-amber-50 text-amber-800 border-amber-200` |
| **Accepted / Published** | Disetujui, lolos administrasi, atau diterbitkan ke publik | `bg-emerald-50 text-emerald-800 border-emerald-200` |
| **Rejected / Declined** | Ditolak, dibatalkan, atau dicabut hak aksesnya | `bg-rose-50 text-rose-800 border-rose-200` |

---

## 4. Pola Coding React & Inertia (Code Standards)

### A. TypeScript Interface untuk Props
Setiap file `.tsx` di dalam folder `resources/js/pages/` wajib mencantumkan type/interface TypeScript yang presisi. Jangan menggunakan type `any`.

```typescript
import { PageProps } from '@/types';

export interface Proposal {
    id: number;
    judul_penelitian: string;
    abstrak: string;
    status_proposal: 'Draft' | 'Submitted' | 'Administrasi_Valid' | 'Ditolak';
    tanggal_pengajuan: string;
}

export interface Props extends PageProps {
    proposals: Proposal[];
    flash?: {
        success?: string;
        error?: string;
    };
}
```

### B. Pengelolaan Form & Validasi (Inertia `useForm`)
Semua pengiriman formulir (*submit form*) ke backend wajib menggunakan helper `useForm` dari `@inertiajs/react` untuk menangani status loading, asinkronus, dan validasi secara otomatis.

*Aturan Form:*
1.  Tombol submit wajib memiliki atribut `disabled={processing}` dan menampilkan feedback visual saat loading.
2.  Tampilkan pesan error validasi di bawah setiap input menggunakan komponen `<InputError />`.

```tsx
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

export function CreateProposalForm() {
    const { data, setData, post, processing, errors, reset } = useForm({
        judul_penelitian: '',
        abstrak: '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('proposal.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="judul">Judul Penelitian</Label>
                <Input
                    id="judul"
                    value={data.judul_penelitian}
                    onChange={e => setData('judul_penelitian', e.target.value)}
                    placeholder="Masukkan judul lengkap..."
                />
                <InputError message={errors.judul_penelitian} />
            </div>

            <Button type="submit" disabled={processing} className="w-full">
                {processing ? 'Mengirim Proposal...' : 'Kirim Proposal'}
            </Button>
        </form>
    );
}
```

### C. Toast Feedback & Notifikasi
*   Sistem telah terintegrasi dengan **Sonner**. Flash message dari controller Laravel akan otomatis dipicu oleh komponen global `<FlashToast />`.
*   Jika Anda perlu memicu notifikasi toast secara manual di sisi client, gunakan:
    ```typescript
    import { toast } from 'sonner';

    toast.success('Data berhasil disimpan!');
    toast.error('Gagal mengunggah berkas.');
    ```

### D. Penggunaan Ikon Lucide
Gunakan pustaka ikon `lucide-react` secara seragam untuk menjaga konsistensi ukuran visual:
*   Ikon di dalam tombol atau menu sebaris: `className="mr-2 h-4 w-4"` atau `className="h-4 w-4"`.
*   Ikon di dalam tajuk card atau navigasi besar: `className="h-5 w-5"`.

---

## 5. Larangan Utama dalam Pengembangan View
*   ❌ **Dilarang keras meletakkan query Eloquent / database** di dalam file React (`.tsx`). Seluruh pengolahan data harus diselesaikan di Controller Laravel dan dikirim dalam bentuk props yang siap saji.
*   ❌ **Dilarang keras melakukan fetch data manual menggunakan `axios.get` atau `fetch()`** untuk memuat data halaman utama. Gunakan metode bawaan Inertia.js (`router.get` atau request props dari controller).
*   ❌ **Dilarang mengubah atau memodifikasi file layout global (`app-layout.tsx` dsb)** tanpa koordinasi lintas kelas. Jika membutuhkan menu sidebar baru, tambahkan rute Anda di `resources/js/components/app-sidebar.tsx` sesuai dengan *grup peran* Anda.
