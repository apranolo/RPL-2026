# RPL-2026

# Proyek Besar Sistem Penelitian Terintegrasi

## Deskripsi Umum

Sistem Penelitian Terintegrasi adalah proyek mata kuliah Rekayasa Perangkat Lunak (RPL) di Program Studi S1 Informatika Universitas Ahmad Dahlan (UAD). Proyek ini bertujuan untuk merancang dan membangun sebuah platform digital yang mendukung pengelolaan aktivitas penelitian secara terpadu, terstruktur, dan terdokumentasi, serupa dengan platform seperti **bima.kemdiktisaintek.go.id** atau **risetmu.id**.

Dari sudut pandang perangkat lunak, sistem ini dirancang untuk mengintegrasikan berbagai proses utama dalam ekosistem penelitian, mulai dari pengajuan proposal, penilaian reviewer, pengelolaan kontrak, monitoring kemajuan, pelaporan luaran, hingga evaluasi akhir penelitian.

Sistem ini diharapkan mampu membantu perguruan tinggi, lembaga penelitian, atau organisasi dalam mengelola data penelitian secara efisien, transparan, dan terdokumentasi dengan baik.

## Cakupan Sistem

Sistem Penelitian Terintegrasi mencakup beberapa modul utama, yaitu:

### 1. Manajemen Proposal Penelitian

Modul ini digunakan untuk mengelola proses pengajuan proposal penelitian oleh dosen atau peneliti. Fitur yang dapat dikembangkan antara lain:

- Pengisian data proposal penelitian
- Upload dokumen proposal
- Validasi administrasi
- Pengelompokan skema penelitian
- Riwayat pengajuan proposal

### 2. Manajemen Reviewer dan Penilaian

Modul ini mendukung proses review proposal dan evaluasi penelitian. Fitur yang dapat dikembangkan antara lain:

- Penunjukan reviewer
- Pengaturan jadwal review
- Form penilaian proposal
- Rekap hasil review
- Keputusan diterima atau ditolak

### 3. Manajemen Kontrak dan Pendanaan

Modul ini digunakan untuk mengelola kontrak penelitian yang lolos seleksi dan pendanaannya. Fitur yang dapat dikembangkan antara lain:

- Data kontrak penelitian
- Informasi nominal pendanaan
- Tahapan pencairan dana
- Status kontrak aktif atau selesai
- Monitoring administrasi keuangan penelitian

### 4. Monitoring dan Evaluasi Penelitian

Modul ini mendukung pemantauan pelaksanaan penelitian selama periode berjalan. Fitur yang dapat dikembangkan antara lain:

- Laporan kemajuan penelitian
- Upload dokumen monitoring
- Catatan evaluasi reviewer atau pengelola
- Jadwal monitoring dan evaluasi
- Status progres penelitian

### 5. Manajemen Luaran Penelitian

Modul ini digunakan untuk mencatat hasil atau luaran penelitian. Fitur yang dapat dikembangkan antara lain:

- Input publikasi ilmiah
- Data HKI/paten
- Produk/prototipe penelitian
- Buku ajar atau modul
- Seminar atau diseminasi hasil penelitian

### 6. Dashboard dan Pelaporan

Modul ini menyediakan informasi ringkas dalam bentuk dashboard dan laporan. Fitur yang dapat dikembangkan antara lain:

- Statistik jumlah proposal
- Statistik penelitian aktif dan selesai
- Rekap pendanaan
- Rekap luaran penelitian
- Grafik performa penelitian per tahun atau per fakultas

## Tujuan Proyek

Proyek ini memiliki beberapa tujuan utama, yaitu:

- Membantu mahasiswa memahami proses pengembangan perangkat lunak skala besar.
- Melatih mahasiswa dalam menganalisis kebutuhan sistem berbasis dunia nyata.
- Mengembangkan kemampuan mahasiswa dalam merancang arsitektur sistem, basis data, antarmuka, dan alur kerja aplikasi.
- Mendorong kerja tim dalam pengembangan perangkat lunak secara terstruktur.
- Menghasilkan prototipe sistem penelitian yang bermanfaat dan relevan dengan kebutuhan institusi.

