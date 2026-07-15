# Technical Design Document (TDD) & Developer Guide
## Laravel 12 + Inertia.js + React

Dokumen ini adalah panduan teknis implementasi *coding* untuk memastikan semua pengembang dalam tim berada di halaman yang sama menyangkut arsitektur MVC (Model-View-Controller) dan integrasi React.

### 1. Pola Arsitektur MVC & Entitas Data
Dalam pengerjaan tugas, sangat dilarang memisahkan pembuatan Tabel dengan Pembuatan Model. Pekerjaan ini adalah **satu entitas Data Layer**.
- **Migration (Tabel)**: Bertugas mendefinisikan nama tabel (`snake_case`) dan tipe data kolom mutlak.
- **Model**: Mengimplementasikan representasi tabel di PHP. Wajib mencantumkan variabel `$fillable` (untuk mass-assignment protection) dan `$casts` jika ada data JSON/Tanggal.
- **Relasi**: Setiap membuat sebuah Model (misal: `Proposal`), pastikan mendefinisikan *foreign key* dan method relasi (`belongsTo(User::class)`, `hasMany(Review::class)`).
**Gunakan command ini untuk _generate_ sekaligus:**
`php artisan make:model NamaModel -m -f -s` (Membuat Model, Migration, Factory, Seeder).

### 2. Aliran Data: Laravel ➡ Inertia ➡ React
Aplikasi SPA ini tidak menggunakan metode `fetch/axios` secara tradisional ke bentuk `api.php`. Kita menggunakan **Inertia.js** yang mengirimkan data dari Controller langsung sebagai *Props* ke komponen React.

**A. Sisi Controller (Backend)**
Gunakan `Inertia::render()` di dalam Controller.
```php
public function index() {
    $proposals = Proposal::with('user')->get();
    // Mengacu ke file: resources/js/pages/Proposal/Index.tsx
    return Inertia::render('Proposal/Index', [
        'proposals' => $proposals 
    ]);
}
```

**B. Sisi View / Komponen (Frontend React)**
Wajib menyediakan tipe data TypeScript (`interface Props`) yang merujuk persis seperti data yang dikirimkan Controller.
```tsx
import { PageProps } from '@/types';

// Definisi Struktur Props yang diterima
interface Proposal {
    id: number;
    judul_penelitian: string;
    status_proposal: string;
    user: { name: string; };
}

interface Props extends PageProps {
    proposals: Proposal[];
}

export default function ProposalIndex({ proposals }: Props) {
    return (
        <div>
            {proposals.map(prop => <h1 key={prop.id}>{prop.judul_penelitian}</h1>)}
        </div>
    );
}
```

### 3. Penugasan Controller dan View
Jika Anda menerima tugas pembuatan **Method Controller**, Anda bertanggung jawab atas pemfilteran, Query Database (via Model), dan Security (Validasi/Otorisasi).
Jika Anda menerima tugas pembuatan **View**, Anda fokus ke sisi *Styling, Antarmuka (UI)* dan penggunaan React Hooks dari Props (`useForm()`, menampilkan error Inertia).

### 4. Hal yang Wajib Dihindari!
- ❌ Jangan meletakkan Query *SQL/Eloquent* kompleks di View React.
- ❌ Jangan menulis field UI Form yang tidak *match* (nama `<input name="XX">`) dengan struktur kolom database aslinya.
- ❌ Jangan melanjutkan coding jika struktur tipe data dari teman yang memegang tugas *Migration/Model* belum disetujui bersama.
