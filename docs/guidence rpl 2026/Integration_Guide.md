# Integration Guide — Kelas G ↔ Kelas B

## Submission System (Kelas G) ↔ Sistem Penelitian Terintegrasi (Kelas B)

Dokumen ini menjelaskan bagaimana proyek **Kelas G** (Submission System / OJS-like) berinteraksi dan berintegrasi dengan proyek **Kelas B** (Sistem Penelitian Terintegrasi / JurnalMu Backend). Setiap mahasiswa yang tugasnya bersinggungan dengan data lintas kelas **wajib** membaca dokumen ini.

---

## 1. Gambaran Arsitektur Integrasi

Kedua proyek berjalan dalam satu _codebase_ monolith Laravel yang sama (satu repository GitHub bersama), dengan pembagian domain yang jelas melalui konvensi penamaan namespace.

```
┌──────────────────────────────────────────────────────────────────────┐
│                    MONOLITH LARAVEL (1 Codebase)                     │
│                                                                      │
│   Namespace Kelas B                  Namespace Kelas G               │
│   app/Http/Controllers/              app/Http/Controllers/           │
│   ├── ProposalController             ├── SubmissionController        │
│   ├── ReviewController               ├── Review/ReviewController     │
│   ├── ContractController             ├── Production/IssueController  │
│   └── ...                           └── ...                         │
│                                                                      │
│   resources/js/pages/                resources/js/pages/            │
│   ├── Proposal/                      ├── Submission/                 │
│   ├── Admin/                         ├── Editorial/                  │
│   └── ...                           └── ...                         │
│                                                                      │
│   ┌─────────────────── Database MySQL ──────────────────────────┐   │
│   │  Tabel Kelas B          │  Tabel Kelas G                    │   │
│   │  proposals              │  submissions                       │   │
│   │  reviews                │  review_assignments                │   │
│   │  contracts              │  issues                            │   │
│   │  users (SHARED)         │  galleys                          │   │
│   │  ...                    │  ...                               │   │
│   └────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### Poin Penting

- **Tabel `users`**: Digunakan bersama oleh Kelas B dan Kelas G. Jangan membuat tabel pengguna baru.
- **Tidak ada REST API antar kelas**: Komunikasi dilakukan langsung via **relasi Eloquent** dan **Query Database**, bukan HTTP request.
- **Tabel milik Kelas G** menggunakan prefix konvensi yang berbeda dari Kelas B agar tidak tabrakan nama.

---

## 2. Tabel Bersama (Shared Tables)

Tabel berikut dibuat oleh Kelas B dan **digunakan (read-only) oleh Kelas G**. Kelas G **tidak boleh** membuat migration untuk tabel ini.

| Nama Tabel         | Pemilik (Kelas) | Digunakan Kelas G Untuk                             |
| :----------------- | :-------------- | :-------------------------------------------------- |
| `users`            | Kelas B         | Data pengguna (Author, Editor, Reviewer)            |
| `research_schemas` | Kelas B         | Referensi skema jurnal/penelitian                   |
| `research_outputs` | Kelas B         | Sinkronisasi luaran yang Published ke portal publik |

### Cara Mengakses Tabel Shared di Kelas G

Gunakan Eloquent dengan memanggil model milik Kelas B secara langsung. Jangan duplikasi data ke tabel baru.

```php
// Contoh: Mengambil data pengguna dengan role Author
use App\Models\User; // Model milik Kelas B, digunakan di Kelas G

$authors = User::whereHas('roles', function ($q) {
    $q->where('role_name', 'Author');
})->get();
```

---

## 3. Titik Integrasi Utama

### 3.1 Artikel Published → Portal Publik JurnalMu

**Siapa yang bertanggung jawab**: IMAN NUR RISKI (Kelas G, Tab 6)

Saat sebuah Issue di-_publish_ oleh Kelas G, artikel di dalamnya harus muncul di portal publik JurnalMu yang dikelola Kelas B.

**Mekanisme**: Kelas G menyediakan **API Endpoint** yang dikonsumsi oleh portal publik Kelas B.

```php
// app/Http/Controllers/Api/PublishedArticleController.php (Kelas G)
// Endpoint: GET /api/published-articles
// Endpoint: GET /api/published-articles/{id}