## Aktor dalam Sistem

Beberapa aktor utama yang terlibat dalam sistem ini antara lain:

- **Admin Sistem**: mengelola data master, pengguna, skema penelitian, dan konfigurasi sistem.
- **Peneliti/Dosen**: mengajukan proposal, mengunggah laporan kemajuan, dan melaporkan luaran penelitian.
- **Reviewer**: menilai proposal dan memberikan evaluasi terhadap penelitian.
- **Pimpinan/LPPM**: memantau keseluruhan proses penelitian, melihat dashboard, dan mengambil keputusan.
- **Keuangan/Operator**: mengelola informasi pendanaan dan administrasi kontrak.

## Luaran yang Diharapkan

Setiap tim diharapkan menghasilkan:

- Dokumen analisis kebutuhan sistem
- Dokumen use case atau user story
- Desain basis data
- Desain antarmuka sistem
- Implementasi aplikasi
- Dokumentasi API atau alur modul
- Laporan akhir proyek
- Presentasi hasil proyek

## Rekomendasi Teknologi

Mahasiswa dapat memilih teknologi yang sesuai, misalnya:

- **Frontend**: React, Vue, atau Laravel Blade
- **Backend**: Laravel
- **Database**: MySQL, PostgreSQL
- **Version Control**: GitHub
- **Deployment**: VPS, Docker, atau cloud server

## Metodologi Pengembangan

Proyek dapat dikembangkan menggunakan pendekatan berikut:

- Analisis kebutuhan
- Perancangan sistem
- Implementasi
- Pengujian
- Presentasi dan evaluasi

Model pengembangan Waterfall, sesuai arahan dosen pengampu.

## TIMELINE

### Minggu 1: Inisiasi Proyek

- Pembentukan tim
- Penentuan topik dan ruang lingkup proyek
- Diskusi awal kebutuhan sistem
- Pembagian peran anggota tim

### Minggu 2: Analisis Kebutuhan

- Identifikasi masalah dan kebutuhan pengguna
- Penyusunan kebutuhan fungsional dan nonfungsional
- Identifikasi aktor sistem
- Penyusunan use case awal

### Minggu 3: Perancangan Sistem

- Perancangan arsitektur sistem
- Perancangan basis data
- Pembuatan diagram UML
- Pembuatan wireframe atau mockup antarmuka

### Minggu 4: Validasi Desain

- Review kebutuhan dan desain
- Revisi struktur database dan alur sistem
- Finalisasi desain modul utama

### Minggu 5–7: Implementasi Tahap 1

- Pengembangan modul autentikasi dan manajemen pengguna
- Pengembangan modul proposal penelitian
- Pengembangan modul reviewer dan penilaian

### Minggu 8: Evaluasi Tengah Proyek

- Presentasi progres sementara
- Demo modul yang sudah berjalan
- Evaluasi dosen pengampu

### Minggu 9–11: Implementasi Tahap 2

- Pengembangan modul kontrak dan pendanaan
- Pengembangan modul monitoring dan evaluasi
- Pengembangan modul luaran penelitian

### Minggu 12: Pengembangan Dashboard dan Laporan

- Implementasi dashboard statistik
- Pembuatan fitur laporan dan rekap data
- Penyempurnaan antarmuka pengguna

### Minggu 13: Pengujian Sistem

- Pengujian fungsional
- Perbaikan bug
- Uji coba integrasi antar modul

### Minggu 14: Finalisasi Produk

- Penyempurnaan dokumentasi
- Finalisasi presentasi
- Persiapan demo akhir

### Minggu 15: Presentasi Akhir

- Presentasi hasil proyek
- Demonstrasi sistem
- Penyerahan dokumen dan source code

## Penutup

Melalui proyek ini, mahasiswa diharapkan tidak hanya mampu membuat aplikasi, tetapi juga memahami bagaimana sebuah sistem informasi skala besar dirancang untuk mendukung proses bisnis nyata. Sistem Penelitian Terintegrasi menjadi sarana pembelajaran yang relevan untuk melatih kemampuan analisis, desain, implementasi, kolaborasi tim, dan penyelesaian masalah dalam pengembangan perangkat lunak.
