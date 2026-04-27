# Rekayasa Perangkat Lunak: Sistem Penelitian Terintegrasi

### Laravel 12 + React (Inertia.js)

Buku Perkuliahan / Panduan Kontribusi
Program Studi S1 Informatika - Universitas Ahmad Dahlan

---

## Daftar Isi

1. [Penjelasan Studi Kasus](#penjelasan-studi-kasus)
2. [Setup Environment (Persiapan Lingkungan)](#setup-environment)
3. [Git & GitHub Workflow (Manajemen Kolaborasi)](#git--github-workflow)
4. [Pemahaman Arsitektur (Laravel + Inertia)](#pemahaman-arsitektur)
5. [Panduan Backend & Frontend Terpadu](#panduan-backend--frontend-terpadu)
6. [Pengujian Kualitas (QA & Linting)](#pengujian-kualitas)
7. [Sinkronisasi Tugas Mingguan](#sinkronisasi-tugas-mingguan)

---

## Penjelasan Studi Kasus

Proyek mata kuliah ini adalah **Sistem Penelitian Terintegrasi (jurnal_mu)**. Sistem ini dirancang untuk mengintegrasikan berbagai proses utama dalam ekosistem penelitian, mulai dari pengajuan proposal, penilaian reviewer, pengelolaan kontrak, monitoring kemajuan, pelaporan luaran, hingga evaluasi akhir penelitian.

Sistem ini memiliki arsitektur **Role-Based Access Control (RBAC)** dengan hierarki:

- **Super Admin**: Mengelola seluruh universitas dan Admin Kampus.
- **Admin Kampus**: Mengelola pengguna dalam lingkup universitasnya saja.
- **User (Peneliti/Reviewer/dll)**: Mengelola data (seperti jurnal/proposal) miliknya sendiri.

Stack teknologi yang digunakan:

- **Backend**: Laravel 12, PHP 8.2+, MySQL
- **Frontend**: React 19, TypeScript, Inertia.js 2.0, Vite, Tailwind CSS 4, shadcn/ui

---

## Setup Environment

Sistem ini membutuhkan PHP dan Node.js karena menggunakan Laravel dan React secara bersamaan.

### 1. Kebutuhan Sistem

1. **PHP 8.2** atau lebih baru (Bisa menggunakan XAMPP terbaru).
2. **Composer** (PHP Package Manager).
3. **Node.js** (Versi 20 LTS atau lebih baru).
4. **Git** untuk version control.
5. **Visual Studio Code** (VS Code) dengan ekstensi PHP Intelephense, ESLint, dan Prettier.

### 2. Instalasi Proyek

1. Buka Terminal/Command Prompt.
2. Clone repository proyek (Ganti URL dengan repo kelas Anda):

    ```bash
    git clone https://github.com/organisasi-kelas/jurnal_mu.git
    cd jurnal_mu
    ```

3. Instal dependensi PHP:

    ```bash
    composer install
    ```

4. Instal dependensi Node.js (Frontend JavaScript/TypeScript):

    ```bash
    npm install
    ```

5. Konfigurasi Environment:
    - Copy file `.env.example` menjadi `.env`:
        ```bash
        cp .env.example .env
        ```
    - Buka file `.env`, atur koneksi database:
        ```env
        DB_CONNECTION=mysql
        DB_HOST=127.0.0.1
        DB_PORT=3306
        DB_DATABASE=jurnal_mu
        DB_USERNAME=root
        DB_PASSWORD=
        ```
    - Generate Application Key:
        ```bash
        php artisan key:generate
        ```

6. Siapkan Database:
    - Buat database MySQL dengan nama `jurnal_mu` (Bisa via phpMyAdmin di `http://localhost/phpmyadmin`).
    - Jalankan migrasi dan seeder untuk mengisi data awal:
        ```bash
        php artisan migrate:fresh --seed
        ```

### 3. Menjalankan Aplikasi

Karena kita menggunakan Laravel dan Vite (untuk React), Anda perlu membuka **dua terminal**.

**Terminal 1 (Backend PHP):**

```bash
php artisan serve
```

**Terminal 2 (Frontend Vite):**

```bash
npm run dev
```

Buka browser dan akses `http://localhost:8000`. Jika halaman login/dashboard tampil, instalasi berhasil!

---

## Git & GitHub Workflow

Mengembangkan perangkat lunak adalah pekerjaan tim. Kita menggunakan Git dan GitHub untuk kolaborasi.

### 1. Pembuatan dan Penamaan Branch

Jangan pernah langsung coding di branch `main`! Buat branch baru untuk setiap fitur/tugas.

Format penamaan branch: `fitur/nama_fitur_nim` atau `modul_nim`
Contoh: Anda ditugaskan membuat modul proposal penelitian (NIM: 2200018123)

```bash
# Pastikan Anda di branch utama yang up-to-date
git checkout main
git pull origin main

# Buat branch baru
git checkout -b proposal_penelitian_123
```

### 2. Commit dan Push Perubahan

Setelah Anda menulis kode dan memastikan berjalan baik:

1. **Stage changes:**
    ```bash
    git add .
    ```
2. **Commit changes:** (Beri pesan yang jelas tentang apa yang diubah)
    ```bash
    git commit -m "feat: Menambahkan form pengajuan proposal penelitian"
    ```
3. **Push ke remote repository:**
    ```bash
    git push origin proposal_penelitian_123
    ```

### 3. Pull Request (PR)

1. Buka GitHub repository kelas Anda.
2. Klik tombol **Compare & pull request** pada branch Anda.
3. Berikan deskripsi yang jelas tentang apa yang Anda kerjakan.
4. **Perhatian:** Proyek ini menggunakan GitHub Actions. Pastikan kode Anda lolos _linting_ (QA) sebelum PR bisa di-merge oleh Dosen/Asisten.

---

## Pemahaman Arsitektur (Laravel + Inertia)

Berbeda dengan Laravel klasik yang memakai Blade (seperti `return view('nama.blade')`), proyek ini menggunakan **Inertia.js**.
Inertia memungkinkan kita membuat aplikasi _Single Page Application (SPA)_ menggunakan React tanpa perlu memisahkan backend dan frontend menjadi dua proyek API yang berbeda.

### Alur Data

1. **Route** (`routes/web.php`): Menerima request HTTP.
2. **Middleware** (`CheckRole`): Memverifikasi apakah user (Admin/Dosen) berhak mengakses route.
3. **Controller**: Mengambil data dari Database (Eloquent) dan mereturn data ke Inertia.
    ```php
    // Contoh di Controller
    public function index() {
        $proposals = Proposal::all();
        return Inertia::render('Dosen/Proposal/Index', [
            'proposals' => $proposals
        ]);
    }
    ```
4. **React Component** (`resources/js/pages/Dosen/Proposal/Index.tsx`): Menerima data sebagai _props_ dan merendernya.

### Struktur Folder Penting

- `routes/web.php` : Rute dibagi berdasarkan role (`admin.*`, `admin-kampus.*`, `user.*`).
- `app/Http/Controllers/{Role}/` : Controller dikelompokkan berdasarkan folder role.
- `app/Policies/` : Menentukan izin (Authorization) misal: apakah dosen A boleh mengedit proposal B.
- `resources/js/pages/{Role}/` : Folder halaman React.
- `resources/js/components/` : Komponen React UI yang bisa dipakai ulang (Tombol, Modal, dll).

---

## Panduan Backend & Frontend Terpadu

### 1. Backend: Membuat Model & Controller

Gunakan artisan untuk mempercepat pembuatan file.

```bash
php artisan make:model Proposal -mrc
```

Ini akan membuat Model, Migration, Resource Controller.

**Aturan Kepemilikan (Penting!)**
Karena ini sistem multi-tenant, selalu perhatikan kepemilikan data.
Contoh saat dosen (User) menyimpan proposal:

```php
// User Controller
public function store(Request $request) {
    // Validasi data
    $validated = $request->validate([...]);

    // Pastikan proposal tersimpan dengan ID user yang sedang login
    $request->user()->proposals()->create($validated);

    // Redirect menggunakan Inertia
    return redirect()->route('user.proposals.index')->with('success', 'Proposal berhasil diajukan');
}
```

### 2. Frontend: Membuat Komponen React (TypeScript)

Halaman dibuat di `resources/js/pages/`. Gunakan TypeScript Type/Interface untuk mendefinisikan prop.

```tsx
// resources/js/pages/User/Proposal/Index.tsx
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

// Definisikan tipe data
interface Proposal {
    id: number;
    judul: string;
    status: string;
}

interface Props {
    proposals: Proposal[];
}

export default function ProposalIndex({ proposals }: Props) {
    return (
        <AppLayout>
            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Daftar Proposal Saya</h1>

                {/* Tombol dengan komponen Link Inertia (Pindah halaman tanpa reload) */}
                <Link href={route('user.proposals.create')} className="rounded bg-blue-500 px-4 py-2 text-white">
                    Buat Proposal Baru
                </Link>

                <div className="mt-4">
                    {proposals.map((prop) => (
                        <div key={prop.id} className="mb-2 border p-4">
                            {prop.judul} - {prop.status}
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
```

**Form Handling:**
Gunakan hook `useForm` dari Inertia.js untuk mengirim data input.

---

## Pengujian Kualitas (QA & Linting)

Proyek ini memiliki standar kode yang ketat. **Wajib dilakukan sebelum melakukan git commit!**

### 1. Merapikan Kode PHP (Laravel Pint)

```bash
# Untuk mengecek kesalahan format PHP
./vendor/bin/pint --test

# Untuk memperbaiki otomatis
./vendor/bin/pint
```

### 2. Merapikan Kode React/TypeScript (ESLint & Prettier)

Buka terminal baru untuk npm:

```bash
# Memperbaiki format TypeScript/JavaScript otomatis
npm run lint
npm run format

# Cek tipe TypeScript (Pastikan tidak ada error merah)
npm run types
```

Jika ada pesan error merah setelah menjalankan lint/types, perbaiki dulu di VS Code sebelum melakukan push.

### 3. Pengujian Fitur (Pest)

Menjalankan unit test PHP:

```bash
php artisan test
```

---

## Sinkronisasi Tugas Mingguan

Buku panduan ini mengacu pada tahapan implementasi yang ada pada Rencana Proyek:

- **Minggu 5–7 (Tahap 1)**
    - Pembuatan model dan manajemen data Dosen/Peneliti.
    - CRUD Modul Proposal Penelitian (Menggunakan Inertia Form).
    - Modul Reviewer (Otorisasi Policy untuk Reviewer).
- **Minggu 9–11 (Tahap 2)**
    - Modul Kontrak dan Pendanaan.
    - Modul Monitoring & Evaluasi.
    - Modul Luaran Penelitian (Upload file dan validasi tipe di Laravel).
- **Minggu 12 (Dashboard)**
    - Pembuatan Query agregasi kompleks.
    - Rendering Chart di React dari data props Inertia.

**Selamat Mengerjakan Proyek Anda!**
"Bring real-world experience into your class"