public function index(Request $request)
{
    return Galley::with(['submission', 'issue'])
        ->whereHas('issue', fn($q) => $q->where('status', 'Published'))
        ->paginate(15);
}
```

**Yang perlu dikoordinasikan dengan Kelas B**:

- Format JSON response (field apa saja yang dibutuhkan portal publik)
- Autentikasi endpoint (gunakan Laravel Sanctum atau tanpa auth untuk public endpoint)

---

### 3.2 Notifikasi → Sistem Email Kelas B

**Siapa yang bertanggung jawab**: SALSABILA NURLAILI & CARESS SUCHI DABRILA (Kelas G, Tab 7)

Kedua kelas menggunakan sistem email Laravel Mailable yang sama. Gunakan **namespace yang berbeda** untuk Mailable agar tidak konflik.

```
Kelas B: app/Mail/ProposalApproved.php
Kelas G: app/Mail/Submission/ReviewInvited.php  ← wajib dalam subfolder Submission/
```

---

### 3.3 Tabel `users` — Peran Baru Kelas G

**Siapa yang bertanggung jawab**: ALTAV ELFAZELL (Kelas G, Tab 1)

Kelas G menambahkan tabel `user_roles` baru (bukan memodifikasi tabel `users` Kelas B). Relasi ditambahkan **dari sisi Kelas G**.

```php
// app/Models/UserRole.php (milik Kelas G)
class UserRole extends Model {
    protected $fillable = ['id_user', 'id_journal', 'role_name', 'status'];

    public function user() {
        return $this->belongsTo(User::class, 'id_user'); // Relasi ke tabel users Kelas B
    }
}
```

**LARANGAN**: Jangan menambahkan kolom baru ke tabel `users` milik Kelas B tanpa koordinasi.

---

## 4. Konvensi Penamaan (Naming Convention)

Untuk menghindari konflik nama di satu codebase, gunakan konvensi berikut:

### 4.1 Tabel Database

| Domain               | Konvensi Nama Tabel | Contoh                                                   |
| :------------------- | :------------------ | :------------------------------------------------------- |
| Kelas B (Penelitian) | `snake_case` biasa  | `proposals`, `contracts`, `reviews`                      |
| Kelas G (Submission) | Awalan konteks OJS  | `submissions`, `review_assignments`, `galleys`, `issues` |

> ⚠️ Jika ada nama tabel yang sama (misal: `reviews` di Kelas B dan `review_assignments` di Kelas G), pastikan nama sudah dibedakan dan tidak terjadi konflik Migration.

### 4.2 Controller

```
Kelas B: app/Http/Controllers/ReviewController.php
Kelas G: app/Http/Controllers/Review/ReviewController.php  ← wajib dalam subfolder
```

### 4.3 React Pages

```
Kelas B: resources/js/pages/Proposal/Index.tsx
Kelas G: resources/js/pages/Submission/Index.tsx
         resources/js/pages/Editorial/...
         resources/js/pages/Review/...
         resources/js/pages/Production/...
```

### 4.4 Branch Git

```
Format: feature/{NIM}_{nama_fitur}
Contoh: feature/2200018001_submission_wizard_step1
        feature/2200018042_issue_publish
