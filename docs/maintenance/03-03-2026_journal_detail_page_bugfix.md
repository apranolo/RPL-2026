# Bug Report: Public Journal Detail Page

**Date:** 03 March 2026  
**File Affected:** `resources/js/pages/Journals/Show.tsx`  
**Reporter:** Code Review / Supervisor Feedback  
**Status:** ✅ All Fixed

---

## Summary

Terdapat 7 bug yang ditemukan pada halaman publik detail jurnal (`GET /journals/{journal}`), terdiri dari 4 bug fungsional kritis dan 3 kekurangan UI/UX. Semua telah diperbaiki dalam satu sesi pada tanggal yang sama.

---

## Bug #1 — "Filter By Issues" Double Router Call

**Severity:** 🔴 Critical  
**Type:** Functional Bug

### Deskripsi

Saat pengguna mengklik salah satu item di sidebar "Filter By Issues", fungsi `handleFilter()` dipanggil **dua kali secara berurutan** — sekali untuk `volume` dan sekali untuk `issue`. Dua pemanggilan `router.get()` terpisah dikirim secara berurutan, menyebabkan request kedua tidak membawa parameter dari request pertama sehingga filter volume tidak pernah ikut terbawa.

### Root Cause

```tsx
// BEFORE (buggy) — dua router.get() terpisah
onClick={() => {
    handleFilter('volume', item.volume);  // router.get() #1
    handleFilter('issue', item.issue);    // router.get() #2 — override #1
}}
```

### Fix

```tsx
// AFTER — satu router.get() tunggal
onClick={() => {
    router.get(
        route('journals.show', journal.id),
        { ...queries, volume: item.volume, issue: item.issue, page: 1 },
        { preserveScroll: true, preserveState: true },
    );
}}
```

---

## Bug #2 — Tombol "Filter" pada Filter By Year Tidak Berfungsi

**Severity:** 🔴 Critical  
**Type:** Functional Bug

### Deskripsi

Tombol "Filter" pada sidebar "Filter by Year" menggunakan `window.location.reload()` alih-alih mengirimkan nilai input tahun ke server. Akibatnya, filter tahun **tidak pernah benar-benar diaplikasikan** — halaman hanya di-reload tanpa query parameter apapun.

### Root Cause

```tsx
// BEFORE (buggy) — reload tanpa membawa nilai input
<Button onClick={() => window.location.reload()}>Filter</Button>
```

Input field menggunakan `defaultValue` + `onBlur` yang mengirim request saat blur, bukan saat tombol diklik. Tombol Filter dan input field tidak terhubung satu sama lain.

### Fix

Ditambahkan state lokal `yearFrom` dan `yearTo` yang dikontrol via `onChange`. Tombol Filter membaca kedua state tersebut dan mengirimkan `router.get()` dengan query parameter yang benar.

```tsx
const [yearFrom, setYearFrom] = useState<string>(queries.year_start || '');
const [yearTo, setYearTo] = useState<string>(queries.year_end || '');

// Tombol Filter
onClick={() => {
    const newQ = { ...queries, page: 1 };
    if (yearFrom) newQ.year_start = yearFrom; else delete newQ.year_start;
    if (yearTo) newQ.year_end = yearTo; else delete newQ.year_end;
    router.get(route('journals.show', journal.id), newQ, { preserveScroll: true, preserveState: true });
}}
```

---

## Bug #3 — Year Range Filter Hardcoded

**Severity:** 🟡 Minor  
**Type:** UI/UX Bug

### Deskripsi

Label rentang tahun pada sidebar "Filter by Year" menampilkan nilai statis `2020` dan `2026` tanpa memperhatikan data aktual artikel yang tersedia di jurnal tersebut. Hal ini menyesatkan pengguna, terutama untuk jurnal yang terbit sebelum 2020 atau setelah 2026.

### Root Cause

```tsx
// BEFORE (hardcoded)
<span>2020</span>
<span>2026</span>
```

### Fix

```tsx
const minYear =
    articlesByYear.length > 0 ? Math.min(...articlesByYear.map((d) => d.year)) : (journal.first_published_year ?? new Date().getFullYear() - 5);
const maxYear = articlesByYear.length > 0 ? Math.max(...articlesByYear.map((d) => d.year)) : new Date().getFullYear();
```

---

## Bug #4 — Judul Artikel Selalu Link ke `#`

**Severity:** 🔴 Critical  
**Type:** Functional Bug

### Deskripsi

Judul setiap artikel di-render sebagai `<Link href="#">` sehingga tidak dapat diklik untuk mengunjungi halaman artikel aslinya, meskipun data `article.article_url` tersedia di prop.

### Root Cause

```tsx
// BEFORE (buggy) — hardcoded href="#"
<Link href="#" className="...">
    {article.title}
</Link>
```

### Fix

```tsx
// AFTER — conditional rendering berdasarkan ketersediaan article_url
{
    article.article_url ? (
        <a href={article.article_url} target="_blank" rel="noopener noreferrer" className="...">
            {article.title}
        </a>
    ) : (
        <span className="...">{article.title}</span>
    );
}
```

---

## Bug #5 — "0 Documents" Selalu Ditampilkan (Pagination Tidak Muncul)

