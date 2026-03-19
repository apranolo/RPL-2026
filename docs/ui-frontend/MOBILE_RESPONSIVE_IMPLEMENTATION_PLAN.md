# Mobile Responsive Implementation Plan (Semua Page)

Tanggal: 18 Maret 2026  
Project: Jurnal MU (Laravel + Inertia React)

## 1. Ringkasan Eksekutif

Dokumen ini adalah rencana implementasi **mobile responsive view** berdasarkan analisis seluruh halaman pada `resources/js/pages`.

- Total file page yang dianalisis: **73 file** (di luar `__tests__`)
- Distribusi risiko responsive (heuristik code-scan + review manual):
  - **High**: 22 page
  - **Medium**: 6 page
  - **Low**: 45 page

Fokus implementasi: memperbaiki pengalaman mobile tanpa mengubah behavior bisnis, policy akses, atau alur data.

## 2. Cakupan Analisis

Analisis mencakup semua area berikut:

- `Admin/*`
- `AdminKampus/*`
- `User/*`
- `Dikti/*`
- `Journals/*` (public)
- `Browse/*`
- `auth/*`
- `settings/*`
- root pages (`dashboard.tsx`, `welcome.tsx`, `Resources.tsx`, `Support.tsx`)

## 3. Temuan Utama per Pola UI

### 3.1 Tabel padat kolom (risiko tertinggi)
Pola dominan pada halaman list management:
- Kolom > 5, aksi berderet (view/edit/delete/approve/reject), status badge, metadata panjang.
- Banyak page sudah punya `overflow-x-auto`, tetapi belum cukup untuk UX mobile yang nyaman (tetap padat/overflow panjang).

### 3.2 Baris filter horizontal fixed width
Pola umum:
- Filter/search masih `form className="flex gap-4"` dengan komponen `w-48`, `w-64`.
- Pada layar kecil, komponen saling dorong/terpotong dan tombol action turun tidak konsisten.

### 3.3 Header + action buttons belum mobile-first
- Header utama cenderung `justify-between` satu baris.
- Tombol CTA penting (Add/Search/Clear/Toggle) belum selalu punya fallback stack/wrap di mobile.

### 3.4 Tabs dan statistik ringkas
- Ditemukan `TabsList className="grid w-full grid-cols-4"` pada profil user.
- Potensi kepadatan label + badge di lebar 320–390px.

### 3.5 Halaman auth/settings relatif aman
- Sebagian besar layout single-column (`max-w-md`, `space-y-*`), risiko rendah.

## 4. Prinsip Implementasi (Standar Tim)

1. **Mobile-first**: style default untuk mobile, naik ke `sm/md/lg` untuk desktop.
2. **Minim perubahan behavior**: hanya layout/visual responsive.
3. **Reuse komponen existing** (shadcn/ui + Tailwind tokens), tanpa hardcode design token baru.
4. **Progressive disclosure** di mobile:
   - Kolom sekunder disembunyikan di mobile (`hidden md:table-cell`),
   - Data penting tetap terlihat,
   - Aksi utama tetap 1 tap.
5. **Aksesibilitas tetap terjaga**: focus state, touch target, label tombol ikon.

## 5. Arsitektur Solusi Responsive

