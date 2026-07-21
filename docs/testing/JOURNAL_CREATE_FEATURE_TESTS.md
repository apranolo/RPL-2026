# Feature Test Documentation: Journal Creation (User Role)

**File Test:** `tests/Feature/User/JournalCreateTest.php`  
**Tanggal Dibuat:** 26 Februari 2026  
**Coverage:** Alur tambah jurnal baru untuk role User  
**Framework:** Pest PHP  
**Total Tests:** 16 tests, 45 assertions  
**Status:** ✅ All Passing

---

## Menjalankan Tests

```bash
# Semua test di file ini
php artisan test tests/Feature/User/JournalCreateTest.php

# Dengan output detail
php artisan test --filter JournalCreate

# Semua feature tests
php artisan test tests/Feature/
```

**Output yang diharapkan:**
```
Tests:    16 passed (45 assertions)
Duration: ~6s
```

---

## Setup

Setiap test menggunakan `beforeEach` untuk seed roles:

```php
beforeEach(function () {
    $this->seedRoles();   // Membuat role Super Admin, Admin Kampus, User
});
```

Database menggunakan SQLite in-memory (lihat `phpunit.xml`). Setiap test berjalan dalam transaksi yang di-rollback otomatis.

---

## Test Cases

### 🟢 Happy Path (4 tests)

#### 1. `user_dapat_membuat_journal_baru_dengan_data_valid`
**Skenario:** User aktif dengan `university_id` mengisi semua field required, submit form.  
**Assertion:**
- Response adalah 302 redirect ke `user.journals.index`
- Record terdapat di tabel `journals` dengan `user_id` dan `university_id` yang benar
- `sinta_rank` tersimpan sebagai string (`non_sinta`)

```php
$this->actingAs($user)
    ->post(route('user.journals.store'), [
        'title'               => 'Jurnal Ilmu Komputer Indonesia',
        'e_issn'              => '1234-5678',
        'url'                 => 'https://journal.example.ac.id',
        'oai_pmh_url'         => 'https://journal.example.ac.id/oai',
        'frequency'           => 'Quarterly',
        'scientific_field_id' => $field->id,
        'sinta_rank'          => 'non_sinta',
    ])
    ->assertRedirect(route('user.journals.index'));

$this->assertDatabaseHas('journals', ['title' => 'Jurnal Ilmu Komputer Indonesia', ...]);
```

---

#### 2. `user_dapat_membuat_journal_dengan_akreditasi_sinta`
**Skenario:** User membuat jurnal dengan `sinta_rank = sinta_2` dan mengisi field akreditasi lengkap.  
**Assertion:**
- Journal tersimpan dengan `sinta_rank = 'sinta_2'`
- `accreditation_sk_number` tersimpan dengan benar

---

#### 3. `user_dapat_membuat_journal_dengan_indexation_url`
**Skenario:** User mencentang Scopus dan DOAJ, mengisi URL untuk Scopus, DOAJ dikosongkan.  
**Assertion:**
- Journal tersimpan
- `indexations` JSON memiliki key `Scopus` dan `DOAJ`
- `indexations['Scopus']['url']` berisi URL yang dimasukkan

```php
'indexations' => [
    ['platform' => 'Scopus', 'url' => 'https://www.scopus.com/sourceid/12345'],
    ['platform' => 'DOAJ', 'url' => ''],
],
```

---

#### 4. `user_dapat_membuat_journal_dengan_indexation_tanpa_url`
**Skenario:** User mencentang Google Scholar tanpa mengisi URL (field opsional dikosongkan).  
**Assertion:**
- Journal tersimpan
- `indexations['Google Scholar']['url']` adalah `null`

---

### 🔴 Validation Failures (8 tests)

