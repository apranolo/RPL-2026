# Journal Create Form — Bug Fix & Enhancement

**Tanggal:** 7 Maret 2026  
**Status:** ✅ Selesai  
**Laporan Awal:** User submit jurnal baru berhasil diisi namun tidak tersimpan — di-redirect kembali ke form dan harus mengisi ulang dari awal.

---

## Root Cause Analysis

Investigasi menemukan 5 issue yang menyebabkan atau memperparah masalah:

| #   | Lokasi                            | Masalah                                                                                                                                                                                          | Severity |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 1   | `StoreJournalRequest`             | `accreditation_sk_date` validasi `before_or_equal:today` menggunakan UTC, menolak tanggal hari ini untuk user di timezone Asia/Jakarta (UTC+7)                                                   | High     |
| 2   | `User/JournalController@store`    | User tanpa `university_id` di-redirect `back()->withErrors(['university_id' => ...])` — field ini tidak ada di form sehingga error tidak tampil; user hanya melihat form kosong tanpa penjelasan | High     |
| 3   | `StoreJournalRequest`             | `accreditation_end_year` pakai rule `gte:accreditation_start_year` tanpa cek apakah `accreditation_start_year` diisi — jika start year null, `gte:null` berperilaku tidak terduga                | Medium   |
| 4   | `Create.tsx` (User & AdminKampus) | `post()` tidak menyertakan `preserveState: true` — saat Laravel redirect back dengan validation errors, Inertia melakukan full page navigation dan **mereset semua field** ke nilai awal         | High     |
| 5   | Semua halaman                     | Flash messages (`success`/`error`) dari controller tidak ditampilkan — `<Toaster />` sudah di-mount di layout tapi tidak ada yang menghubungkan ke Inertia shared props                          | Medium   |

---

## Perubahan yang Diimplementasikan

### 1. Fix Validasi `StoreJournalRequest`

**File:** [`app/Http/Requests/StoreJournalRequest.php`](../../app/Http/Requests/StoreJournalRequest.php)

**Sebelum:**

```php
'accreditation_end_year' => 'nullable|integer|min:1900|max:...|gte:accreditation_start_year',
'accreditation_sk_date'  => 'nullable|date|before_or_equal:today',
```

**Sesudah:**

```php
'accreditation_end_year' => array_filter([
    'nullable', 'integer', 'min:1900', 'max:...',
    // Hanya enforce gte jika start year diisi (mencegah gte:null edge case)
    $this->filled('accreditation_start_year') ? 'gte:accreditation_start_year' : null,
]),
// Gunakan timezone app (Asia/Jakarta) bukan UTC default Laravel/PHP
'accreditation_sk_date' => 'nullable|date|before_or_equal:'.now()->timezone(config('app.timezone'))->format('Y-m-d'),
```

---

### 2. Fix Error `university_id` di User Controller

**File:** [`app/Http/Controllers/User/JournalController.php`](../../app/Http/Controllers/User/JournalController.php)

**Sebelum:**

```php
return back()->withErrors(['university_id' => 'Anda belum terdaftar...']);
// Error masuk ke $errors['university_id'] — field ini tidak ada di form → tidak terlihat user
```

**Sesudah:**

```php
return back()->with('error', 'Anda belum terdaftar di kampus manapun. Hubungi Admin Kampus...');
// Error masuk ke flash.error → ditampilkan sebagai toast via FlashToast component
```

---

### 3. Global Flash Toast via Sonner

**File baru:** [`resources/js/components/FlashToast.tsx`](../../resources/js/components/FlashToast.tsx)

Komponen baru yang mendengarkan Inertia shared props `flash.success` dan `flash.error`, kemudian memicu Sonner toast secara otomatis pada setiap halaman tanpa perlu wiring manual per-page.

```tsx
export function FlashToast() {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success, { duration: 4000 });
    }, [flash?.success]);

    useEffect(() => {
        if (flash?.error) toast.error(flash.error, { duration: 6000 });
    }, [flash?.error]);

    return null;
}
```

**File diubah:** [`resources/js/layouts/app-layout.tsx`](../../resources/js/layouts/app-layout.tsx)

`<FlashToast />` dipasang di dalam layout global sehingga berlaku di seluruh aplikasi.

---

### 4. Form Persistence (Tidak Perlu Isi Ulang)

**File diubah:**

- [`resources/js/pages/User/Journals/Create.tsx`](../../resources/js/pages/User/Journals/Create.tsx)
- [`resources/js/pages/AdminKampus/Journals/Create.tsx`](../../resources/js/pages/AdminKampus/Journals/Create.tsx)

**Sebelum:**

```tsx
post(route('user.journals.store'), { forceFormData: true });
```

**Sesudah:**

```tsx
post(route('user.journals.store'), {
    forceFormData: true,
    preserveState: true, // Semua field yang sudah diisi tetap ada saat ada error
    preserveScroll: false, // Scroll ke atas agar error summary terlihat
});
```

> **Catatan:** Field `cover_image` (tipe `File`) tidak bisa di-persist oleh browser karena keterbatasan security model browser. Saat ada validation error, user perlu memilih ulang file cover. UI sudah menampilkan peringatan ini.

---

### 5. Validation Error Summary di Form

**File diubah:**

- [`resources/js/pages/User/Journals/Create.tsx`](../../resources/js/pages/User/Journals/Create.tsx)
- [`resources/js/pages/AdminKampus/Journals/Create.tsx`](../../resources/js/pages/AdminKampus/Journals/Create.tsx)

