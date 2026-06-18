# Spesifikasi Desain View: Modul 7 — Notifikasi, Komunikasi & Diskusi Internal
## Kelas G — Tab 7: Notifikasi & Komunikasi

Dokumen ini berisi spesifikasi visual, tata letak, antarmuka TypeScript, dan alur interaksi untuk pembuat halaman (*view*) dan komponen di Modul 7 Kelas G (Notification, Announcement, and Audit Trail Workflow).

---

## 1. Daftar Tugas & Penanggung Jawab

| File Halaman / Komponen | Target Path | Penanggung Jawab | Deskripsi Singkat Tugas |
| :--- | :--- | :--- | :--- |
| `NotificationBell.tsx` | `resources/js/components/NotificationBell.tsx` | RYAN ANANDA DJAWA | Widget bel di navbar atas: menampilkan jumlah notifikasi belum dibaca & pop-over dropdown list. |
| `Index.tsx` | `resources/js/pages/Notifications/Index.tsx` | SALSABILA NURLAILI | Halaman sentral untuk meninjau seluruh riwayat notifikasi *in-app* milik pengguna. |
| `Index.tsx` | `resources/js/pages/Admin/EmailTemplate/Index.tsx` | CARESS SUCHI D. | Halaman utama daftar cetak biru template email sistem yang dapat dikonfigurasi. |
| `Edit.tsx` | `resources/js/pages/Admin/EmailTemplate/Edit.tsx` | SALSABILA NURLAILI | Formulir editor visual pesan email menggunakan editor teks kaya (*Rich Text Editor*). |
| `Index.tsx` | `resources/js/pages/Admin/Announcement/Index.tsx` | ABHIRAMA B. V. R. | Halaman dashboard kelola warta pengumuman jurnal (CRUD) bagi administrator. |
| `Form.tsx` | `resources/js/pages/Admin/Announcement/Form.tsx` | ABHIRAMA B. V. R. | Formulir buat & ubah pengumuman dengan penyetelan tanggal kedaluwarsa. |
| `ActivityLog.tsx` | `resources/js/pages/Editorial/ActivityLog.tsx` | REGIANA HERMAWAN | Halaman *Audit Trail* / log rekam jejak aktivitas pengubahan data submission per naskah. |
| `ActivityLogTimeline.tsx` | `resources/js/components/ActivityLogTimeline.tsx` | REGIANA HERMAWAN | Komponen visual linimasa vertikal pelacak CCTV aktivitas naskah dari A sampai Z. |

---

## 2. Struktur Data & Interface TypeScript (`Props`)

Semua mahasiswa wajib mengimpor dan mengimplementasikan interface berikut pada halaman masing-masing untuk mencegah ketidakcocokan tipe data.

```typescript
import { PageProps } from '@/types';

// Struktur Data Notifikasi In-App
export interface Notification {
    id: string;
    id_user: number;
    title: string;
    message: string;
    url: string | null; // URL pengalihan saat diklik
    read_at: string | null; // Null berarti belum dibaca
    created_at: string;
}

// Struktur Data Template Email
export interface EmailTemplate {
    id: number;
    id_journal: number | null;
    event_trigger: string; // Misal: "submission.created"
    subject: string;
    body_content: string; // Teks kaya (HTML)
    variables: string[]; // Variabel penolong, misal: ["{author_name}", "{article_title}"]
}

// Struktur Data Warta/Pengumuman
export interface Announcement {
    id: number;
    id_journal: number;
    title: string;
    content: string;
    expiry_date: string | null; // Null berarti tampil selamanya
    created_at: string;
}

// Struktur Data Log Aktivitas (Audit Trail)
export interface ActivityLog {
    id: number;
    id_submission: number;
    id_user: number;
    user_name: string;
    action_type: string; // Misal: "Status Updated", "File Uploaded"
    activity_description: string;
    created_at: string;
}

// 1. Props untuk Notifications/Index.tsx
export interface NotificationIndexProps extends PageProps {
    notifications: Notification[];
}

// 2. Props untuk Admin/EmailTemplate/Index.tsx
export interface EmailTemplateIndexProps extends PageProps {
    templates: EmailTemplate[];
}

// 3. Props untuk Editorial/ActivityLog.tsx
export interface ActivityLogProps extends PageProps {
    logs: ActivityLog[];
}
```

---

## 3. Tata Letak Halaman & Navigasi (UI Layouts)

