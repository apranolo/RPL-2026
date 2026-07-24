# Panduan Deployment Bertahap & Penggabungan Modul Selektif

Panduan ini mendokumentasikan prosedur standar untuk melakukan pengecekan, perbaikan, dan penggabungan (*merge*) kode modul mahasiswa secara bertahap dari repositori kelas **RPL-2026** ke repositori deployment **jurnal_mu**.

---

## 1. Pengecekan Kualitas Modul (Module Quality Gate)
Sebelum modul digabungkan ke repositori deployment `jurnal_mu`, modul wajib melalui pengecekan menggunakan agen AI dengan memanggil perintah/skill `module-checker`.

Pengecekan meliputi:
- **Kesesuaian PRD**: Kecocokan fitur dengan dokumen PRD utama ([Product_Requirement_Document.md](../guidence%20rpl%202026/Product_Requirement_Document.md) atau [PRD_Submission_System_Kelas_G.md](../guidence%20rpl%202026/PRD_Submission_System_Kelas_G.md)).
- **Spesifikasi Wireframe**: Kesesuaian visual, rute, properti typescript, dan tata letak dengan spesifikasi visual di folder `specs/`.
- **Integrasi Backend**: Validasi Request Class terpisah, namespace Controller yang tepat, kelancaran migrasi/seeder basis data, otorisasi multi-tenancy (`university_id` filter), serta pemeriksaan hak akses menggunakan helper Model (bukan kueri relasi pivot langsung).
- **Integrasi Frontend**: Penggunaan Inertia `useForm` untuk form submission, penanganan error validasi (`InputError`), keberadaan JSDoc Header wajib, dan keselarasan gaya visual dengan `Global_UI_UX_Guide.md` (warna tema, radius elemen, status badges, larangan manual hex color).
- **Pengujian & Kualitas Kode**: Keberhasilan linting frontend (ESLint/Prettier), type check TypeScript, format kode backend (Pint), serta Pest test.

---

## 2. Alur Perbaikan Bug (Bug Fix Workflow)
Jika selama fase pengecekan ditemukan bug atau pelanggaran standar kode:

1. **Lakukan Perbaikan di Repositori RPL-2026**:
   - Perbaikan **harus** dilakukan oleh mahasiswa pada branch fitur asal (atau branch perbaikan baru) di repositori **RPL-2026**, bukan langsung pada repositori deployment `jurnal_mu`.
   - Hal ini wajib dipatuhi untuk menghindari perbedaan kode (*codebase drift*) yang akan menyebabkan konflik merge yang rumit di masa depan, serta menjaga agar riwayat kontribusi mahasiswa tercatat di repositori kelas untuk penilaian.
2. **Pembaruan Otomatis Pull Request**:
   - Begitu mahasiswa melakukan commit dan push ke branch fitur mereka, GitHub secara otomatis memperbarui Pull Request (PR) yang bersangkutan.
3. **Merge ke Development**:
   - Setelah perbaikan lolos pengujian ulang, PR di-merge ke branch `development` di **RPL-2026**.

---

## 3. Alur Penggabungan Kode ke Repositori `jurnal_mu`
Kamu dapat memilih salah satu dari dua metode di bawah ini tergantung pada kondisi kesiapan modul-modul lainnya.

### Metode A: Penggabungan Massal (Full Merge dari Development)
Gunakan metode ini jika kamu ingin menyinkronkan seluruh modul yang sudah selesai dan telah di-merge ke branch `development` di `RPL-2026`.

#### Langkah-Langkah:
1. Buka terminal di dalam folder lokal repositori **`jurnal_mu`** di komputermu (misal: `c:\xampp\htdocs\jurnal_mu`).
2. Daftarkan remote repositori kelas jika belum ada:
   ```bash
   git remote add rpl-upstream https://github.com/apranolo/RPL-2026.git
   ```
3. Tarik pembaruan dari remote tersebut:
   ```bash
   git fetch rpl-upstream
   ```
4. Beralihlah ke branch target deployment di `jurnal_mu` (misal `development` atau `main`), lalu lakukan merge:
   ```bash
   git checkout development
   git merge rpl-upstream/development --no-ff -m "merge: sync development from RPL-2026"
   ```

---

### Metode B: Penggabungan Selektif per Modul (Selective Module Deployment)
Gunakan metode ini jika branch `development` pada repositori kelas `RPL-2026` sudah terlanjur dicampur dengan modul-modul lain yang belum siap/belum lulus uji, sedangkan kamu **hanya ingin mendeploy satu modul spesifik saja**.

#### Langkah-Langkah:
1. **Dapatkan Nama Branch Fitur Mahasiswa**:
   Buka halaman Pull Request mahasiswa tersebut di GitHub repositori `RPL-2026`. Catat nama branch fiturnya (misalnya: `feature/review_assignment_G_2300018407`).
2. **Arahkan Terminal ke Folder Lokal `jurnal_mu`**:
   Buka terminal di folder lokal repositori **`jurnal_mu`** di komputermu.
3. **Fetch Pembaruan dari Remote**:
   Dapatkan versi branch terbaru dari repositori kelas:
   ```bash
   git fetch rpl-upstream
   ```
4. **Merge Branch Fitur Secara Selektif**:
   Beralihlah ke branch target di `jurnal_mu` (misal `development`), lalu gabungkan branch fitur spesifik tersebut:
   ```bash
   git checkout development
   git merge rpl-upstream/feature/review_assignment_G_2300018407 --no-ff -m "merge: deploy modul review assignment bertahap"
   ```
5. **Konfirmasi & Uji Lokal**:
   Jalankan migrasi database dan pengujian lokal di repositori `jurnal_mu` untuk memastikan modul tersebut berjalan sempurna.

> [!CAUTION]
> **Peringatan Dependensi Modul**:
> Metode B hanya menarik kode dari branch fitur mahasiswa tersebut. Jika modul tersebut memiliki dependensi pada model/migrasi database yang dibuat oleh rekan setimnya di branch database-layer terpisah, kamu wajib melakukan merge branch database-layer tersebut terlebih dahulu sebelum menggabungkan modul ini.
