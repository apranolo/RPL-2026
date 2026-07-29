# Laporan Pengujian E2E Endpoint & Panduan Testing Manual View - Modul 2 (Manajemen Reviewer dan Penilaian)

Laporan ini melengkapi dokumentasi pengujian Modul 2 (Kelas B) pada Issue #262 dengan menyajikan **Rincian Pengujian E2E Endpoint API** dan **Panduan Langkah Demi Langkah Pengujian Manual Halaman View UI**.

---

## 1. Laporan Pengujian E2E Endpoint API (API & Route Verification)

Pengujian E2E Endpoint dilakukan dengan memverifikasi pemetaan rute HTTP, penanganan controller, middleware otorisasi (RBAC), serta tipe balasan Inertia React.

### Tabel Matriks Endpoint Modul 2

| Method | Endpoint URI | Controller & Method | Middleware Hak Akses | Status E2E Verification |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/reviewer/assign` | `Admin\AssignController@index` | `auth`, `role:Super Admin,Admin Kampus` | **[PASSED]** |
| `POST` | `/admin/assign` | `Admin\AssignController@assign` | `auth`, `role:Super Admin,Admin Kampus` | **[PASSED]** |
| `DELETE` | `/admin/assign/{id}` | `Admin\AssignController@unassign` | `auth`, `role:Super Admin,Admin Kampus` | **[PASSED]** |
| `GET` | `/reviewer/assignments` | `ReviewerController@index` | `auth`, `role:Reviewer` | **[PASSED]** |
| `GET` | `/reviewer/assignments/{id}` | `ReviewerController@show` | `auth`, `role:Reviewer` | **[PASSED]** |
| `GET` | `/reviewer/assignments/{id}/review` | `ReviewerController@reviewForm` | `auth`, `role:Reviewer` | **[PASSED]** |
| `POST` | `/reviewer/assignments/{id}/review` | `ReviewerController@submitReview` | `auth`, `role:Reviewer` | **[PASSED]** |
| `GET` | `/admin/reviews/summary` | `Admin\ReviewController@summary` | `auth`, `role:Super Admin,Admin Kampus` | **[PASSED]** |
| `POST` | `/admin/decision` | `Admin\DecisionController@decide` | `auth`, `role:Super Admin,Admin Kampus` | **[PASSED]** |
| `GET` | `/admin/criteria` | `Admin\CriteriaController@index` | `auth`, `role:Super Admin` | **[PASSED]** |
| `POST` | `/admin/criteria` | `Admin\CriteriaController@store` | `auth`, `role:Super Admin` | **[PASSED]** |
| `PUT` | `/admin/criteria/{id}` | `Admin\CriteriaController@update` | `auth`, `role:Super Admin` | **[PASSED]** |
| `DELETE` | `/admin/criteria/{id}` | `Admin\CriteriaController@destroy` | `auth`, `role:Super Admin` | **[PASSED]** |
| `GET` | `/proposal/history` | `ReviewHistoryController@index` | `auth`, `role:User` | **[PASSED]** |
| `GET` | `/proposal/{id}/print-ba` | `ReviewDocumentController@printBA` | `auth` | **[PASSED]** |

---

## 2. Panduan Langkah Demi Langkah Testing Manual Halaman View UI

### Preparasi Awal
1. Pastikan container Docker berjalan (`docker ps`).
2. Jalankan migrasi dan seeder awal:
   ```bash
   docker exec -e DB_HOST=rpl_db rpl_app php artisan migrate:fresh --seed
   ```
3. Akses aplikasi melalui browser di `http://localhost:8085`.

---

### Skenario 1: Penunjukan Reviewer oleh Admin Kampus / LPPM
1. **Login**: Masuk sebagai **Super Admin / Admin Kampus** (`superadmin@ajm.ac.id` / `password123`).
2. **Navigasi**: Buka menu **Penunjukan Reviewer** di sidebar atau akses `http://localhost:8085/admin/reviewer/assign`.
3. **Verifikasi UI**:
   - Pastikan daftar proposal berstatus `Administrasi_Valid` tampil pada tabel.
   - Klik tombol **"Tunjuk Reviewer"** pada salah satu baris proposal.
