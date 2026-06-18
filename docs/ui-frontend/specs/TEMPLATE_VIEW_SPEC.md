# Spesifikasi Desain View: [Nama Modul]
## [Kelas B / Kelas G] — Tab [Nomor Tab]: [Nama Tab]

Dokumen ini berisi spesifikasi visual, tata letak, tipe data, dan alur interaksi untuk membantu mahasiswa menyelesaikan tugas pembuatan halaman (*view*) pada modul **[Nama Modul]**.

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path | Penanggung Jawab | Deskripsi Singkat Tugas |
| :--- | :--- | :--- | :--- |
| `Index.tsx` | `resources/js/pages/[Folder]/Index.tsx` | [Nama Mahasiswa] | Menampilkan daftar data utama dengan filter |
| `Show.tsx` | `resources/js/pages/[Folder]/Show.tsx` | [Nama Mahasiswa] | Menampilkan detail data, riwayat, dan tombol aksi |
| `Create.tsx` | `resources/js/pages/[Folder]/Create.tsx` | [Nama Mahasiswa] | Form pengisian data baru menggunakan useForm |
| `Edit.tsx` | `resources/js/pages/[Folder]/Edit.tsx` | [Nama Mahasiswa] | Form pengubahan data yang sudah ada |
| `[CustomComponent].tsx` | `resources/js/components/[Folder]/[Name].tsx` | [Nama Mahasiswa] | Komponen pendukung khusus (misal: modal/tabel) |

---

## 2. Struktur Data Halaman (Inertia Props & TypeScript)

Mahasiswa wajib mengimplementasikan interface Props berikut agar sesuai dengan data yang dikirim dari controller:

```typescript
import { PageProps } from '@/types';

// 1. Tipe data entitas utama
export interface [NamaEntitas] {
    id: number;
    // ... field database relevan
    created_at: string;
}

// 2. Props Halaman Utama (Index.tsx)
export interface IndexProps extends PageProps {
    dataList: [NamaEntitas][];
}

// 3. Props Halaman Detail (Show.tsx)
export interface ShowProps extends PageProps {
    detailData: [NamaEntitas];
}
```

---

## 3. Hierarki Tata Letak & Komponen (UI Layout & Wireframe)

Bagian ini mendeskripsikan secara tekstual susunan elemen visual dari atas ke bawah untuk membantu mahasiswa membayangkan antarmuka halaman tanpa wireframe grafis.

### A. Halaman Utama (`Index.tsx`)
1.  **Wrapper**: Dibungkus `<AppLayout breadcrumbs={...}>`
2.  **Header Area**:
    *   Judul Halaman: `font-extrabold text-3xl`
    *   Deskripsi: `text-sm text-muted-foreground`
    *   Sisi Kanan: Tombol aksi utama (misal: "Tambah Baru") berwarna `bg-primary` dengan ikon `Plus` (`w-4 h-4 mr-2`).
3.  **Filter Area**:
    *   Input pencarian (*Search Bar*) di sebelah kiri.
    *   Dropdown penyaring (*Select Filter*) untuk kategori/status di sebelah kanan.
4.  **Content Grid / Table**:
    *   Gunakan komponen `Table` dari shadcn/ui.
    *   Kolom tabel: `[Kolom 1, Kolom 2, Kolom 3, Status, Aksi]`.
    *   Badge Status: Sesuaikan dengan skema warna status di Panduan UI/UX Global.
    *   Kolom Aksi: Tombol icon-only `Eye` (Detail) dan `Pencil` (Edit) menggunakan style Ghost/Outline Button.

### B. Halaman Form (`Create.tsx` / `Edit.tsx`)
1.  **Wrapper**: Dibungkus `<AppLayout>` dengan lebar konten dibatasi `max-w-2xl mx-auto` agar form tidak terlalu lebar.
2.  **Card Container**: Konten form dibungkus di dalam komponen `<Card>` dan `<CardContent>`.
3.  **Form Fields**:
    *   Setiap input dibungkus `<div className="space-y-2">` dengan `<Label>` di atasnya dan `<Input>` di bawahnya.
    *   Sertakan komponen `<InputError message={errors.[fieldName]} />` di bawah input.
4.  **Form Actions**:
    *   Tombol "Batal" (Outline Button, mengarah kembali ke index).
    *   Tombol "Simpan" (Primary Button, disabled ketika `processing`).

---

## 4. Alur Interaksi & Aksi Inertia (Actions & Routing)

*   **Pemuatan Halaman**: Di-render melalui Controller method `[NamaController]@[NamaMethod]`.
*   **Pengiriman Form**: Menggunakan method `post` atau `put` dari helper `useForm` ke rute `route('[nama.route]')`.
*   **Efek Sukses**: Setelah data tersimpan, backend akan redirect kembali ke halaman Index dan menampilkan pesan sukses otomatis via toast.
