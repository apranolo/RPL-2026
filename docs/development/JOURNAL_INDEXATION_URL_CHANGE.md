# Perubahan Fitur: Indexation Input — Tanggal → URL

**Tanggal:** 26 Februari 2026  
**Scope:** Form tambah/edit jurnal (User & Admin Kampus)  
**Status:** ✅ Deployed

---

## Latar Belakang

Field **"Indexed Date"** (`indexed_at`, bertipe `date`) pada bagian Indexations di form jurnal diganti dengan field **"URL"** (`url`, bertipe URL opsional). Perubahan ini dilakukan bersamaan dengan perbaikan bug journal creation pada tanggal yang sama.

**Alasan perubahan:**

- URL indexation (link halaman profil jurnal di Scopus, DOAJ, dll.) lebih berguna untuk verifikasi dan navigasi cepat dibandingkan tanggal terindeks.
- Tanggal terindeks sulit diisi dengan akurat oleh pengelola jurnal dan tidak digunakan di fitur lain.

---

## Perubahan Database

Tidak ada perubahan skema DB untuk fitur ini. Kolom `indexations` tetap `json`. Format penyimpanan berubah secara konvensi:

```json
// BEFORE
{
    "Scopus": { "indexed_at": "2023-06-15" },
    "DOAJ":   { "indexed_at": null }
}

// AFTER
{
    "Scopus": { "url": "https://www.scopus.com/sourceid/12345" },
    "DOAJ":   { "url": null }
}
```

> ⚠️ **Data Lama:** Jurnal yang sudah tersimpan dengan format `indexed_at` tidak termigrasi otomatis. Nilainya akan diabaikan di tampilan baru (field `url` akan `null`). Jika diperlukan migrasi data, jalankan script manual.

---

## Perubahan Backend

### `app/Http/Requests/StoreJournalRequest.php`

```php
// BEFORE
'indexations.*.indexed_at' => 'nullable|date|before_or_equal:today',

// AFTER
'indexations.*.url' => 'nullable|url|max:500',
```

Pesan validasi yang ditambahkan:

```php
'indexations.*.url.url' => 'Format URL indeksasi tidak valid.',
```

`prepareForValidation()` — transform frontend array → DB dict:

```php
// BEFORE
$transformed[$item['platform']] = ['indexed_at' => $item['indexed_at'] ?? null];

// AFTER
$transformed[$item['platform']] = ['url' => $item['url'] ?? null];
```

### `app/Http/Requests/UpdateJournalRequest.php`

Perubahan identik dengan `StoreJournalRequest`.

---

## Perubahan Frontend

### Form Create & Edit (User dan Admin Kampus)

Empat file diperbarui dengan perubahan identik:

- `resources/js/pages/User/Journals/Create.tsx`
- `resources/js/pages/User/Journals/Edit.tsx`
- `resources/js/pages/AdminKampus/Journals/Create.tsx`
- `resources/js/pages/AdminKampus/Journals/Edit.tsx`

**Type definition:**

```tsx
// BEFORE
indexations: [] as Array<{ platform: string; indexed_at: string }>;

// AFTER
indexations: [] as Array<{ platform: string; url: string }>;
```

**Saat checkbox dicentang:**

```tsx
// BEFORE
{ platform: option.value, indexed_at: '' }

// AFTER
{ platform: option.value, url: '' }
```

**Input field:**

```tsx
// BEFORE
<Label>Indexed Date</Label>
<Input
    type="date"
    value={selectedItem?.indexed_at || ''}
    max={new Date().toISOString().split('T')[0]}
    onChange={(e) => ... { ...i, indexed_at: e.target.value } ...}
/>

// AFTER
<Label>URL (opsional)</Label>
<Input
    type="url"
    value={selectedItem?.url || ''}
    placeholder={`https://example.com/journal/${option.value.toLowerCase()...}`}
    onChange={(e) => ... { ...i, url: e.target.value } ...}
/>
```

**Edit form — transform data lama:**

```tsx
// BEFORE
const existingIndexations = journal.indexations
    ? Object.entries(journal.indexations).map(([platform, data]) => ({
          platform,
          indexed_at: data.indexed_at || '',
      }))
    : [];

// AFTER
const existingIndexations = journal.indexations
    ? Object.entries(journal.indexations).map(([platform, data]) => ({
          platform,
          url: data.url || '',
      }))
    : [];
```

### `resources/js/pages/User/Journals/Show.tsx`

Type interface Journal diupdate:

```tsx
// BEFORE
indexations: Record<string, { indexed_at: string }> | null;

// AFTER
indexations: Record<string, { url: string }> | null;
```

Prop ke `IndexationBadge` diupdate:

```tsx
// BEFORE
<IndexationBadge platform={platform} indexed_date={data.indexed_at} />

// AFTER
<IndexationBadge platform={platform} url={data.url} />
```

### `resources/js/components/badges/IndexationBadge.tsx`

Prop `url` ditambahkan. Prop lama `indexed_date` tetap ada (backward-compatible untuk tampilan Admin & dashboard):

```tsx
interface IndexationBadgeProps {
    platform: string;
    /** @deprecated Use url instead */
    indexed_date?: string | null;
    url?: string | null;
    showDate?: boolean;
    variant?: 'default' | 'outline';
}
```

Jika `url` ada, badge menampilkan link "Lihat halaman":

```tsx
{
    url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="max-w-[160px] truncate text-xs text-blue-500 hover:underline">
            Lihat halaman
        </a>
    );
}
```

---

## UI/UX — Tampilan Form

**Sebelum:**

```
☑ Scopus
   Indexed Date: [    date picker    ]
```

**Sesudah:**

```
☑ Scopus
   URL (opsional): [https://example.com/journal/scopus]
```

- Input URL tidak wajib diisi — platform tetap dapat dicentang tanpa mengisi URL
- Placeholder menunjukkan contoh URL berdasarkan nama platform
- `type="url"` memberikan validasi format URL di browser level

---

## Checklist Deployment

- [x] Migration dijalankan (`php artisan migrate`)
- [x] Backend request validation diupdate
- [x] Frontend form User (Create & Edit) diupdate
- [x] Frontend form AdminKampus (Create & Edit) diupdate
- [x] Show page User diupdate
- [x] IndexationBadge component diupdate
- [x] Feature tests ditulis dan lulus (16/16 tests pass)
