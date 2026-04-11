# Meeting Notes - Rapat Koordinasi 2 (Impromptu Session)
**Tanggal**: 11 April 2026  
**Status**: Evaluasi Adopsi Jurnalmu.org & Sinkronisasi OAI  
**Recording**: [View Recording](https://fathom.video/share/EripMJzuWZdvjynB9rvN6xZuHeDnz_6N)

---

## 📋 Ringkasan Prioritas

Pertemuan evaluasi progres implementasi dan adopsi Jurnalmu.org oleh 21 PTMA. Fokus utama pada **panduan pengguna baru**, **alur persetujuan (approval workflow)**, dan **troubleshooting sinkronisasi artikel via OAI-PMH**.

**Key Decision**: Semua jurnal dari 21 PTMA harus sudah terdaftar dan tersinkronisasi paling lambat **30 April 2026**.

**Critical Status**:
- ⚠️ **Low Adoption**: Baru 3 dari 21 PTMA yang mulai menginput data jurnal (UM Palembang: 25, UM Bengkulu: 14, UAD: 7).
- 🔄 **OAI Sync Issues**: Kegagalan sinkronisasi umumnya disebabkan oleh endpoint OAI-PMH yang bermasalah di sisi server OJS penyedia jurnal (kampus), bukan bug pada sistem Jurnalmu.org.
- 👥 **Dual-Approval**: Akun pengelola jurnal dan entri jurnal baru harus melalui *approval* oleh Admin LPPM kampus untuk menjaga kualitas data.

---

## 🎯 Strategic Focus

### 1. System Overview & Vision
- **Tujuan Utama**: Menciptakan katalog terpusat dan mesin pencari (search engine) untuk seluruh jurnal PTMA, dengan visi di masa depan menyerupai *ScienceDirect*.
- **Fitur Utama Terkini**:
  - **LPPM Dashboard**: Menyediakan peta jurnal tingkat kampus (status Sinta, bidang ilmu, dan indeksasi).
  - **Article Search**: Menarik/menyedot metadata artikel (judul, abstrak) dan potensi menampilkan akses *full-text* PDF dari jurnal terdaftar secara *seamless*.
  - **Conference Catalog**: Modul baru untuk katalog konferensi/seminar PTMA siap dirilis dan digunakan (deploy akhir pekan ini).
  - **Future Tools**: Rencana integrasi dengan alat/sistem asesmen online (seperti model Arjuna) dan form dukungan akreditasi.

### 2. User Roles & Workflow (Dual-Approval)
- **Admin LPPM**:
  - Mendaftar akun → Di-*approve* oleh Administrator Sistem (Majelis Dikti).
  - Menyetujui (*approve*) pendaftaran akun pengelola jurnal turunan di fakultas/prodi yang menginduk ke kampus.
  - Menyetujui setiap identitas entri jurnal yang didaftarkan.
  - Memiliki akses untuk bisa langsung mendaftarkan jurnal secara *bypass*.
- **Pengelola Jurnal (Journal Manager)**:
  - Mendaftar akun → Di-*approve* oleh Admin LPPM Universitas.
  - Menginput kelengkapan detail jurnal dan menginisiasi proses sinkronisasi pemuatan artikel.

### 3. Live Demo & OAI-PMH Sync
- **Simulasi (Demo UMS)**: Menunjukkan alur persetujuan Admin LPPM dan proses entri mendaftarkan jurnal.
- **Cara Sinkronisasi OAI-PMH**:
  - Tambahkan URL endpoint OAI-PMH (contoh format: `journal.org/index.php/journal/oai`) saat mendaftarkan detail jurnal baru.
  - Klik tombol **"Sinkron Artikel"** pada menu dropdown *Action* -> *View* di tabel data jurnal terdaftar.
  - OAI-PMH sync otomatis terintegrasi menggunakan fitur *Queue/Job* jadwal tersistem, mencegah load terlalu tinggi di waktu bersamaan (server *overload*).

### 4. Troubleshooting: Kegagalan Sinkronisasi (Sync Failures)
- **Laporan Kendala**: LPPM UM Palembang menginformasikan 5-6 jurnal gagal tarik data/sinkronisasi artikel.
- **Analisis Penyebab**: Kegagalan berpusat pada kendala putus koneksi endpoint OAI-PMH bawaan OJS laman sumber jurnal itu sendiri. Format standarnya sama seperti pengecekan kelayakan pengajuan Sinta/Garuda.
- **Tindakan**:
  - Catat dan laporkan URL jurnal yang bermasalah kepada tim teknis Jurnalmu (Tim Pak Andri) untuk diagnosa pengecekan lanjutan.
  - Tetap masukkan/daftar detail identitas ke direktori Jurnalmu terlebih dahulu tanpa sync OAI agar katalog universitas tetap lengkap. (Direncanakan sinkron manual lanjutan).

---

## 🏃‍♂️ Action Items (To-Do)

- [ ] **Seluruh 21 LPPM PTMA**: Segera mendaftarkan paling tidak *satu* akun Admin LPPM, dan lanjut berkoordinasi mendorong pengelola jurnal fakultas/prodi mendaftar. (Tenggat: Berlaku ketat **30 April 2026**).
- [ ] **Tim Majelis Dikti (Pak Lukman)**: Mengundang pengelola jurnal masuk ke dalam Grup WhatsApp koordinasi khusus Jurnalmu.org.
- [ ] **Tim Majelis Dikti (Pak Lukman)**: Rutin meninjau dan mengirimkan notifikasi *weekly progress reminders* kepada perwakilan 21 LPPM PTMA.
- [ ] **Seluruh PTMA (UMS, dll)**: Melengkapi pendaftaran jurnal universitas di Jurnalmu, menyetel URL OAI, dan *trigger* sinkronisasi artikel.
- [ ] **Tim Pengembang (Pak Andri)**: Merilis / Deploy live modul *Conference/Katalog Seminar* PTMA pada *weekend*.
- [ ] **Tim Pengembang (Pak Andri)**: Mendiagnosis laporan isu sinkronisasi OAI khusus pada jurnal-jurnal UM Palembang yang bersinggungan.

---
*Catatan didasarkan pada transkrip Rapat Zoom Impromptu 11 April 2026, Record length: 35 Menit.*