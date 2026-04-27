# OAI-PMH Reharvest — Fix Duplikat & Force Sync

**Tanggal Implementasi:** 7 Maret 2026  
**Status:** ✅ Production Ready  
**Dilaporkan oleh:** Dosen Pembimbing (saat mencoba sync ulang jurnal setelah perbaikan sebelumnya)

---

## Latar Belakang

Setelah implementasi harvest queue sebelumnya, dosen pembimbing melaporkan bahwa jurnal yang sudah disync ulang masih menampilkan error ("data jurnal ini sy sync ulang masih error"). Setelah analisis kode ditemukan **tiga akar masalah** di sistem harvesting OAI-PMH.

---

## Akar Masalah (Root Cause)

### 1. Race Condition — Penyebab Error Utama

**File:** `app/Services/OAIPMHHarvester.php` — method `processRecord()`

Pola lama yang digunakan adalah `SELECT` lalu `INSERT/UPDATE` secara terpisah (non-atomik):

```php
// KODE LAMA — BERMASALAH
$article = Article::where('oai_identifier', $oaiIdentifier)->first();

if ($article) {
    $article->update($articleData);   // UPDATE jika sudah ada
} else {
    Article::create($articleData);    // INSERT jika belum ada
}
```

**Masalah:** Jika job harvest dijalankan ulang sementara job sebelumnya belum sepenuhnya selesai (misal: uniqueness lock `ShouldBeUnique` sudah expire setelah 600 detik tapi job masih berjalan), dua job bisa:

1. Keduanya menjalankan `SELECT` → keduanya menemukan `null`
2. Keduanya mencoba `INSERT` dengan `oai_identifier` yang sama
3. MySQL melempar **unique constraint violation**
4. Job gagal, status `failed`, error tersimpan di `oai_harvesting_logs`

---

### 2. OAI Server Mengubah Format Identifier

Beberapa instalasi OJS/OAI server mengubah format `oai:identifier` antar versi atau konfigurasi (misal: dari `oai:jurnal.ac.id:article/123` menjadi `oai:jurnal.ac.id:article-123`). Karena lookup lama hanya berdasarkan `oai_identifier`, artikel yang sebenarnya sama dianggap baru → **INSERT** baru dibuat → **duplikat volume/issue** terakumulasi.

---

### 3. `oai_identifier` Kosong dari Server OAI

Jika server OAI mengembalikan record dengan `<identifier>` kosong, query `WHERE oai_identifier = ''` tidak menemukan record apapun, lalu setiap kali harvest → **INSERT baru** dengan identifier kosong → duplikat senyap tanpa error.

---

## Perubahan yang Diimplementasikan

### A. `app/Services/OAIPMHHarvester.php`

#### 1. Guard `oai_identifier` kosong

```php
$oaiIdentifier = trim((string) $header->identifier);

// Guard: skip records without a usable identifier
if ($oaiIdentifier === '') {
    Log::warning("Skipping OAI record with empty identifier for journal ID {$journal->id}");
    return;
}
```

Record dengan identifier kosong di-skip dengan warning di log, bukan dilempar sebagai error (agar tidak menggagalkan seluruh harvest).

#### 2. Ganti pola SELECT+INSERT dengan `updateOrCreate` + fallback exception

```php
try {
    if ($existingByDoi) {
        // Identifier berubah tapi DOI cocok — update artikel yang sudah ada
        $existingByDoi->update($articleData);
        $stats['records_updated']++;
    } else {
        // Atomik: updateOrCreate mencegah race condition
        $result = Article::updateOrCreate(
            ['oai_identifier' => $oaiIdentifier],
            $articleData
        );

        if ($result->wasRecentlyCreated) {
            $stats['records_imported']++;
        } else {
            $stats['records_updated']++;
        }
    }
} catch (UniqueConstraintViolationException $e) {
    // Fallback: unique constraint tetap terpicu (race condition ekstrem)
    $updated = Article::where('oai_identifier', $oaiIdentifier)->update(
        array_merge($articleData, ['last_harvested_at' => now()])
    );

    if ($updated) {
        $stats['records_updated']++;
        Log::warning("Race condition on oai_identifier '{$oaiIdentifier}' — resolved via fallback update.");
    } else {
        throw $e;
    }
}
```

**Strategi defense-in-depth:**

- Layer 1: `updateOrCreate` (atomik, mencegah race condition)
- Layer 2: Catch `UniqueConstraintViolationException` → plain `update()` sebagai last resort
- Layer 3: Re-throw hanya jika benar-benar tidak bisa ditangani

#### 3. Deduplikasi sekunder via DOI

```php
// Secondary lookup: jika server OAI ganti format identifier, cek via DOI
$existingByDoi = null;
if (! empty($dcData['doi'])) {
    $existingByDoi = Article::where('journal_id', $journal->id)
        ->where('doi', $dcData['doi'])
        ->whereNot('oai_identifier', $oaiIdentifier)
        ->first();
}
```

Jika identifier berbeda tapi DOI sama untuk jurnal yang sama → update artikel yang sudah ada, bukan buat duplikat.

#### 4. Parameter `$clearExisting` untuk force re-import

```php
public function harvest(Journal $journal, ?string $fromDate = null, bool $clearExisting = false): array
{
    // ...
    if ($clearExisting) {
        $deleted = Article::where('journal_id', $journal->id)->delete();
        Log::info("Force harvest: deleted {$deleted} existing articles for journal '{$journal->title}'");
    }
    // ...
}
```