```

---

## 5. Alur Kerja Kolaborasi Antar Kelas

### Koordinasi yang Diperlukan

| Kebutuhan Integrasi                               | PIC Kelas B                               | PIC Kelas G                                    | Cara Koordinasi                 |
| :------------------------------------------------ | :---------------------------------------- | :--------------------------------------------- | :------------------------------ |
| Format data artikel Published untuk portal publik | TUTUR PRYAMBADHA (PublicOutputController) | M. IMAN NUR RISKI (PublishedArticleController) | Diskusi format JSON response    |
| Struktur tabel `users` & relasi role              | MUHAMMAD FAHD AFGHANI (Data Layer)        | ALTAV ELFAZELL (UserRole)                      | Pastikan FK `id_user` valid     |
| Sistem notifikasi email (template)                | DEN HANIEF LANIENT (Email template)       | CARESS SUCHI DABRILA & SALSABILA NURLAILI      | Tidak duplikasi, beda namespace |

### Jadwal Koordinasi yang Disarankan

- **Minggu 3 (Perancangan)**: Kelas G dan Kelas B menyepakati format tabel `users`, API endpoint publik, dan namespace.
- **Minggu 7 (Akhir Implementasi Tahap 1)**: Demo integrasi awal — artikel submitted Kelas G, cek tampil di portal Kelas B.
- **Minggu 13 (Pengujian)**: Pengujian integrasi end-to-end: submit → review → publish → portal publik.

---

## 6. ERD Tabel-Tabel Kelas G

Berikut adalah daftar seluruh tabel yang dibuat oleh Kelas G beserta pemilik (mahasiswa yang mengerjakan Migration-nya).

| Nama Tabel                | Pemilik Migration                | Modul | Relasi Utama                           |
| :------------------------ | :------------------------------- | :---- | :------------------------------------- |
| `journals`                | ALTAV ELFAZELL                   | Tab 1 | -                                      |
| `user_roles`              | ALTAV ELFAZELL                   | Tab 1 | FK → `users`                           |
| `author_profiles`         | HANIF FALAH KURNIAWAN            | Tab 1 | FK → `users`                           |
| `reviewer_profiles`       | ADITIYA SUBAKTI                  | Tab 1 | FK → `users`                           |
| `submissions`             | MUHAMMAD DZAKY MUAYYAD           | Tab 2 | FK → `users`, `journals`               |
| `submission_files`        | MUHAMMAD DZAKY MUAYYAD           | Tab 2 | FK → `submissions`                     |
| `submission_contributors` | MUHAMMAD FADLI NOOR HIDAYATULLAH | Tab 2 | FK → `submissions`                     |
| `editorial_assignments`   | ADITYA BINTANG RIANDA SYAHPUTRA  | Tab 3 | FK → `submissions`, `users`            |
| `editorial_decisions`     | ADITYA BINTANG RIANDA SYAHPUTRA  | Tab 3 | FK → `submissions`, `users`            |
| `plagiarism_checks`       | M. ILHAM NURDIN                  | Tab 3 | FK → `submissions`, `users`            |
| `review_assignments`      | AGNES PUTRI ALFALAHI             | Tab 4 | FK → `submissions`, `users`            |
| `review_forms`            | AGNES PUTRI ALFALAHI             | Tab 4 | FK → `review_assignments`              |
| `review_decisions`        | RIFAI AIHUNAN                    | Tab 4 | FK → `review_assignments`              |
| `revision_rounds`         | SEPTIAN EKO NUGROHO              | Tab 5 | FK → `submissions`                     |
| `copyediting_tasks`       | SEPTIAN EKO NUGROHO              | Tab 5 | FK → `submissions`, `users`            |
| `submission_discussions`  | ALFIN AHMAD JUNIAR               | Tab 5 | FK → `submissions`, `users`            |
| `discussion_messages`     | ALFIN AHMAD JUNIAR               | Tab 5 | FK → `submission_discussions`, `users` |
| `issues`                  | OKTA NUZULIFA                    | Tab 6 | FK → `journals`                        |
| `galleys`                 | OKTA NUZULIFA                    | Tab 6 | FK → `submissions`, `issues`           |
| `notifications`           | RYAN ANANDA DJAWA                | Tab 7 | FK → `users`                           |
| `activity_logs`           | RYAN ANANDA DJAWA                | Tab 7 | FK → `submissions`, `users`            |
| `email_templates`         | CARESS SUCHI DABRILA             | Tab 7 | FK → `journals` (nullable)             |
| `announcements`           | ABHIRAMA BALAPHRADANA VISHNU R   | Tab 7 | FK → `journals`                        |

---

## 7. Checklist Sebelum Merge ke Branch Utama

Sebelum membuat Pull Request ke branch `main`, pastikan:

- [ ] Tidak ada konflik nama tabel dengan Kelas B (cek daftar tabel di section 6).
- [ ] Tidak ada perubahan pada file migration milik Kelas B.
- [ ] Semua FK ke tabel `users` sudah menggunakan `constrained('users')` Eloquent.
- [ ] Semua Controller ada di subfolder yang benar (hindari nama file sama dengan Kelas B).
- [ ] Semua React page ada di direktori Submission/Editorial/Review/Production (bukan di root pages/).
- [ ] Sudah dikomunikasikan ke PIC terkait jika tugas Anda menyentuh titik integrasi di Section 5.

---

## 8. Kontak & Koordinasi

Gunakan channel diskusi berikut untuk koordinasi lintas kelas:

- **GitHub Issues**: Buat issue dengan label `integration` untuk melaporkan konflik atau kebutuhan data lintas kelas.
- **Diskusi Kelas**: Alokasikan 15 menit di awal setiap sesi coding untuk sync status integrasi.
- **Dosen Pengampu**: Konsultasikan keputusan desain integrasi yang memerlukan perubahan besar pada struktur bersama.