4. **Eksekusi & Modal**:
   - Modal `AssignModal` muncul. Pilih reviewer dari dropdown list dan atur tanggal batas review.
   - Klik **"Simpan Penunjukan"**.
5. **Ekspektasi Hasil**: Notifikasi sukses muncul, status proposal berubah menjadi `Dalam_Review`, dan reviewer menerima tugas review baru.

---

### Skenario 2: Pengisian Form Penilaian oleh Reviewer
1. **Login**: Switch account / login sebagai **Reviewer** (`reviewer@ajm.ac.id` / `password123`).
2. **Navigasi**: Akses **Dashboard Reviewer** (`http://localhost:8085/reviewer/assignments`).
3. **Verifikasi UI**:
   - Proposal yang ditugaskan di Skenario 1 tampil pada tabel tugas dengan status `Assigned`.
   - Klik tombol **"Nilai Proposal"** / **"Detail"**.
4. **Form Penilaian**:
   - Halaman `FormReview.tsx` terbuka.
   - Isi skor pada setiap indikator kriteria penilaian (`AssessmentCriteria`).
   - Isi kolom **Catatan Reviewer** dan pilih rekomendasi (`Diterima` / `Ditolak`).
   - Klik tombol **"Submit Penilaian"**.
5. **Ekspektasi Hasil**: Form berhasil disubmit, status tugas berubah menjadi `Completed`, dan nilai terakumulasi ke dalam database.

---

### Skenario 3: Rekap Penilaian & Penentuan Keputusan oleh Admin Kampus
1. **Login**: Kembali masuk sebagai **Super Admin / Admin Kampus** (`superadmin@ajm.ac.id` / `password123`).
2. **Navigasi**: Buka halaman **Rekap Review & Keputusan** (`http://localhost:8085/admin/reviews/summary`).
3. **Verifikasi UI**:
   - Tabel `Summary.tsx` menampilkan nilai dari masing-masing reviewer beserta kalkulasi rata-rata skor (`ReviewCalculationService`).
4. **Pengambilan Keputusan**:
   - Klik tombol **"Keputusan"** pada proposal yang telah selesai di-review.
   - Pilih opsi Keputusan **"Diterima"** atau **"Ditolak"** (jika ditolak, wajib mengisikan alasan minimal 10 karakter).
   - Klik **"Simpan Keputusan"**.
5. **Ekspektasi Hasil**: Status proposal diperbarui secara permanen menjadi `Diterima` atau `Ditolak`.

---

### Skenario 4: Riwayat Review & Cetak Berita Acara oleh Dosen Pengusul
1. **Login**: Masuk sebagai **Dosen Pengusul** (`andi.prasetyo@uad.ac.id` / `password123`).
2. **Navigasi**: Buka halaman **Riwayat Review Proposal** (`http://localhost:8085/proposal/history`).
3. **Verifikasi UI**:
   - Proposal milik dosen beserta status keputusan (`Diterima` / `Ditolak`) dan catatan reviewer tampil pada halaman `ReviewHistory.tsx`.
4. **Cetak Berita Acara**:
   - Klik tombol **"Cetak Berita Acara (PDF/HTML)"**.
5. **Ekspektasi Hasil**: Halaman `berita_acara.blade.php` berhasil di-render/di-download tanpa error 500.

---

### Skenario 5: Manajemen Parameter Kriteria Penilaian oleh Super Admin
1. **Login**: Masuk sebagai **Super Admin** (`superadmin@ajm.ac.id` / `password123`).
2. **Navigasi**: Akses `http://localhost:8085/admin/criteria`.
3. **Uji CRUD**:
   - **Tambah**: Klik "Tambah Kriteria", isi nama indikator & bobot, lalu simpan (`Create.tsx`).
   - **Edit**: Ubah bobot kriteria pada halaman edit (`Edit.tsx`).
   - **Hapus**: Klik tombol hapus kriteria.
4. **Ekspektasi Hasil**: Data kriteria di-update dan langsung memengaruhi form penilaian reviewer selanjutnya.
