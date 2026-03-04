# Journal Cover Upload Feature

## Overview

Fitur upload cover jurnal memungkinkan pengguna dengan role **Admin Kampus** dan **User** untuk mengunggah gambar cover pada setiap jurnal. Cover dapat diunggah saat membuat jurnal baru, memperbarui jurnal, maupun melalui endpoint khusus dari halaman detail jurnal.

---

## Batasan File

| Parameter | Nilai |
|---|---|
| Format | JPEG, JPG, PNG, WebP |
| Ukuran maksimal | 2 MB |
| Resolusi minimal | 300 × 400 px (lebar × tinggi) |
| Hapus cover | Tidak tersedia (hanya bisa diganti) |

---

## Arsitektur

### Komponen Baru

| File | Deskripsi |
|---|---|
| `app/Services/JournalCoverService.php` | Service untuk upload & hapus file cover di storage |
| `resources/js/components/JournalCoverUpload.tsx` | Komponen React untuk drag-drop upload dengan preview |
| `tests/Feature/Journal/CoverUploadTest.php` | 9 test case untuk validasi dan otorisasi |

### File yang Dimodifikasi

| File | Perubahan |
|---|---|
| `app/Http/Requests/StoreJournalRequest.php` | Menambahkan rule `cover_image` |
| `app/Http/Requests/UpdateJournalRequest.php` | Menambahkan rule `cover_image` |
| `app/Http/Controllers/AdminKampus/JournalController.php` | Integrasi service + method `uploadCover()` |
| `app/Http/Controllers/User/JournalController.php` | Integrasi service + method `uploadCover()` |
| `routes/web.php` | Menambahkan 2 route PATCH untuk cover |
| `resources/js/types/index.d.ts` | Menambahkan `cover_image?: string` pada interface `Journal` |
| `resources/js/pages/AdminKampus/Journals/Create.tsx` | Integrasi komponen upload cover |
| `resources/js/pages/AdminKampus/Journals/Edit.tsx` | Integrasi komponen upload cover |
| `resources/js/pages/AdminKampus/Journals/Show.tsx` | Tampilan cover + form upload inline |
| `resources/js/pages/User/Journals/Create.tsx` | Integrasi komponen upload cover |
| `resources/js/pages/User/Journals/Edit.tsx` | Integrasi komponen upload cover |
| `resources/js/pages/User/Journals/Show.tsx` | Tampilan cover + form upload inline |

---

## Database

**Tidak ada migrasi baru.** Kolom `cover_image` (string 255, nullable) sudah ada sejak migrasi:

```
2026_02_11_235000_simplify_accreditation_fields.php
```

Kolom yang digunakan:
- `cover_image` — path lokal ke file di storage (e.g. `/storage/journal-covers/cover_1_1700000000.jpg`)
- `cover_image_url` — URL eksternal (sudah ada sebelumnya, tetap dipertahankan)

---

## Storage

File disimpan di disk `public`:

```
storage/app/public/journal-covers/
```

URL publik (setelah `php artisan storage:link`):

```
/storage/journal-covers/cover_{journal_id}_{timestamp}.{ext}
```

Konvensi nama file: `cover_{$journal->id}_{time()}.{extension}`

---

## Routes

```
PATCH /admin-kampus/journals/{journal}/cover   → admin-kampus.journals.upload-cover
PATCH /user/journals/{journal}/cover           → user.journals.upload-cover
```

Kedua route dilindungi middleware `auth` + `role:Admin Kampus` / `role:User` sesuai grup masing-masing.

---

## Validasi

### Server-side (Laravel)

```php
'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048|dimensions:min_width=300,min_height=400'
```

Pesan error dalam Bahasa Indonesia:
- Format tidak valid → "Cover jurnal harus berupa file gambar (JPEG, PNG, atau WebP)."
- Ukuran melebihi batas → "Ukuran cover jurnal tidak boleh lebih dari 2MB."
- Resolusi terlalu kecil → "Resolusi cover jurnal minimal 300×400 piksel."

### Client-side (React)

Komponen `JournalCoverUpload` melakukan validasi sebelum file dikirim:
- Tipe MIME: `image/jpeg`, `image/png`, `image/webp`
- Ukuran: max 2MB
- Resolusi: min 300×400px via `new Image()` di browser

---

## Cara Kerja

### 1. Upload saat Create / Edit Jurnal

Form menggunakan `forceFormData: true` pada Inertia agar file dikirim sebagai `multipart/form-data`.

```tsx
// Inertia form state
const { data, setData, post, put } = useForm({
    // ... field lainnya
    cover_image: null as File | null,
});

// Submit
post(route('admin-kampus.journals.store'), { forceFormData: true });
put(route('admin-kampus.journals.update', journal.id), { forceFormData: true });
```

### 2. Upload via Endpoint Khusus (dari Show page)

```tsx
const coverForm = useForm({ cover_image: null as File | null });

function handleCoverSubmit(e: React.FormEvent) {
    e.preventDefault();
    coverForm.post(route('admin-kampus.journals.upload-cover', journal.id), {
        forceFormData: true,
        onSuccess: () => setShowCoverForm(false),
    });
}
```

### 3. JournalCoverService

```php
// Upload file baru (otomatis hapus cover lama jika ada)
$path = $this->coverService->upload($request->file('cover_image'), $journal);
$journal->update(['cover_image' => $path]);
```

---

## Menjalankan Tests

```bash
php artisan test --filter=CoverUploadTest
```

### Test Cases

| Test | Deskripsi |
|---|---|
| `admin_kampus_dapat_upload_cover_saat_buat_jurnal` | Cover ter-upload saat POST create |
| `admin_kampus_dapat_ganti_cover_saat_update_jurnal` | Cover ter-update saat PUT update |
| `admin_kampus_dapat_upload_cover_via_endpoint_khusus` | PATCH endpoint berfungsi |
| `user_dapat_upload_cover_saat_buat_jurnal` | Role User dapat upload saat create |
| `user_dapat_upload_cover_via_endpoint_khusus` | Role User dapat pakai PATCH endpoint |
| `user_tidak_bisa_upload_cover_jurnal_milik_orang_lain` | Otorisasi: User tidak bisa akses jurnal orang lain |
| `cover_ditolak_jika_ukuran_lebih_dari_2mb` | Validasi ukuran file |
| `cover_ditolak_jika_format_bukan_gambar` | Validasi tipe file |
| `jurnal_dapat_dibuat_tanpa_cover_image` | Field cover bersifat opsional |

---

## Build Frontend

Setelah perubahan frontend, jalankan:

```bash
npm run build
# atau untuk development
npm run dev
```

---

## Setup Storage (jika belum)

```bash
php artisan storage:link
```

Memastikan folder `public/storage` mengarah ke `storage/app/public`.

---

## Catatan Tambahan

- Cover lama otomatis dihapus dari storage saat cover baru diunggah (bila path dimulai dengan `/storage/`)
- Cover yang berasal dari URL eksternal (`cover_image_url`) tidak dihapus — hanya di-replace secara visual
- Komponen `JournalCoverUpload` menampilkan preview gambar sebelum dikirim ke server
- Pada halaman Show, cover lama tetap ditampilkan sebagai thumbnail yang bisa diklik untuk mengganti