---

### B. `app/Jobs/HarvestJournalArticlesJob.php`

Menambahkan parameter `$clearExisting` dan meneruskannya ke `OAIPMHHarvester::harvest()`:

```php
public function __construct(
    public readonly Journal $journal,
    public readonly ?string $fromDate = null,
    public readonly bool $clearExisting = false,  // BARU
) {}

public function handle(OAIPMHHarvester $harvester): void
{
    $harvester->harvest($this->journal, $this->fromDate, $this->clearExisting);
}
```

---

### C. `app/Http/Controllers/AdminKampus/JournalController.php`

Method `harvest()` diperbarui untuk membaca parameter `force` dari request:

```php
public function harvest(Request $request, Journal $journal): RedirectResponse
{
    $this->authorize('update', $journal);

    // ...

    $clearExisting = (bool) $request->input('force', false);

    HarvestJournalArticlesJob::dispatch($journal, null, $clearExisting)->onQueue('harvesting');

    $message = $clearExisting
        ? 'Force sync dijadwalkan. Semua artikel lama akan dihapus dan diimport ulang dari OAI-PMH ...'
        : 'Harvest artikel dijadwalkan. Proses berjalan di background ...';

    return redirect()
        ->route('admin-kampus.journals.show', $journal)
        ->with('success', $message);
}
```

---

### D. `resources/js/pages/AdminKampus/Journals/Show.tsx`

Menambahkan tombol **Force Sync** dengan dialog konfirmasi:

```tsx
const handleForceSync = () => {
    setForceSyncing(true);
    router.post(route('admin-kampus.journals.harvest', journal.id), { force: 1 }, { onFinish: () => setForceSyncing(false) });
};
```

Tombol hanya aktif jika `oai_pmh_url` terkonfigurasi. Sebelum dieksekusi, muncul `AlertDialog` yang menjelaskan bahwa semua artikel lama akan dihapus dan diimport ulang.

---

## Alur Baru setelah Perbaikan

```
Admin klik "Sync Artikel"
        │
        ▼
JournalController@harvest (force=false)
        │  dispatch HarvestJournalArticlesJob(clearExisting=false)
        ▼
OAIPMHHarvester::harvest()
        │
        ├─ skip jika oai_identifier kosong
        │
        ├─ per record:
        │    ├─ cek via DOI jika identifier berubah
        │    ├─ updateOrCreate (atomik)
        │    └─ catch UniqueConstraintViolationException → fallback update
        │
        └─ log ke oai_harvesting_logs (success / partial / failed)

Admin klik "Force Sync" + konfirmasi
        │
        ▼
JournalController@harvest (force=true)
        │  dispatch HarvestJournalArticlesJob(clearExisting=true)
        ▼
OAIPMHHarvester::harvest()
        │
        ├─ DELETE semua artikel journal ini
        │
        └─ harvest ulang dari awal (semua record → INSERT baru)
```

---

## Kapan Menggunakan Force Sync

| Kondisi                                        | Tindakan                                       |
| ---------------------------------------------- | ---------------------------------------------- |
| Sync biasa sebelumnya error / gagal            | Coba **Sync Artikel** (normal) terlebih dahulu |
| Normal sync sukses tapi artikel tetap duplikat | Gunakan **Force Sync**                         |
| Server OAI ganti format URL/identifier         | Gunakan **Force Sync**                         |
| Terdapat artikel dengan volume/no yang salah   | Gunakan **Force Sync**                         |
| Artikel tidak muncul meski sudah ada di OAI    | Gunakan **Force Sync**                         |

> **Peringatan:** Force Sync akan menghapus semua artikel yang sudah tersimpan untuk jurnal tersebut sebelum mengimport ulang. Proses tidak dapat dibatalkan.

---

## File yang Dimodifikasi

| File                                                     | Jenis Perubahan                                                                     |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `app/Services/OAIPMHHarvester.php`                       | Fix race condition, guard empty identifier, DOI fallback, parameter `clearExisting` |
| `app/Jobs/HarvestJournalArticlesJob.php`                 | Tambah parameter `clearExisting`, teruskan ke harvester                             |
| `app/Http/Controllers/AdminKampus/JournalController.php` | Baca `force` dari request, dispatch dengan `clearExisting`                          |
| `resources/js/pages/AdminKampus/Journals/Show.tsx`       | Tambah tombol Force Sync + AlertDialog konfirmasi                                   |

---

## Testing Manual

1. Buka halaman detail jurnal yang sudah punya artikel
2. Klik **Sync Artikel** → setelah selesai, cek `oai_harvesting_logs`: status harus `success`, `records_updated` harus bertambah (bukan `records_imported`)
3. Klik **Sync Artikel** lagi secara berulang → tidak ada error, tidak ada duplikat baru
4. Klik **Force Sync** → konfirmasi → artikel dihapus semua → diimport ulang dari awal
5. Cek `oai_harvesting_logs`: status `success`, `records_imported` = total artikel

---

_Terkait: [OAI_PMH_HARVEST_QUEUE.md](OAI_PMH_HARVEST_QUEUE.md) | [OAI_PMH_IMPLEMENTATION.md](OAI_PMH_IMPLEMENTATION.md)_