### A. Pusat Ikon Lonceng Notifikasi (`NotificationBell.tsx`)
*   **Posisi**: Diletakkan pada baris menu navigasi atas (*Header/Navbar*).
*   **Komponen**: Menggunakan `<Popover>` atau `<DropdownMenu>`.
    *   Tampilkan ikon `Bell` (`w-5 h-5`) dengan bulatan angka indikator merah di atasnya (jumlah *unread notification*).
    *   *Konten Dropdown*: Menampilkan **5 riwayat notifikasi terbaru** yang belum dibaca. Jika kosong, tampilkan pesan informatif.
    *   *Footer Dropdown*: Tautan `"Lihat Semua Notifikasi"` (mengarahkan ke `/notifications`) dan tombol aksi cepat `"Tandai Semua Dibaca"`.

### B. Halaman Semua Notifikasi (`Notifications/Index.tsx`)
1.  **Wrapper**: Lebar dibatasi `max-w-3xl mx-auto py-8`.
2.  **Header**: Judul Halaman `"Kotak Masuk Notifikasi"` dan tombol `"Tandai Semua Telah Dibaca"` (mengirim request put).
3.  **Tabel/Daftar List**:
    *   Tampilkan deretan list notifikasi dengan pembagian gaya visual yang jelas antara yang **Belum Dibaca** (latar belakang putih bersih/biru redup) dan **Sudah Dibaca** (berlatar abu-abu redup/sedikit pudar).
    *   Setiap baris dapat diklik untuk mengarahkan pengguna ke halaman tugas terkait (misal: penugasan review).

### C. Editor Template Email (`Admin/EmailTemplate/Edit.tsx`)
Halaman ini menggunakan layout dua panel berdampingan:
1.  **Panel Kiri (Lebar: 65% - Editor Area)**:
    *   Form input `Subject Email` dan area editor pesan utama (`body_content`) menggunakan **Rich Text Editor (WYSIWYG)** agar admin dapat merancang diksi persuratan robot secara mudah.
2.  **Panel Kanan (Lebar: 35% - Token/Variabel Helper)**:
    *   Kotak panduan token variabel otomatis yang didukung template email tersebut.
    *   *Contoh*: Menampilkan list token `{author_name}`, `{article_title}`, `{editor_name}`. Setiap kali token diklik, salin token tersebut ke papan klip komputer atau langsung masukkan ke posisi kursor editor.

### D. Linimasa Audit Trail (`Editorial/ActivityLog.tsx` & `<ActivityLogTimeline>`)
1.  **Wrapper**: Dibungkus dalam `<AppLayout>` pada panel keredaksian naskah.
2.  **Visual Timeline (`<ActivityLogTimeline>`)**:
    *   Rangkaian pelacakan vertikal menyerupai CCTV yang mencatat alur manuskrip dari hari pertama diunggah hingga status terbit atau ditolak.
    *   Setiap aksi dilengkapi dengan ikon representatif (misal: ikon `Upload` untuk unggah file, ikon `CheckCircle` untuk keputusan accept).

---

## 4. Spesifikasi Komponen Kustom (Custom Components)

### 1. Komponen `<NotificationBell />`
*   Gunakan dropdown pop-over asinkron.
*   Setiap baris notifikasi memiliki tautan pengalihan. Klik pada baris notifikasi otomatis memicu fungsi `markRead()` secara latar belakang sebelum memindahkan rute halaman (*route redirection*).

### 2. Komponen `<ActivityLogTimeline logs={logs} />`
*   Garis vertikal tipis abu-abu di tengah-kiri.
*   Bulatan ikon aksi di sepanjang garis:
    *   `Submission Created`: Ikon `FilePlus` warna biru.
    *   `Decision Issued`: Ikon `ShieldAlert` atau `CheckCircle` warna hijau/merah.
    *   `Message Posted`: Ikon `MessageSquare` warna kuning.
*   Tampilkan nama aktor (user) pelaku perubahan, tanggal/jam detail, dan deskripsi perubahan yang dilakukan secara kronologis (terbaru di atas).

---

## 5. Alur Interaksi & Routing Inertia

*   **Tandai Dibaca (Mark Read)**:
    *   Single: `PATCH` ke `/notifications/{id}/read` (dilakukan saat notifikasi diklik).
    *   All: `POST` ke `/notifications/mark-all-read`.
*   **Pembaruan Template Email**:
    *   Method: `PUT` ke `/admin/email-templates/{id}`.
    *   Validasi: Validasi input data kaya dan penyesuaian token variabel.
*   **Pembuatan Pengumuman Baru (Announcement)**:
    *   Method: `POST` ke `/admin/announcements/store`.
    *   Validasi: Mengharuskan tanggal kadaluarsa (`expiry_date`) bernilai di masa mendatang (tidak boleh masa lampau).
