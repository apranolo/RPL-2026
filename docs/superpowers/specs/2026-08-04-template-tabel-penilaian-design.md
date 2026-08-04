# Spesiﬁkasi Desain: Template Tabel Penilaian Mahasiswa (Kelas B & Kelas G)

## 1. Ringkasan Fitur
Dokumen ini mendefinisikan spesifikasi desain untuk berkas spreadsheet penilaian mahasiswa (`Penilaian_Mahasiswa_RPL_2026.xlsx`) untuk mata kuliah Rekayasa Perangkat Lunak (RPL) 2026 pada **Kelas B** dan **Kelas G**. Berkas ini digunakan oleh dosen dan asisten praktikum untuk merekap status penyelesaian 4 tugas utama serta menetapkan Nilai Akhir secara otomatis berdasarkan aturan kelulusan yang telah disepakati.

---

## 2. Aturan Penilaian & Skala Nilai (Gradasi Lengkap)

Penilaian berbasis akumulasi penyelesaian 4 task dengan memperhitungkan status sanksi/warning merah:

| Kriteria Penyelesaian Task | Status Warning Merah | Nilai Akhir | Status Keterangan |
| :--- | :--- | :--- | :--- |
| Menyelesaikan 4 Task | T (Tidak) | **A** | LULUS |
| Menyelesaikan 3 Task | T (Tidak) | **B+** | LULUS |
| Menyelesaikan 2 Task | T (Tidak) | **B** | LULUS |
| Menyelesaikan 1 Task | T (Tidak) | **D** | BELUM LULUS |
| Menyelesaikan 0 Task | T (Tidak) | **E** | BELUM LULUS |
| *Berapapun Task Selesai* | **Y (Ya - Terkena Warning)** | **E** | BELUM LULUS (Sanctioned) |

---

## 3. Arsitektur Berkas Spreadsheet (`.xlsx`)

File disimpan di lokasi: `docs/Penilaian_Mahasiswa_RPL_2026.xlsx`

### 3.1 Sheet 1: `Petunjuk & Legenda`
- **Tabel Legenda Penilaian**: Menampilkan tabel acuan nilai A, B+, B, D, E.
- **Petunjuk Pengisian**:
  1. Pilih status penyelesaian task (`Selesai` / `Belum`) pada kolom Task 1 s/d Task 4.
  2. Pilih status `Y` pada kolom Warning Merah jika mahasiswa melanggar aturan/terkena warning.
  3. Kolom **Total Task Selesai**, **Nilai Akhir**, dan **Status** akan terhitung otomatis melalui formula Excel.

### 3.2 Sheet 2: `Penilaian Kelas B` & Sheet 3: `Penilaian Kelas G`
- Pre-populated nama mahasiswa beserta daftar 4 task spesifik yang bersumber dari:
  - `docs/guidence rpl 2026/Penugasan_RPL_Kelas_B.md`
  - `docs/guidence rpl 2026/Penugasan_RPL_Kelas_G.md`

#### Struktur Kolom Sheet Penilaian:
1. `A`: **No** (Nomor Urut)
2. `B`: **NIM / ID Mahasiswa**
3. `C`: **Nama Mahasiswa**
4. `D`: **Task 1** (Dropdown: `Selesai` / `Belum`)
5. `E`: **Task 2** (Dropdown: `Selesai` / `Belum`)
6. `F`: **Task 3** (Dropdown: `Selesai` / `Belum`)
7. `G`: **Task 4** (Dropdown: `Selesai` / `Belum`)
8. `H`: **Warning Merah** (Dropdown: `Y` / `T`)
9. `I`: **Total Task Selesai** (Formula: `=COUNTIF(D6:G6, "Selesai")`)
10. `J`: **Nilai Akhir** (Formula: `=IF(H6="Y","E",IF(I6=4,"A",IF(I6=3,"B+",IF(I6=2,"B",IF(I6=1,"D","E")))))`)
11. `K`: **Status** (Formula: `=IF(J6="E","BELUM LULUS","LULUS")`)
12. `L`: **Catatan** (Text bebas untuk arahan perbaikan)

---

## 4. Desain Visual & Conditional Formatting

- **Warna Header**: Navy Blue (`#1F4E78`) dengan teks putih tebal (Bold).
- **Baris Selang-Seling (Zebra Striping)**: Putih dan Abu-abu Muda (`#F2F2F2`) untuk kemudahan keterbacaan.
- **Conditional Formatting Rules**:
  - **Nilai A**: Latar Hijau Muda (`#E2EFDA`), Teks Hijau Tua (`#375623`).
  - **Nilai B+ / B**: Latar Biru Muda (`#DDEBF7`), Teks Biru Tua (`#1F4E78`).
  - **Nilai D**: Latar Kuning Muda (`#FFF2CC`), Teks Kuning Tua (`#7F6000`).
  - **Nilai E / Warning Merah = Y**: Latar Merah Muda (`#FCE4D6`), Teks Merah Tua (`#C00000`).

---

## 5. Rencana Pembuatan & Script Otomatisasi
- Untuk memastikan presisi data 100% dari file `.md` tugas, sebuah script Python `scripts/generate_assessment_excel.py` menggunakan pustaka `openpyxl` akan digunakan untuk men-generate berkas `docs/Penilaian_Mahasiswa_RPL_2026.xlsx`.