Ditambahkan blok `<Alert variant="destructive">` di atas form yang:

- Muncul otomatis saat ada validation error setelah submit
- Menampilkan **seluruh pesan error sekaligus** dalam daftar
- Auto-scroll ke posisi blok ini via `useRef` + `scrollIntoView` sehingga user langsung melihat apa yang salah tanpa perlu scroll manual mencari field yang merah

```tsx
const errorSummaryRef = useRef<HTMLDivElement>(null);
const hasErrors = Object.keys(errors).length > 0;

useEffect(() => {
    if (hasErrors && errorSummaryRef.current) {
        errorSummaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}, [hasErrors]);
```

---

### 6. Cleanup Inline Flash — Halaman Lain

Sebelum terdapat implementasi flash manual yang tersebar di beberapa halaman menggunakan green/red div inline. Semua dihapus dan digantikan oleh `FlashToast` global.

| File                                                                                                         | Yang Dihapus                                                               |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [`resources/js/pages/AdminKampus/Journals/Show.tsx`](../../resources/js/pages/AdminKampus/Journals/Show.tsx) | Inline green/red div + `usePage` import                                    |
| [`resources/js/pages/User/Assessments/Show.tsx`](../../resources/js/pages/User/Assessments/Show.tsx)         | Inline green div + `usePage` + `FlashProps` interface                      |
| [`resources/js/pages/User/Assessments/Index.tsx`](../../resources/js/pages/User/Assessments/Index.tsx)       | Inline green div + `usePage` + `FlashProps` interface                      |
| [`resources/js/pages/User/Assessments/Create.tsx`](../../resources/js/pages/User/Assessments/Create.tsx)     | Inline red div + `usePage` + `AlertCircle` import + `FlashProps` interface |

---

## Daftar File yang Diubah

| File                                                 | Status    | Keterangan                                               |
| ---------------------------------------------------- | --------- | -------------------------------------------------------- |
| `app/Http/Requests/StoreJournalRequest.php`          | 📝 Diubah | Fix timezone date validation + gte null edge case        |
| `app/Http/Controllers/User/JournalController.php`    | 📝 Diubah | Gunakan flash error bukan withErrors untuk university_id |
| `resources/js/components/FlashToast.tsx`             | ✨ Baru   | Global Sonner toast dari Inertia flash props             |
| `resources/js/layouts/app-layout.tsx`                | 📝 Diubah | Mount FlashToast di layout global                        |
| `resources/js/pages/User/Journals/Create.tsx`        | 📝 Diubah | preserveState, error summary, cover re-upload note       |
| `resources/js/pages/AdminKampus/Journals/Create.tsx` | 📝 Diubah | preserveState, error summary, cover re-upload note       |
| `resources/js/pages/AdminKampus/Journals/Show.tsx`   | 📝 Diubah | Hapus inline flash, hapus unused usePage                 |
| `resources/js/pages/User/Assessments/Show.tsx`       | 📝 Diubah | Hapus inline flash, hapus unused usePage                 |
| `resources/js/pages/User/Assessments/Index.tsx`      | 📝 Diubah | Hapus inline flash, hapus unused usePage                 |
| `resources/js/pages/User/Assessments/Create.tsx`     | 📝 Diubah | Hapus inline flash, hapus usePage + AlertCircle          |

---

## Panduan Testing

### Skenario 1 — Validasi Error dengan Form Persistence

1. Login sebagai User role
2. Buka **My Journals → Create**
3. Isi sebagian field (misal: title, e_issn, url) tapi biarkan `frequency` kosong
4. Klik **Save Journal**
5. ✅ Halaman di-scroll ke atas, muncul error summary merah berisi daftar field yang gagal
6. ✅ Semua field yang sudah diisi **masih terisi** (tidak ter-reset)
7. ✅ Tidak ada toast error (hanya error summary di form)

### Skenario 2 — User Tanpa University

1. Login sebagai User role yang belum di-assign ke universitas
2. Buka **My Journals → Create** dan isi form lengkap
3. Klik **Save Journal**
4. ✅ Muncul **toast error** Sonner di sudut kanan atas dengan pesan "Anda belum terdaftar di kampus manapun..."
5. ✅ Error ini sebelumnya tidak muncul sama sekali → user hanya melihat form kosong

### Skenario 3 — Tanggal SK Hari Ini (Timezone Fix)

1. Isi form dengan `sinta_rank` selain `non_sinta`
2. Isi `accreditation_sk_date` = hari ini (tanggal lokal)
3. ✅ Form berhasil disimpan (tidak ditolak karena UTC vs WIB mismatch)

### Skenario 4 — Submit Berhasil

1. Isi semua field wajib dengan benar
2. Klik **Save Journal**
3. ✅ Redirect ke halaman index jurnal
4. ✅ Muncul **toast success** "Jurnal berhasil ditambahkan."

### Skenario 5 — Flash Toast Global

1. Lakukan aksi apapun yang menghasilkan `with('success', ...)` dari controller
2. ✅ Toast Sonner muncul otomatis di sudut kanan atas
3. ✅ Tidak perlu ada inline flash div di halaman tersebut

---

## Referensi

- [Inertia.js `preserveState`](https://inertiajs.com/manual-visits#state-preservation)
- [Sonner Toast Library](https://sonner.emilkowal.ski/)
- [Laravel Timezone Configuration](https://laravel.com/docs/configuration#timezone)
- [Laravel `before_or_equal` Validation Rule](https://laravel.com/docs/validation#rule-before-or-equal)
