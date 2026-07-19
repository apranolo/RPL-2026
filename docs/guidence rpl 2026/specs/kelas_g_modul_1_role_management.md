# Spesifikasi Desain View: Modul 1 — Manajemen Peran & Profil Pengguna

## Kelas G — Tab 1: Role Management (OJS-based)

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (_view_) dan komponen di Modul 1 Kelas G.

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path                                      | Penanggung Jawab      | Deskripsi Singkat Tugas                                                                     |
| :---------------------- | :----------------------------------------------- | :-------------------- | :------------------------------------------------------------------------------------------ |
| `Index.tsx`             | `resources/js/pages/Admin/Users/Index.tsx`       | ALTAV ELFAZELL        | Tabel manajemen pengguna, menampilkan data peran per jurnal, dan integrasi tombol aksi.     |
| `InviteRole.tsx`        | `resources/js/pages/Admin/Users/InviteRole.tsx`  | FADLI HAFIZH SIDIQ    | Form asinkronus pencarian email pengguna untuk dikirimi undangan peran baru.                |
| `RoleBadge.tsx`         | `resources/js/components/RoleBadge.tsx`          | FADLI HAFIZH SIDIQ    | Komponen stiker penanda multi-peran (misal: "Author", "Editor") di samping nama user.       |
| `AuthorProfile.tsx`     | `resources/js/pages/Profile/AuthorProfile.tsx`   | HANIF FALAH KURNIAWAN | Form profil khusus penulis, memuat data ORCID ID (validasi format), afiliasi, dan biografi. |
| `ReviewerProfile.tsx`   | `resources/js/pages/Profile/ReviewerProfile.tsx` | ADITIYA SUBAKTI       | Form profil reviewer, terintegrasi dengan input bidang keilmuan (_SkillTagInput_).          |
| `SkillTagInput.tsx`     | `resources/js/components/SkillTagInput.tsx`      | ADITIYA SUBAKTI       | Komponen input interaktif berbasis _chips/tags_ yang dapat ditambah dan dihapus (tombol X). |
| `RevokeRoleModal.tsx`   | `resources/js/components/RevokeRoleModal.tsx`    | ADITYA GAUTAMA        | Modal dialog konfirmasi pencabutan peran dengan mengetik kata kunci "CONFIRM".              |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';

// Struktur Data User Jurnal
export interface UserRole {
    id: number;
    id_user: number;
    id_journal: number | null; // Null berarti role bersifat global
    role_name: 'Author' | 'Editor' | 'SectionEditor' | 'Reviewer' | 'Copyeditor' | 'ProductionEditor' | 'Admin';
    status: 'Active' | 'Invited' | 'Declined';
    journal?: {
        name: string;
    };
}

export interface User {
    id: number;
    name: string;
    email: string;
    roles: UserRole[];
}

// 1. Props untuk Admin/Users/Index.tsx
export interface IndexProps extends PageProps {
    users: User[];
}

// 2. Props untuk Profile/AuthorProfile.tsx
export interface AuthorProfileData {
    orcid_id: string;
    affiliation: string;
    research_interests: string;
    biography: string;
}

export interface AuthorProfileProps extends PageProps {
    profile: AuthorProfileData | null;
}

// 3. Props untuk Profile/ReviewerProfile.tsx
export interface ReviewerProfileData {
    research_interests: string[]; // Disimpan sebagai array string keahlian
    biography: string;
}

