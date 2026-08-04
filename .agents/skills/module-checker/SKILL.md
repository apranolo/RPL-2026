---
name: module-checker
description: Use when verifying, checking, or validating a specific module in the RPL-2026 project, particularly before a phased deployment.
---

# Module Checker Skill

Skill ini memandu agen untuk melakukan pengecekan mendalam per-modul sebelum dilakukan deployment secara bertahap pada sistem `jurnal_mu`.

## Alur Kerja Pemeriksaan Modul

Saat melakukan pemeriksaan untuk modul tertentu, ikuti langkah-langkah terstruktur berikut:

### 1. Fase Identifikasi & Konteks Modul
- **Cari Pemilik & Kelas**: Buka file [Penugasan_RPL_Kelas_B.md](file:///c:/xampp/htdocs/RPL-2026/docs/guidence%20rpl%202026/Penugasan_RPL_Kelas_B.md) atau [Penugasan_RPL_Kelas_G.md](file:///c:/xampp/htdocs/RPL-2026/docs/guidence%20rpl%202026/Penugasan_RPL_Kelas_G.md). Temukan nama mahasiswa, modul, dan fitur spesifik yang ditugaskan.
- **Rujuk Dokumen Kebutuhan (PRD)**: Buka dokumen PRD utama:
  - Kelas B: [Product_Requirement_Document.md](file:///c:/xampp/htdocs/RPL-2026/docs/guidence%20rpl%202026/Product_Requirement_Document.md)
  - Kelas G: [PRD_Submission_System_Kelas_G.md](file:///c:/xampp/htdocs/RPL-2026/docs/guidence%20rpl%202026/PRD_Submission_System_Kelas_G.md)
  Pahami alur bisnis, fitur utama, dan kriteria penerimaan (acceptance criteria) dari modul tersebut.
- **Rujuk Spesifikasi Detail**: Buka file spesifikasi visual terkait di folder `docs/guidence rpl 2026/specs/` (misalnya `kelas_b_modul_1_proposal_management.md`). Pahami rancangan wireframe, routing, props, dan komponen kustom yang diwajibkan.

### 2. Fase Sinkronisasi Kode & Lingkungan Lokal (Docker & Remote Sync)
- **Container Status Check**: Periksa status container Docker dengan `docker ps`. Jika container `rpl_app` mati, jalankan `docker start rpl_app` atau `docker compose up -d`.
- **Verifikasi Remote Branch**: Sebelum menyatakan file hilang atau tidak di-implementasi, lakukan `git fetch origin` dan periksa keberadaan berkas di branch remote (`origin/development`) dengan `git ls-tree -r origin/development --name-only`.
- **Database Network & Refresh**: Pastikan `.env` mengarah ke container database (`DB_HOST=rpl_db`). Jalankan migrasi jika diperlukan:
  ```bash
  docker exec -e DB_HOST=rpl_db rpl_app php artisan migrate:fresh --seed
  ```

### 3. Fase Verifikasi Backend (Laravel)
- **Struktur Kode & Namespace**: Pastikan Controller diletakkan pada folder yang sesuai dengan hak akses aktor (misal `app/Http/Controllers/AdminKampus` atau `app/Http/Controllers/Admin`).
- **Validasi Input**: Validasi harus menggunakan Form Request terpisah di `app/Http/Requests/` (bukan validasi inline di Controller).
- **Otorisasi & Keamanan Multi-Tenancy**:
  - Semua query data untuk institusi/kampus harus diisolasi menggunakan filter `university_id` (misalnya scope `forUniversity`).
  - Otorisasi Controller wajib memanggil policy `$this->authorize()` atau middleware peran.
  - Pengecekan peran **TIDAK BOLEH** langsung memanggil pivot `$user->roles()`. Gunakan helper Model seperti `$user->hasRole($role)` atau `$user->hasAnyRole([$roles])`.

### 4. Fase Verifikasi Frontend (Inertia & React)
- **Lokasi & Komponen**: Halaman React harus berada di `resources/js/pages/{Role}/{Resource}/{Action}.tsx`.
- **Wajib JSDoc**: Pastikan ada header JSDoc di atas komponen yang memuat informasi rute (`@route`), fitur (`@features`), dan deskripsi (`@description`).
- **Form & Validation**: Wajib menggunakan helper `useForm` dari `@inertiajs/react`, menonaktifkan tombol submit jika `processing` aktif (`disabled={processing}`), serta menampilkan komponen `<InputError message={errors.field_name} />` di bawah input field.
- **Kesesuaian Tampilan (UI/UX Guide)**:
  - **No Manual Hex Color**: Gunakan class Tailwind tema bawaan *The Progressive Aurora* (`bg-primary`, `text-primary`, `border-primary`, dll.).
  - **Radius**: Elemen interaktif seperti tombol, card, dan modal harus menggunakan `rounded-lg` (setara 10px).
  - **Status Badges**: Warna status badge harus konsisten sesuai panduan global (Draft: Slate, In Review: Amber, Accepted: Emerald, Rejected: Rose).
  - **Larangan Kritis**: Dilarang menulis kueri Eloquent di dalam file `.tsx` dan dilarang melakukan fetch data manual menggunakan `axios.get` untuk data halaman utama (semua data wajib bersumber dari props controller).

### 5. Pengujian E2E Endpoint & Halaman View React Inertia (E2E Endpoint & View Page Testing)
- **Verifikasi Routing Laravel**:
  Jalankan `route:list` di container Docker untuk memastikan rute terdaftar tanpa masalah FQCN/nama rute:
  ```bash
  docker exec -e DB_HOST=rpl_db rpl_app php artisan route:list --path=<modul_prefix>
  ```
- **Verifikasi Ketersediaan & Pemetaan View React**:
  - Memastikan method Controller memanggil `Inertia::render('Path/Page', $props)` yang cocok dengan nama berkas fisik di `resources/js/pages/Path/Page.tsx`.
- **Pengujian Autentikasi & Otorisasi Peran (RBAC)**:
  - Uji rute langsung di browser (`http://localhost:8085`) menggunakan kredensial aktor yang sesuai:
    - **Super Admin / Admin Kampus**: `superadmin@ajm.ac.id` / `password123`
    - **Dosen Pengusul**: `andi.prasetyo@uad.ac.id` / `password123`
    - **Reviewer**: Akun reviewer terdaftar.
  - Bebas dari error 403 (Forbidden) akibat ketiadaan middleware `role:...` yang selaras.
- **Verifikasi Data Props & Render Visual**:
  - Memastikan struktur data dari Controller cocok dengan TypeScript interface pada komponen React agar tidak terjadi blank white screen atau error runtime JS.

### 6. Pengujian Kualitas Kode (Code Quality Checking)
Jalankan pengecekan kualitas kode dalam container Docker:
```bash
# Validasi format kode PHP
docker exec rpl_app ./vendor/bin/pint --test

# Pengecekan tipe data TypeScript
npx tsc --noEmit

# Menjalankan Pest test modul terkait
docker exec -e DB_HOST=rpl_db -e DB_PORT=3306 -e DB_DATABASE=rpl_2026 rpl_app ./vendor/bin/pest --filter=[NamaModul]
```

### 7. Pembuatan Laporan Pengecekan Modul & Diagram Mermaid
Setelah melakukan pemeriksaan, buat laporan evaluasi lokal dan simpan di `.agents/reviews/Module-<NAMA_MODUL>-review.md`.

**Aturan Penulisan Laporan (CRITICAL)**:
- **Wajib** ditulis dalam **Bahasa Indonesia** secara profesional dan terstruktur.
- **Larangan Emoji**: Seluruh isi laporan **TIDAK BOLEH** menggunakan emoji apa pun. Semua indikator visual harus digantikan teks penjelas standar (contoh: mengganti 🔴 dengan [CRITICAL] atau [MUST FIX], mengganti 🟢/✅ dengan [PASSED] atau [SUKSES]).
- **Diagram Mermaid**: Sertakan Diagram Flowchart Bisnis & Sequence Diagram untuk menjelaskan alur endpoint teknis jika diperlukan.

### 8. Otomatisasi Alur Publikasi & Penutupan GitHub Issue/PR
- Buat Issue atau berikan komentar pada Issue/PR terkait via GitHub CLI (`gh issue create` / `gh issue comment`).
- Apabila hasil review **APPROVED** / **COMPLETE**, lakukan eksekusi sekuensial berikut:
  1. Approve PR: `gh pr review <PR_NUMBER> --approve --body-file <FILE_PATH>`
  2. Merge PR ke development: `gh pr merge <PR_NUMBER> --merge --admin`
  3. Beri komentar penyelesaian pada Issue pelacak terkait (jika ada).
  4. Tutup Issue tersebut: `gh issue close <ISSUE_NUMBER> --reason "completed"`

### Template Laporan Pengecekan Modul
```markdown
# Laporan Pengecekan Modul: <NAMA_MODUL>
**Mahasiswa Penanggung Jawab:** <Nama Mahasiswa> (@<Username GitHub>)
**Status Pengecekan:** <SIAP_DEPLOY | PERLU_PERBAIKAN | BLOCKED>

---

## Ringkasan Pemeriksaan (Executive Summary)
<Berikan deskripsi singkat 2-3 kalimat mengenai status modul dan kesiapannya untuk dideploy secara bertahap.>

## Keselarasan PRD & Spesifikasi Desain
- **Kesesuaian Fitur PRD**: [PASSED / MISMATCH] <Uraikan apakah fitur yang dideploy sudah mencakup seluruh kriteria penerimaan di PRD.>
- **Kesesuaian Spesifikasi Wireframe**: [PASSED / MISMATCH] <Uraikan kesesuaian letak komponen, filter, routing, dan props dengan file spesifikasi visual.>

## Analisis Backend (Laravel)
- **Controller & Request**: [OK / BUGS / VIOLATION] <Detail penempatan Controller dan Request Validation.>
- **Database (Migration & Seed)**: [OK / BUGS] <Detail kelancaran migrasi dan seed database dummy.>
- **Otorisasi & Multi-Tenancy**: [OK / VIOLATION] <Detail pengecekan hak akses dan filter university_id.>

## Analisis Frontend (Inertia & React)
- **Kompatibilitas props & useForm**: [OK / VIOLATION] <Pengecekan penggunaan Inertia useForm dan form submission.>
- **Panduan Visual & Warna (UI/UX)**: [OK / VIOLATION] <Detail keselarasan dengan Global UI/UX Guide (warna tema, radius rounded-lg, layout container).>
- **JSDoc Header**: [OK / MISSING] <Detail keberadaan JSDoc di berkas page.>

## Hasil Pengujian & Linting
- **Pint & ESLint**: [PASSED / FAILED] <Hasil eksekusi Pint dan ESLint lokal.>
- **Unit & Feature Test (Pest)**: [PASSED / FAILED] <Hasil eksekusi Pest test lokal.>

## Rekomendasi Tindakan (Action Items)
<Daftar perbaikan yang wajib diselesaikan sebelum modul ini dideploy. Gunakan format checklist checkbox.>
- [ ] <Detail tugas perbaikan ke-1 untukmu>
- [ ] <Detail tugas perbaikan ke-2, dst.>
```
