# OAI-PMH Article Harvesting

**Last updated**: 2026-03-04  
**Affected files**:
- `app/Services/OAIPMHHarvester.php`
- `app/Jobs/HarvestJournalArticlesJob.php`
- `app/Models/Article.php`
- `resources/js/pages/Journals/Show.tsx`

---

## Ringkasan

Fitur ini memungkinkan sistem memanen (harvest) data artikel dari jurnal yang memiliki endpoint **OAI-PMH** (Open Archives Initiative Protocol for Metadata Harvesting). Data artikel disimpan ke tabel `articles` dan ditampilkan di halaman publik detail jurnal.

---

## Alur Kerja

```
[Admin trigger sync]
       ↓
HarvestJournalArticlesJob (Queue)
       ↓
OAIPMHHarvester::harvest()
       ↓
  Loop halaman via resumptionToken
       ↓
  extractDublinCoreMetadata() ← dc:title, dc:creator, dc:source, dll.
       ↓
  parseSourceInfo()           ← ekstrak volume, issue, pages dari dc:source
       ↓
  Article::upsert via oai_identifier
       ↓
oai_harvesting_logs (log hasil)
```

---

## Field yang Diambil dari OAI-PMH (Dublin Core)

| Elemen DC      | Field DB (`articles`) | Keterangan                                      |
|----------------|-----------------------|-------------------------------------------------|
| `dc:title`     | `title`               | Judul artikel (pertama saja)                    |
| `dc:description` | `abstract`          | Abstrak (pertama saja)                          |
| `dc:creator`   | `authors` (JSON)      | Semua pengarang disimpan sebagai array JSON      |
| `dc:subject`   | `keywords` (JSON)     | Semua kata kunci disimpan sebagai array JSON     |
| `dc:date`      | `publication_date`    | Tanggal publikasi (format YYYY-MM-DD/YYYY-MM/YYYY) |
| `dc:identifier` (DOI) | `doi`          | Pola `10.xxxx/…`                                |
| `dc:identifier` (URL) | `article_url`  | URL artikel pertama yang valid                  |
| `dc:identifier` (.pdf) | `pdf_url`    | URL yang berakhiran `.pdf`                      |
| `dc:source`    | `volume`, `issue`, `pages` | Diparsing dari string sumber (lihat bawah) |
| `oai:header/identifier` | `oai_identifier` | ID unik record OAI (kunci upsert)         |
| `oai:header/datestamp`  | `oai_datestamp`  | Timestamp perubahan record di server OAI  |
| `oai:header/setSpec`    | `oai_set`        | Set/koleksi OAI                           |

---

## Parsing Volume / Issue / Halaman (`parseSourceInfo`)

Field `dc:source` dari OAI-PMH berisi string sumber seperti:

```
Jurnal JPSD; Vol. 1 No. 1: Agustus 2014; 1-13
Journal Name; Vol. 4 (2026): January 2026; 10-25
5(1):30-50
```

Logika parsing:

1. **Pola 1** — `Vol. X No. Y` atau `Vol. X, No. Y` → volume = X, issue = Y
2. **Pola 2** — `X(Y)` → volume = X, issue = Y **hanya jika Y < 1000** (untuk menghindari salah mengambil tahun sebagai nomor issue, contoh: `Vol. 1 (2026)` → volume = 1, issue = *diabaikan*)
3. **Pola halaman** — `10-20` atau `pp. 10-20` → pages = "10-20"

> **Bug yang diperbaiki (2026-03-04)**: Pola 2 sebelumnya tidak memiliki guard, sehingga source seperti `"Vol. 1 (2026): January 2026"` menghasilkan `issue = 2026`. Kini ditambahkan kondisi `(int) $matches[2] < 1000`.

---

## Resumption Token (Paginasi OAI-PMH)

OAI-PMH mengembalikan results secara bertahap (biasanya 100 record per halaman). Di akhir setiap respons XML terdapat elemen `<resumptionToken>` yang berisi token untuk mengambil halaman berikutnya. Permintaan berikutnya harus menggunakan `?verb=ListRecords&resumptionToken={token}` **tanpa** `metadataPrefix`.

> **Bug yang diperbaiki (2026-03-04)**: Sebelumnya harvester hanya melakukan **1 HTTP request** dan berhenti tanpa mengikuti resumption token. Akibatnya hanya batch pertama artikel (±100 record) yang tersimpan. Sekarang harvester melakukan loop hingga tidak ada token lagi (atau mencapai batas aman 500 halaman).

Contoh endpoint JPSD (UAD):
```
# Halaman pertama
GET https://journal.uad.ac.id/index.php/JPSD/oai?verb=ListRecords&metadataPrefix=oai_dc

# Halaman-halaman berikutnya (menggunakan token dari response sebelumnya)
GET https://journal.uad.ac.id/index.php/JPSD/oai?verb=ListRecords&resumptionToken=<token>
```

---

## Tampilan Judul Artikel (Sentence Case)

Judul artikel di OAI-PMH umumnya ditulis dalam **HURUF KAPITAL SEMUA** sesuai konvensi metadata perpustakaan. Agar tampilan di halaman publik lebih nyaman dibaca, judul dikonversi ke **sentence case** (hanya huruf pertama kata pertama yang kapital, sisanya lowercase) secara **display-side** di React — data di database tetap tidak diubah.

Fungsi yang digunakan ([`resources/js/pages/Journals/Show.tsx`](../../resources/js/pages/Journals/Show.tsx)):

```ts
const toSentenceCase = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
```

> Transformasi dilakukan di sisi tampilan, bukan saat harvest, agar data OAI sumber tetap tersimpan asli di database.

---

## Contoh Hasil Harvest (JPSD - Universitas Ahmad Dahlan)

- **OAI Endpoint**: `https://journal.uad.ac.id/index.php/JPSD/oai`
- **Format metadata**: Dublin Core (`oai_dc`)
- **Cakupan**: Vol. 1 No. 1 (2014) s/d Vol. 1 No. 1 (2026)
- **Total record**: >100 artikel (multi-halaman, memerlukan resumption token)

---

## Catatan Lanjutan

- Record OAI dengan `status="deleted"` dilewati (tidak disimpan/dihapus dari DB)
- Upsert menggunakan `oai_identifier` sebagai kunci unik — re-harvest aman dilakukan untuk memperbaiki data yang sudah tersimpan
- Timeout HTTP request: **60 detik** per halaman (ditingkatkan dari 30 detik untuk mengakomodasi server OAI yang lambat)
- Batas maksimal halaman per harvest: **500** (mencegah infinite loop jika server OAI bermasalah)
- Hasil setiap harvest dicatat di tabel `oai_harvesting_logs`
