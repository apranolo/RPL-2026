# RPL-2026 — Proyek Besar Kelas G
# Submission System Terintegrasi (Berbasis OJS)

## Deskripsi Umum

Submission System Terintegrasi adalah proyek mata kuliah Rekayasa Perangkat Lunak (RPL) untuk **Kelas G** di Program Studi S1 Informatika Universitas Ahmad Dahlan (UAD). Proyek ini merupakan **ekstensi dan integrasi** dari proyek **JurnalMu** yang dikerjakan oleh Kelas B, dengan menambahkan lapisan "Dapur Redaksi" (*editorial workflow*) yang terinspirasi dari platform **Open Journal Systems (OJS)** — salah satu platform manajemen penerbitan jurnal ilmiah open-source paling banyak digunakan di dunia ([https://pkp.sfu.ca/software/ojs/](https://pkp.sfu.ca/software/ojs/)).

Proyek ini bertujuan mengubah JurnalMu dari sekadar *portal publikasi* (menampilkan artikel yang sudah terbit) menjadi sebuah **Platform Penerbitan Jurnal Ilmiah yang Lengkap (End-to-End)** — mulai dari penulis men-submit naskah pertama kali, melalui proses editorial dan peer review yang ketat, hingga artikel terbit dan terindeks di portal publik.

Sistem ini diharapkan mampu memodelkan proses penerbitan jurnal ilmiah akademik secara nyata, transparan, dan terdokumentasi dengan baik.

---

## Posisi Proyek dalam Ekosistem JurnalMu

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLATFORM JURNALMU (Penuh)                    │
│                                                                 │
│  ┌─────────────────────────┐   ┌─────────────────────────────┐  │
│  │   KELAS B — Backend     │   │   KELAS G — Submission      │  │
│  │   Sistem Penelitian     │   │   System (OJS-like)         │  │
│  │   Terintegrasi          │   │                             │  │
│  │  (Proposal, Reviewer,   │   │  (Submit Artikel → Review   │  │
│  │   Kontrak, Monev,       │   │   → Edit → Publish)         │  │
│  │   Luaran, Dashboard)    │   │                             │  │
│  └────────────┬────────────┘   └──────────────┬──────────────┘  │
│               │                               │                 │
│               └───────────┬───────────────────┘                 │
│                           │                                     │
│              ┌────────────▼────────────┐                        │
│              │   PORTAL PUBLIK         │                        │
│              │   JurnalMu              │                        │
│              │   (Artikel Terbit)      │                        │
│              └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cakupan Sistem — 7 Modul Utama

Sistem Submission Terintegrasi mencakup **7 modul** yang merepresentasikan alur lengkap penerbitan jurnal ilmiah:

---

### Modul 1: Manajemen Peran & Profil Pengguna (Role Management)

Modul fondasi yang menyediakan sistem autentikasi dan otorisasi berbasis peran (*Role-Based Access Control*) yang mampu menangani kompleksitas peran di lingkungan penerbitan jurnal. Fitur yang dikembangkan antara lain:

* Sistem peran multi-level: Author, Editor, Section Editor, Reviewer, Copyeditor, Production Editor, Admin
* Satu akun dapat memiliki multi-peran di jurnal yang berbeda
* Halaman profil khusus Author (ORCID, Afiliasi, Bidang Keahlian)
* Halaman profil Reviewer (Keahlian, Track record review)
* Manajemen persetujuan & penolakan undangan peran
* Middleware guard per peran untuk proteksi route

---

### Modul 2: Author Submission Wizard (Proses Submit Artikel)

Modul tempat penulis (Author) mengirimkan naskah ilmiahnya melalui antarmuka *multi-step wizard* yang terstruktur. Fitur yang dikembangkan antara lain:

* **Step 1 — Start**: Pemilihan Jurnal tujuan, persetujuan syarat & ketentuan (*Author Guidelines*), persetujuan lisensi *Copyright*
* **Step 2 — Upload Submission**: Upload file naskah utama (Word/PDF), upload file tambahan (*supplementary files*: dataset, gambar, dll)
* **Step 3 — Enter Metadata**: Pengisian metadata artikel (Judul, Abstrak, Kata Kunci), bahasa artikel, dan daftar referensi
* **Step 4 — Add Contributors**: Manajemen data Co-Authors (nama, email, afiliasi, ORCID)
* **Step 5 — Confirm**: Rangkuman & konfirmasi submit
* *Tracking* status naskah ("Draft → Submitted → In Review → Decision")
* Halaman daftar seluruh submission milik Author

---

### Modul 3: Editorial Desk & Assignment (Dashboard Editor)

Modul pusat kendali Editor dalam menerima dan mendistribusikan naskah masuk. Fitur yang dikembangkan antara lain:

* Inbox naskah baru (Queue Management)
* Proses *Desk Review*: Accept for Review / Desk Reject langsung tanpa review
* Penugasan *Section Editor* untuk naskah tertentu
* Alur komunikasi diskusi internal antara Editor dan Author
* Pemeriksaan kelengkapan (Checklist validasi administrasi naskah)
* Integrasi upload hasil cek plagiasi (Turnitin PDF / laporan persentase)
* *Round tracking* — sistem melacak naskah yang masuk ke putaran review ke-2, ke-3, dst.

---

### Modul 4: Peer Review System (Sistem Tinjauan Sejawat)

Ini adalah jantung dari seluruh Submission System. Modul ini mengelola proses peninjauan naskah oleh pakar bidang. Fitur yang dikembangkan antara lain:

* Pemilihan kandidat Reviewer (berdasarkan keahlian / keyword)
* Pengiriman undangan review dengan batas waktu (due date)
* Tombol *Accept / Decline* undangan oleh Reviewer (beserta alasan penolakan)
* Sistem *Double-Blind Review* (menyembunyikan identitas Author dari Reviewer & sebaliknya)
* Formulir penilaian artikel dengan rubrik terstandar
* Rekomendasi akhir Reviewer: *Accept / Minor Revision / Major Revision / Reject*
* Pengarsipan versi file yang direview per putaran

---

### Modul 5: Revision & Copyediting Workflow (Revisi & Penyuntingan)

Modul komunikasi dan manajemen revisi antara Author, Editor, dan Copyeditor setelah hasil review. Fitur yang dikembangkan antara lain:

* Author mendapatkan notifikasi hasil keputusan (*Decision Notification*)
* Author mengunggah file naskah revisi (*Revised Manuscript*)
* Versioning dokumen: sistem menyimpan histori semua versi naskah per ronde (Ronde 1, Ronde 2, dst.)
* Tahap *Copyediting*: Copyeditor memperbaiki tata bahasa, format, dan gaya selingkung
* Alur diskusi (*Discussion Thread*) khusus per tahap: Editorial Discussion & Copyediting Discussion
* Persetujuan final copyedited version sebelum masuk tahap produksi

---

### Modul 6: Production & Issue Management (Produksi & Manajemen Terbitan)

Modul pengelolaan artikel yang telah melewati seluruh tahap editorial dan siap diterbitkan. Fitur yang dikembangkan antara lain:

* Pembuatan *Issue* (Terbitan) baru: Volume, Nomor, Tahun, Deskripsi
* Antrian artikel yang siap diterbitkan (*Schedulled Articles Queue*)
* Penempatan artikel ke dalam keranjang *Issue* tertentu
* Upload *Galley* (versi final terbitan): PDF, HTML, XML
* Penetapan nomor halaman, DOI, dan metadata terbitan
* *Publish* satu artikel atau satu *Issue* secara serentak
* Manajemen *Back Issues* (arsip terbitan lama)

---

### Modul 7: Notifikasi, Komunikasi & Diskusi Internal

Modul infrastruktur yang menghubungkan komunikasi antar semua pemangku peran dalam sistem. Fitur yang dikembangkan antara lain:

* Sistem notifikasi *in-app* (Bell Notification) untuk semua event penting
* Template email otomatis (konfigurabel) untuk setiap tahap workflow
* *Discussion Board* berbasis per-submission: Editor ↔ Author, Editor ↔ Reviewer
* *Announcement* sistem untuk pengumuman global (Jadwal Open Call, Kebijakan baru)
* Log aktivitas (*Activity Log*) yang mencatat setiap aksi oleh setiap pengguna pada sebuah submission

---

## Tujuan Proyek

* Memahami proses pengembangan perangkat lunak skala besar melalui kolaborasi tim.
* Memodelkan alur kerja (*workflow*) bisnis dunia nyata yang kompleks (penerbitan jurnal ilmiah akademik).
* Mengembangkan kemampuan mahasiswa dalam merancang sistem *state machine* (perubahan status yang terkontrol).
* Melatih integrasi antar modul dalam satu *codebase* (monolith) atau antar tim (API-based).
* Menghasilkan prototipe sistem manajemen artikel (*Article Management System*) yang siap digunakan sebagai demonstrasi kepada institusi.

---

## Aktor dalam Sistem

| Peran | Deskripsi Singkat |
| :--- | :--- |
| **Admin Sistem** | Mengelola konfigurasi jurnal, pengguna, dan pengaturan global sistem |
| **Editor-in-Chief** | Menerima naskah masuk, melakukan desk review, membuat keputusan final |
| **Section Editor** | Mengelola naskah pada bidang tertentu, menugaskan reviewer |
| **Reviewer** | Menerima undangan, mengisi formulir penilaian, memberikan rekomendasi |
| **Author / Penulis** | Mengirimkan naskah, mengikuti proses revisi, merespons keputusan editorial |
| **Copyeditor** | Menyunting tata bahasa dan format naskah yang sudah diterima |
| **Production Editor** | Mengelola galley final dan proses penerbitan *Issue* |

---

## Luaran yang Diharapkan

Setiap tim/modul diharapkan menghasilkan:

* Dokumen analisis kebutuhan (*PRD per Modul*)
* Desain basis data (*ERD & Migration Files*)
* Desain antarmuka sistem (*Wireframe & Implementasi React*)
* Implementasi *Backend* (Controller, Model, Request, Service)
* Implementasi *Frontend* (React/Inertia Pages & Components)
* Dokumentasi API atau alur modul
* Laporan akhir proyek & presentasi hasil

---

## Rekomendasi Teknologi

Mengikuti stack yang sudah berjalan pada proyek JurnalMu (Kelas B):

| Layer | Teknologi |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript + Inertia.js |
| **Backend** | Laravel 11 |
| **Database** | MySQL |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Version Control** | GitHub (branch strategy: `feature/{nomor_nim}_{nama_fitur}`) |
| **File Storage** | Laravel Storage / MinIO (lokal) |
| **Email** | Laravel Mailable + Mailtrap (untuk development) |

---

## Metodologi Pengembangan

Model pengembangan yang digunakan adalah **Waterfall** sesuai arahan dosen pengampu, dengan tahapan:

1. Analisis Kebutuhan
2. Perancangan Sistem
3. Implementasi
4. Pengujian
5. Presentasi dan Evaluasi

---

## TIMELINE

### Minggu 1: Inisiasi Proyek
* Pembentukan tim berdasarkan modul
* Studi referensi OJS dan pemahaman fitur
* Diskusi awal kebutuhan sistem per modul

### Minggu 2: Analisis Kebutuhan
* Identifikasi aktor, use case, dan user story per modul
* Penyusunan kebutuhan fungsional dan nonfungsional
* Finalisasi PRD per modul

### Minggu 3: Perancangan Sistem
* Perancangan arsitektur sistem dan integrasi antar modul
* Perancangan ERD dan database schema
* Pembuatan wireframe antarmuka per fitur

### Minggu 4: Validasi Desain
* Review kebutuhan dan desain antar tim
* Revisi struktur database dan alur status (state machine)
* Finalisasi desain modul utama

### Minggu 5–7: Implementasi Tahap 1
* Implementasi Modul 1 (Role & Auth)
* Implementasi Modul 2 (Author Submission Wizard)
* Implementasi Modul 3 (Editorial Desk)

### Minggu 8: Evaluasi Tengah Proyek
* Presentasi progres sementara
* Demo modul yang sudah berjalan
* Evaluasi dosen pengampu

### Minggu 9–11: Implementasi Tahap 2
* Implementasi Modul 4 (Peer Review System)
* Implementasi Modul 5 (Revision & Copyediting)
* Implementasi Modul 6 (Production & Issue)

### Minggu 12: Pengembangan Notifikasi & Komunikasi
* Implementasi Modul 7 (Notifikasi & Diskusi)
* Penyempurnaan antarmuka pengguna

### Minggu 13: Pengujian Sistem
* Pengujian fungsional per modul
* Pengujian integrasi antar modul
* Perbaikan bug dan edge case

### Minggu 14: Finalisasi Produk
* Penyempurnaan dokumentasi
* Finalisasi presentasi
* Persiapan demo akhir

### Minggu 15: Presentasi Akhir
* Presentasi hasil proyek
* Demonstrasi sistem end-to-end (simulasi alur submit → terbit)
* Penyerahan dokumen dan source code

---

## Penutup

Melalui proyek Submission System ini, mahasiswa Kelas G diharapkan tidak hanya mampu membuat aplikasi, tetapi juga memahami bagaimana proses bisnis penerbitan jurnal ilmiah yang sesungguhnya berjalan. Sistem ini menjadi sarana pembelajaran yang sangat relevan untuk melatih kemampuan analisis alur kerja (*workflow*), manajemen *state*, desain komunikasi multi-aktor, kolaborasi tim, dan implementasi fitur-fitur skala enterprise dalam pengembangan perangkat lunak.