export interface ReviewerProfileProps extends PageProps {
    profile: ReviewerProfileData | null;
}
```

---

## 3. Hierarki Tata Letak & Komponen (UI Layout)

Setiap pengembang halaman wajib menyelaraskan struktur tampilannya sesuai hirarki berikut:

### A. Admin User Management (`Admin/Users/Index.tsx`)

1.  **Wrapper**: Dibungkus `<AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'User Management' }]}>`.
2.  **Header Area**:
    - Judul: `Pengelola Jurnal`
    - Deskripsi: `Daftar seluruh pengguna dan peran mereka di dalam sistem JurnalMu.`
    - Kanan: Tombol `<Link href={route('admin.users.invite')}>` dengan `<Button className="bg-primary hover:bg-primary/95 text-white">` berlabel `"Undang Peran Baru"` dan ikon `UserPlus`.
3.  **Tabel Area (Data Grid)**:
    - Gunakan komponen `<Table>` shadcn/ui.
    - _Kolom Tabel_: `Nama Pengguna`, `Email`, `Peran & Jurnal`, `Status Undangan`, `Aksi`.
    - _Kolom Peran & Jurnal_: Tampilkan daftar badge menggunakan `<RoleBadge>` untuk setiap peran yang dimiliki. Jika perannya terikat jurnal tertentu, sertakan nama jurnal di bawah badge peran (misal: `"Editor - Jurnal Teknik"`).
    - _Kolom Status_: Lencana status undangan (`Active` = Hijau, `Invited` = Kuning/Amber, `Declined` = Merah/Rose).
    - _Kolom Aksi_: Tombol `<Button variant="destructive" size="sm">` dengan label `"Cabut Peran"` yang memicu dibukanya `<RevokeRoleModal>`.

### B. Form Undang Peran Baru (`Admin/Users/InviteRole.tsx`)

1.  **Wrapper**: Dibungkus `<AppLayout>` dengan lebar halaman dibatasi `max-w-xl mx-auto py-8`.
2.  **Card Container**: Form diletakkan dalam `<Card>` dengan `<CardHeader>` yang menerangkan fungsi undangan.
3.  **Form Input Fields**:
    - **Email Pengguna**: Input pencarian email. Sebaiknya menggunakan dropdown autocomplete untuk mencari email user yang sudah terdaftar di sistem. Tampilkan pesan kesalahan via `<InputError message={errors.email} />`.
    - **Pilih Peran**: Dropdown pilihan (`<Select>`) untuk jenis peran (Author, Editor, Reviewer, dll).
    - **Pilih Jurnal (Kondisional)**: Jika peran yang dipilih tidak bersifat global (seperti Editor/Reviewer), tampilkan dropdown pilihan jurnal aktif. Jika global, input ini dinonaktifkan/disembunyikan.
4.  **Action Buttons**:
    - Tombol Batal: `<Link href={route('admin.users.index')} className="text-muted-foreground mr-4">Batal</Link>`
    - Tombol Undang: `<Button type="submit" disabled={processing}>` dengan transisi loading `"Mengirim Undangan..."`.

### C. Halaman Profil Author (`Profile/AuthorProfile.tsx`)

1.  **Wrapper**: Dibungkus `<AppLayout>` di dalam struktur tab profil user.
2.  **Card Layout**: Gunakan layout formulir dua kolom pada layar lebar (`grid grid-cols-1 md:grid-cols-2 gap-6`).
3.  **Input Fields**:
    - **ORCID ID**: Input text dengan placeholder `0000-0000-0000-0000`. Wajib divalidasi regex format ORCID sebelum submit.
    - **Afiliasi**: Input text untuk instansi/universitas.
    - **Biografi Singkat (CV)**: Input bertipe `<Textarea>` dengan batas minimal kata untuk deskripsi latar belakang riset.
4.  **Actions**: Tombol primer `"Perbarui Profil Author"` di pojok kanan bawah.

### D. Halaman Profil Reviewer (`Profile/ReviewerProfile.tsx`)

1.  **Wrapper**: Serupa dengan halaman profil author.
2.  **Bidang Keilmuan / Bidang Minat**:
    - Gunakan komponen kustom `<SkillTagInput>` untuk memasukkan kata kunci bidang keahlian (misal: `"Kecerdasan Buatan"`, `"Jaringan Komputer"`).
3.  **Biografi & Portofolio**: Textarea untuk memasukkan CV/portofolio review artikel ilmiah.

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<RoleBadge roleName={...} />`

- Komponen visual kecil berbentuk pil (`rounded-full`) untuk merepresentasikan identitas peran user.
- **Warna Badge per Peran**:
    - `Admin / Super Admin`: `bg-slate-900 text-white`
    - `Editor / Section Editor`: `bg-emerald-100 text-emerald-800` (Muhammadiyah Green/Teal accent)
    - `Reviewer`: `bg-amber-100 text-amber-800` (Amber)
    - `Author`: `bg-sky-100 text-sky-800` (Blue)
    - `Copyeditor / ProductionEditor`: `bg-purple-100 text-purple-800` (Purple)

### 2. Komponen `<SkillTagInput values={tags} onChange={setTags} />`

- Kotak input yang mengubah teks yang dimasukkan menjadi tag ketika user menekan tombol `Enter` atau `,` (koma).
- Setiap tag yang terbuat harus memiliki tombol ikon silang kecil (`X` dari `lucide-react`) untuk menghapusnya secara interaktif.
- Gunakan transisi halus saat menambahkan/menghapus tag.

### 3. Komponen `<RevokeRoleModal isOpen={...} onClose={...} userRole={...} />`

- Gunakan komponen dialog `<AlertDialog>` dari shadcn.
- **Mekanisme Pengamanan**:
    - Tampilkan pesan peringatan: `"Tindakan ini akan menonaktifkan hak akses [Nama User] sebagai [Nama Peran] pada [Nama Jurnal]."`
    - Sediakan input text konfirmasi dengan label: `Ketik "CONFIRM" untuk melanjutkan pencabutan peran`.
    - Tombol submit pencabutan peran (`Button variant="destructive"`) secara default berstatus **disabled** dan hanya akan aktif jika user mengetik kata `"CONFIRM"` secara persis.

---

## 5. Alur Interaksi & Routing Inertia

- **Undangan Peran Baru (Invite)**:
    - Method: `POST` ke `/admin/users/invite`.
    - Data dikirim: `{ email, role_name, id_journal }`.
    - Redirect: Kembali ke `admin.users.index` dengan toast `"Undangan peran berhasil dikirim."`
- **Konfirmasi Revoke Peran**:
    - Method: `DELETE` ke `/admin/users/revoke/{id_user_role}`.
    - Redirect: `admin.users.index` dengan toast `"Hak akses peran berhasil dicabut."`
- **Pembaruan Profil (Update Profile)**:
    - Method: `PUT` ke `/profile/author` (Author) dan `/profile/reviewer` (Reviewer).
    - Validasi ORCID: Wajib mencocokkan pattern `^\d{4}-\d{4}-\d{4}-\d{3}[0-9X]$`. Tampilkan error visual jika format salah.
