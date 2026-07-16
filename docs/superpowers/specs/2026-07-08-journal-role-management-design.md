# Spesifikasi Desain: Modul 1 — Manajemen Peran & Profil Pengguna (OJS-based)

Dokumen ini berisi spesifikasi teknis dan visual untuk implementasi sistem otorisasi peran berbasis Jurnal (RBAC) pada ekosistem JurnalMu, menggantikan fungsionalitas penugasan ALTAV ELFAZELL.

## 1. Skema Database (Tabel `user_roles`)

Modifikasi pada tabel pivot `user_roles` yang sudah ada untuk mendukung peran kontekstual jurnal (OJS-based) dengan tetap menjaga kompatibilitas ke belakang (*backward compatibility*) untuk peran global legacy.

- **Kolom Baru:**
  - `id_journal` (unsignedBigInteger, nullable, FK ke `journals.id`, set null on delete).
  - `role_name` (string, nullable, Enum: `Author`, `Editor`, `SectionEditor`, `Reviewer`, `Copyeditor`, `ProductionEditor`, `Admin`).
  - `status` (string, default: `Active`, Enum: `Active`, `Invited`, `Declined`).
- **Penyesuaian Kolom Lama:**
  - Kolom `role_id` dibuat *nullable* (karena baris peran jurnal akan menggunakan kolom `role_name` secara langsung).
- **Index:**
  - Hapus index unik lama `unique_user_role` (`[user_id, role_id]`).
  - Buat index unik baru `user_journal_role_unique` (`[user_id, role_name, id_journal]`) untuk mencegah duplikasi peran yang sama untuk pengguna di jurnal yang sama.

---

## 2. Model Eloquent & Relasi

### A. Model `UserRole` (`app/Models/UserRole.php`)
Model baru yang menghubungkan user dengan peran operasional jurnal.

- **Relasi:**
  - `user()` -> `belongsTo(User::class, 'user_id')`
  - `journal()` -> `belongsTo(Journal::class, 'id_journal')`
- **Alias Virtual (`id_user`):**
  - Menggunakan Eloquent Accessor & Mutator agar properti virtual `id_user` otomatis terpetakan ke kolom database `user_id` untuk kompatibilitas frontend.

### B. Model `User` (`app/Models/User.php`)
- **Relasi Baru:**
  - `userRoles()` -> `hasMany(UserRole::class, 'user_id')`
- **Helper Methods:**
  - `hasJournalRole(string $roleName, $journalId = null): bool`: Memeriksa peran user pada jurnal tertentu.
  - `hasRoleInAnyJournal(string $roleName): bool`: Memeriksa apakah user memiliki peran tersebut di setidaknya salah satu jurnal.

### C. Model `Journal` (`app/Models/Journal.php`)
- **Relasi Baru:**
  - `userRoles()` -> `hasMany(UserRole::class, 'id_journal')`

---

## 3. Middleware & Routing

### A. Middleware `RoleMiddleware` (`app/Http/Middleware/RoleMiddleware.php`)
Middleware ini melakukan otorisasi kontekstual:
1. Mengambil ID jurnal dari parameter rute (misal: `{journal}`).
2. Jika ID jurnal ditemukan, verifikasi hak akses user menggunakan `$user->hasJournalRole($role, $journalId)`.
3. Jika rute bersifat global (tidak memiliki konteks jurnal), verifikasi apakah user memiliki peran tersebut di salah satu jurnal menggunakan `$user->hasRoleInAnyJournal($role)` atau peran sistem global legacy `$user->hasRole($role)`.
4. Jika tidak valid, abort 403.

### B. Registrasi Middleware (`bootstrap/app.php`)
Didaftarkan dengan nama alias `'journal.role'` di dalam middleware manager bootstrap.

### C. Web Routes (`routes/web.php`)
- Rute index manajemen peran: GET `/admin/users` yang mengarah ke `UserRoleController@index`, dilindungi oleh middleware `auth` dan `verified`.

---

## 4. Controller (`app/Http/Controllers/Admin/UserRoleController.php`)

Menangani pemanggilan data pengguna dan perannya.
- **Method `index()`**:
  - Mengambil data pengguna beserta relasi `userRoles.journal`.
  - Melakukan transformasi data (*resource mapping*) ke struktur data visual frontend yang diharapkan (misalnya memetakan `user_id` ke `id_user` dan `title` jurnal ke `name`).
  - Merender view Inertia `Admin/Users/Index`.

---

## 5. Antarmuka React (`resources/js/pages/Admin/Users/Index.tsx`)

Menampilkan data grid manajemen peran jurnal yang modern dan responsif menggunakan **shadcn/ui**.
- **Fitur Utama:**
  - Grid daftar pengguna (Nama, Email, Peran & Jurnal, Status Undangan, Aksi).
  - Integrasi badge multi-peran (`<RoleBadge>`).
  - Tombol aksi pencabutan hak akses `"Cabut Peran"` yang memicu dibukanya modal dialog konfirmasi pencabutan peran (`<RevokeRoleModal>`).
  - Navigasi asinkronus ke halaman undang peran baru (`/admin/users/invite`).