**Severity:** 🔴 Critical  
**Type:** Functional Bug (Interface Mismatch)

### Deskripsi

Section "Articles" selalu menampilkan **"0 Documents"** dan **pagination tidak pernah muncul** meskipun artikel tersedia dan tidak ada error di console maupun log server.

### Root Cause

Laravel `paginate()->through()` mengembalikan data paginator sebagai **flat object** (field langsung di root), bukan nested di bawah key `meta`. Namun interface TypeScript mendefinisikannya sebagai nested `meta?: {}`:

```ts
// BEFORE (salah) — meta nested, tidak pernah ada di prop
articles: {
    data: Article[];
    links: any[];
    meta?: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}
```

Akibatnya:

- `articles.meta` selalu `undefined`
- `articles.meta?.total` selalu `undefined` → render "0 Documents"
- `articles.meta && articles.meta.last_page > 1` selalu `false` → pagination tidak muncul

### Struktur aktual dari Laravel

```json
{
  "data": [...],
  "links": [...],
  "current_page": 1,
  "last_page": 3,
  "from": 1,
  "to": 10,
  "total": 25,
  "per_page": 10
}
```

### Fix

```ts
// AFTER (benar) — flat interface sesuai output Laravel
articles: {
    data: Article[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}
```

Semua referensi `articles.meta.X` diubah ke `articles.X`.

---

## Bug #6 — Icon `Award` Tidak Tersedia di lucide-react v0.475

**Severity:** 🟡 Minor  
**Type:** Dependency Compatibility Bug

### Deskripsi

Icon `Award` yang digunakan untuk kartu "Accreditation Period" tidak ditampilkan sama sekali (render kosong) karena icon `Award` telah **dihapus dari lucide-react mulai v0.475+**. Proyek ini menggunakan `"lucide-react": "^0.475.0"`.

### Root Cause

```tsx
import { Award, ... } from 'lucide-react'; // Award tidak ada di v0.475+
```

### Fix

Diganti dengan `BadgeCheck` yang tersedia dan secara semantik sesuai untuk konteks akreditasi:

```tsx
import { BadgeCheck, ... } from 'lucide-react';

<BadgeCheck className="h-3.5 w-3.5" />
```

---

## Bug #7 — Tidak Ada Empty State untuk Artikel, Chart, dan Filter By Issues

**Severity:** 🟡 Minor  
**Type:** UI/UX Bug

### Deskripsi

Ketika jurnal tidak memiliki artikel, halaman menampilkan area kosong tanpa pesan informatif pada tiga section:

1. **List artikel** — kosong tanpa pesan
2. **Chart "Article Per Year"** — ApexCharts render kosong hanya sumbu X/Y
3. **Filter By Issues** — hanya menampilkan "All Issues" tanpa indikasi tidak ada data

### Fix

Ditambahkan empty state yang informatif dan kontekstual:

```tsx
// Chart — placeholder saat data kosong
{articlesByYear.length > 0 ? (
    <Chart ... />
) : (
    <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
        <FileText className="h-8 w-8 opacity-30" />
        <span className="text-xs">No article data yet</span>
    </div>
)}

// Artikel — dua kondisi: tidak ada artikel vs filter tidak ada hasil
{articles.data.length === 0 ? (
    <div ...>
        {queries.search || queries.year_start || ... ? (
            // Pesan: "No articles matched your filter" + tombol Clear
        ) : (
            // Pesan: "No articles available yet"
        )}
    </div>
) : (...)}

// Filter By Issues — pesan saat kosong
{issuesList.length === 0 && (
    <p className="py-4 text-center text-xs text-muted-foreground">No issues available yet.</p>
)}
```

---

## Additional Improvements

### Panel Metadata Jurnal (Feedback Pembimbing)

Ditambahkan grid kartu metadata di bawah header jurnal yang menampilkan informasi yang sebelumnya tersedia di props tapi tidak ditampilkan:

- **Frequency** — frekuensi penerbitan jurnal
- **Since** — tahun pertama terbit
- **Accreditation Period** — rentang tahun akreditasi
- **SK Number** — nomor SK akreditasi

### Pagination Info Text

Ditambahkan teks informatif di atas tombol navigasi halaman:

```
Showing 1–10 of 25 articles    Page 1 of 3
```

---

## Files Changed

| File                                   | Type of Change              |
| -------------------------------------- | --------------------------- |
| `resources/js/pages/Journals/Show.tsx` | Bug fixes + UI improvements |

---

## Testing Checklist

- [x] TypeScript `npm run types` — 0 errors
- [x] ESLint `npm run lint` — 0 warnings
- [x] Filter By Issues: klik item → URL mengandung `?volume=X&issue=Y`
- [x] Filter By Year: input tahun + klik Filter → URL mengandung `?year_start=X&year_end=Y`
- [x] Filter By Year: klik Reset → semua filter terhapus
- [x] Artikel count muncul di header section (bukan "0 Documents")
- [x] Pagination muncul saat artikel > 10
- [x] Info pagination "Showing X–Y of Z articles" muncul
- [x] Icon BadgeCheck tampil di kartu Accreditation Period
- [x] Empty state muncul saat tidak ada artikel
- [x] Chart placeholder muncul saat tidak ada data artikel
- [x] Judul artikel link ke `article_url` (external tab)