### 5.1 Fondasi global (dikerjakan dulu)
- Standarisasi wrapper konten page:
  - `p-4 sm:p-6`
  - heading container menjadi `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
- Standarisasi form filter:
  - dari `flex gap-4` menjadi `flex flex-col gap-3 md:flex-row`
  - semua trigger/select fixed width diubah ke `w-full md:w-48` / `md:w-64`
- Standarisasi action group:
  - `flex flex-wrap gap-2`

### 5.2 Strategi tabel lintas role
- Desktop tetap table penuh.
- Mobile:
  - Opsi A (cepat): pertahankan table + `overflow-x-auto` + set `min-w-*` yang konsisten.
  - Opsi B (prioritas tinggi): render card list khusus mobile untuk tabel kompleks.
- Kolom prioritas mobile:
  - tampil: nama, status, metrik utama, aksi utama
  - sembunyi: metadata sekunder (last login, tanggal detail, kolom deskriptif panjang)

### 5.3 Pagination mobile
- Mobile tampil `Prev/Next` + ringkasan halaman.
- Desktop tetap nomor halaman penuh.

### 5.4 Tabs, dashboard, dan public pages
- Tabs: `grid-cols-2 sm:grid-cols-4` untuk profil user.
- Dashboard cards: pastikan base `grid-cols-1` + breakpoint bertahap.
- Public page navbar (`welcome`, `Journals/Index`): action login/register/dashboard disusun wrap/stack aman mobile.

## 6. Prioritas Implementasi (Backlog by Risk)

### P0 — High Risk (wajib dulu)
- AdminKampus/Users/Index.tsx
- Admin/AdminKampus/Index.tsx
- User/Journals/Show.tsx
- AdminKampus/Pembinaan/Index.tsx
- AdminKampus/Assessments/Index.tsx
- Admin/Universities/Index.tsx
- Admin/Journals/Index.tsx
- AdminKampus/Journals/Show.tsx
- Dikti/Assessments/Index.tsx
- Admin/Journals/Show.tsx
- AdminKampus/Journals/Index.tsx
- Admin/Users/Index.tsx
- Admin/BorangIndikator/Index.tsx
- User/Assessments/Index.tsx
- Admin/Pembinaan/Index.tsx
- Admin/Pembinaan/Show.tsx
- User/Journals/Index.tsx
- AdminKampus/Users/Show.tsx
- AdminKampus/Pembinaan/Show.tsx
- Admin/Users/Show.tsx
- User/Pembinaan/Registration.tsx
- Admin/AdminKampus/Show.tsx

### P1 — Medium Risk
- welcome.tsx
- dashboard.tsx
- Journals/Index.tsx
- Journals/Show.tsx
- User/Profil/Index.tsx
- User/Pembinaan/Index.tsx

### P2 — Low Risk
Semua page lain (45 file) dikerjakan setelah P0/P1 untuk hardening dan konsistensi.

## 7. Rencana Eksekusi Bertahap

### Phase 1 — Baseline & reusable patterns (Selesai)
- Menetapkan guideline utility class responsive dengan Tailwind:
  - **container page**: `flex flex-col gap-4 rounded-xl p-4`
  - **section header**: `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`
  - **filter form**: `flex flex-col gap-3 md:flex-row md:items-center` dan `flex-col sm:flex-row` pada action group.
  - **action group (CTA)**: `w-full sm:w-auto` untuk button agar full-width di mobile.
  - **input width**: mengganti w-48/w-64 menjadi `w-full md:w-48` / `w-full md:w-64`.
  - **table col priority**: sembunyikan kolom tersunder (`Contact`, `Journals`, `Last Login`) menggunakan `hidden lg:table-cell` atau `hidden md:table-cell`, pastikan scrollable dengan `overflow-x-auto min-w-[800px] md:min-w-full`.
- Terapkan ke 2 halaman referensi terbesar:
  - `AdminKampus/Users/Index.tsx` (Selesai)
  - `Admin/AdminKampus/Index.tsx` (Selesai)

### Phase 2 — High risk tables (Mulai Dikerjakan)
- Refactor halaman P0 berbasis tabel (admin/admin kampus/user list).
- Implement mobile card-view untuk tabel sangat padat (khusus page dengan aksi multi tombol).
  - **Batch 1 (Pioneer / Base logic)**
    - `Admin/Universities/Index.tsx` (Selesai)
    - `AdminKampus/Journals/Index.tsx` (Selesai)
  - **Batch 2 (Assessments Domain)**
    - `AdminKampus/Assessments/Index.tsx` (Selesai)
    - `Dikti/Assessments/Index.tsx` (Selesai)
    - `User/Assessments/Index.tsx` (Selesai)
- Pastikan tombol aksi tetap dapat dijangkau ibu jari (thumb-friendly).

### Phase 3 — Medium risk pages (2–3 hari)
- Refactor `welcome`, `dashboard`, `Journals/Index`, `Journals/Show`, `User/Profil/Index`, `User/Pembinaan/Index`.
- Fokus pada tabs, navbar, section spacing, dan card grid.

### Phase 4 — Low risk hardening + QA (2–3 hari)
- Sweep seluruh P2 untuk konsistensi spacing/wrapping.
- Regression test lintas role + dark mode.

Estimasi total: **10–15 hari kerja** (tergantung kapasitas tim & parallelisasi).

## 8. Checklist Implementasi per Halaman (Template)

Gunakan checklist berikut saat mengerjakan setiap page:

- Header dan CTA tidak overflow di lebar 320px.
- Filter/search stack rapi (`flex-col` mobile, `flex-row` desktop).
- Select/Input fixed-width diganti `w-full md:w-*`.
- Tabel:
  - kolom penting tetap terlihat,
  - kolom sekunder di-hide di mobile,
  - aksi utama tetap visible.
- Pagination mobile tidak terlalu padat.
- Empty state dan flash message tetap proporsional.

## 9. QA & Acceptance Criteria

### 9.1 Viewport wajib uji
- 320x568 (small mobile)
- 375x812 (iPhone modern baseline)
- 768x1024 (tablet)
- >=1024 (desktop)

### 9.2 Acceptance Criteria global
- Tidak ada horizontal scroll pada container utama (kecuali table wrapper yang memang diizinkan).
- Tidak ada elemen penting terpotong.
- Semua tombol aksi utama dapat diakses tanpa zoom.
- Tidak ada regression fungsi CRUD/filter/pagination.

### 9.3 Test strategy
- Manual exploratory per role: Super Admin, Admin Kampus, User, Public.
- Validasi visual dark/light mode.
- Tambah smoke checklist di docs testing setelah implementasi phase selesai.

## 10. Risiko & Mitigasi

- Risiko: perubahan table layout mempengaruhi kecepatan akses data.  
  Mitigasi: pertahankan desktop table penuh; card-view hanya mobile.

- Risiko: inkonsistensi antar halaman karena implementasi bertahap.  
  Mitigasi: lock pattern class dan lakukan PR review dengan checklist yang sama.

- Risiko: scope melebar ke redesign UI.  
  Mitigasi: batasi ke responsive behavior, bukan redesign visual total.

## 11. Lampiran A — Inventaris Page Hasil Analisis

Status berikut merepresentasikan semua 73 page yang dianalisis.

### HIGH
- AdminKampus/Users/Index.tsx
- Admin/AdminKampus/Index.tsx
- User/Journals/Show.tsx
- AdminKampus/Pembinaan/Index.tsx
- AdminKampus/Assessments/Index.tsx
- Admin/Universities/Index.tsx
- Admin/Journals/Index.tsx
- AdminKampus/Journals/Show.tsx
- Dikti/Assessments/Index.tsx
- Admin/Journals/Show.tsx
- AdminKampus/Journals/Index.tsx
- Admin/Users/Index.tsx
- Admin/BorangIndikator/Index.tsx
- User/Assessments/Index.tsx
- Admin/Pembinaan/Index.tsx
- Admin/Pembinaan/Show.tsx
- User/Journals/Index.tsx
- AdminKampus/Users/Show.tsx
- AdminKampus/Pembinaan/Show.tsx
- Admin/Users/Show.tsx
- User/Pembinaan/Registration.tsx
- Admin/AdminKampus/Show.tsx

### MEDIUM
- welcome.tsx
- dashboard.tsx
- Journals/Index.tsx
- Journals/Show.tsx
- User/Profil/Index.tsx
- User/Pembinaan/Index.tsx

### LOW
- User/Journals/Create.tsx
- AdminKampus/Journals/Edit.tsx
- User/Journals/Edit.tsx
- AdminKampus/Journals/Create.tsx
- AdminKampus/Journals/Import.tsx
- Admin/Universities/Show.tsx
- Admin/Reviewers/Index.tsx
- User/Assessments/Create.tsx
- User/Assessments/Show.tsx
- Browse/Universities.tsx
- Admin/Universities/Edit.tsx
- Admin/Universities/Create.tsx
- Admin/Pembinaan/Edit.tsx
- Admin/Pembinaan/Create.tsx
- AdminKampus/Assessments/Show.tsx
- User/Pembinaan/Show.tsx
- User/Profil/Edit.tsx
- User/Pembinaan/Register.tsx
- Admin/BorangIndikator/List.tsx
- Errors/403.tsx
- auth/login.tsx
- AdminKampus/Users/Edit.tsx
- auth/register.tsx
- AdminKampus/Users/Create.tsx
- Dikti/Assessments/Show.tsx
- Admin/AdminKampus/Create.tsx
- settings/profile.tsx
- Admin/Users/Edit.tsx
- Admin/Users/Create.tsx
- AdminKampus/Assessments/Review.tsx
- Admin/AdminKampus/Edit.tsx
- User/Assessments/Edit.tsx
- auth/reset-password.tsx
- auth/googleCallback.tsx
- Resources.tsx
- Support.tsx
- settings/appearance.tsx
- settings/password.tsx
- auth/verify-email.tsx
- Admin/Assessments/Index.tsx
- AdminKampus/Reviewer/Index.tsx
- Admin/DataMaster/Index.tsx
- Admin/BorangIndikator/Tree.tsx
- auth/forgot-password.tsx
- auth/confirm-password.tsx