| Test | Field yang Diuji | Input Invalid | Expected Error |
|------|-----------------|---------------|----------------|
| `gagal_simpan_jika_title_kosong` | `title` | `''` | `errors.title` |
| `gagal_simpan_jika_e_issn_kosong` | `e_issn` | `''` | `errors.e_issn` |
| `gagal_simpan_jika_format_e_issn_tidak_valid` | `e_issn` | `'12345678'` (tanpa dash) | `errors.e_issn` |
| `gagal_simpan_jika_oai_pmh_url_kosong` | `oai_pmh_url` | `''` | `errors.oai_pmh_url` |
| `gagal_simpan_jika_frequency_kosong` | `frequency` | `''` | `errors.frequency` |
| `gagal_simpan_jika_scientific_field_id_tidak_valid` | `scientific_field_id` | `99999` (tidak ada) | `errors.scientific_field_id` |
| `gagal_simpan_jika_sinta_rank_tidak_valid` | `sinta_rank` | `'invalid_rank'` | `errors.sinta_rank` |
| `gagal_simpan_jika_url_indexation_format_tidak_valid` | `indexations.*.url` | `'not-a-valid-url'` | `errors.indexations.Scopus.url` |

Semua validation failure test juga memverifikasi:
```php
$this->assertDatabaseCount('journals', 0);  // Tidak ada data tersimpan
```

**Catatan test format e_issn:**
```php
// E-ISSN harus format xxxx-xxxx (4 digit - 4 digit)
'e_issn' => '12345678'   // invalid — tidak ada dash
'e_issn' => '1234-5678'  // valid
```

**Catatan test URL indexation:**
```php
// URL disimpan dengan key platform setelah prepareForValidation transform
->assertSessionHasErrors(['indexations.Scopus.url']);
// bukan: 'indexations.0.url'
```

---

### 🔒 Authorization Failures (4 tests)

#### `gagal_simpan_jika_user_tidak_memiliki_university`
**Skenario:** User dengan `university_id = null` mencoba menyimpan jurnal.  
**Assertion:**
- Response 302 back
- Session memiliki error `university_id`
- Tidak ada jurnal tersimpan di DB

```php
$user = User::factory()->user(null)->create(['is_active' => true]);
// User::factory()->user(null) → university_id = null
```

---

#### `tamu_tidak_dapat_mengakses_form_buat_journal`
**Skenario:** Request GET ke `user.journals.create` tanpa autentikasi.  
**Assertion:** Redirect ke `route('login')`

---

#### `tamu_tidak_dapat_menyimpan_journal`
**Skenario:** Request POST ke `user.journals.store` tanpa autentikasi.  
**Assertion:** Redirect ke `route('login')`

---

#### `user_tidak_aktif_diarahkan_ke_login`
**Skenario:** User dengan `is_active = false` mencoba mengakses form create journal.  
**Mekanisme:** `CheckRole` middleware mendeteksi `is_active = false`, logout paksa, redirect ke login.  
**Assertion:** Response redirect ke `route('login')`

---

## Cakupan Requirement

| Requirement | Test yang Mengcover |
|-------------|---------------------|
| Field required: title, e_issn, url, oai_pmh_url, frequency, scientific_field_id | gagal_simpan_jika_* |
| Format e_issn harus xxxx-xxxx | gagal_simpan_jika_format_e_issn_tidak_valid |
| sinta_rank harus nilai valid | gagal_simpan_jika_sinta_rank_tidak_valid |
| User wajib memiliki university_id | gagal_simpan_jika_user_tidak_memiliki_university |
| Indexation URL opsional, format validated | gagal_simpan_jika_url_indexation_format_tidak_valid |
| Indexation dapat disimpan dengan URL | user_dapat_membuat_journal_dengan_indexation_url |
| Indexation dapat disimpan tanpa URL | user_dapat_membuat_journal_dengan_indexation_tanpa_url |
| Akreditasi sk fields tersimpan | user_dapat_membuat_journal_dengan_akreditasi_sinta |
| Tamu tidak dapat akses form | tamu_tidak_dapat_* |
| User tidak aktif di-logout | user_tidak_aktif_diarahkan_ke_login |

---

## Yang Belum Dicakup (Future Tests)

- Test update/edit jurnal oleh User (UpdateJournalRequest)
- Test Admin Kampus membuat jurnal (termasuk assignment `user_id`)
- Test duplicate e_issn (saat ini belum ada unique constraint di DB)
- Test cover_image upload
- Test batas panjang field (max:255, max:500, max:1000)
- Browser/Dusk test untuk memverifikasi UI indexation URL input
