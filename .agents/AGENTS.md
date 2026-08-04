# Project Rules for RPL-2026

## Code Review & PR Checking Guidelines

1. **Branch Sync Invariant**:
   - Sebelum melakukan pemeriksaan kode secara lokal atau menjalankan perintah tes/verifikasi untuk suatu Pull Request (PR), agen **WAJIB** beralih ke branch head milik PR tersebut (`git checkout <headRefName>`) dan melakukan `git pull`. Jangan melakukan pemeriksaan lokal dari branch lain.

2. **Collaboration Boundary Awareness**:
   - Selalu validasi riwayat review dan kesepakatan tim terkait pembagian tugas.
   - Jika suatu file (seperti Model database atau Service pendukung) tidak ditemukan dalam PR tetapi deskripsinya menyebutkan file tersebut, periksa apakah file tersebut merupakan tanggung jawab anggota tim lain. 
   - Utamakan solusi penyelesaian lokal (mocking/stubbing/local testing) demi keadilan kontribusi tim tanpa memaksa penggabungan file yang bukan menjadi hak milik PR tersebut.

3. **Role Validation & Backward Compatibility**:
   - Pengecekan otorisasi peran pada Laravel controller **TIDAK BOLEH** langsung memanggil kueri relasi pivot `$user->roles()->...` karena database seeder bawaan sering kali hanya mengisi kolom `role_id` utama (legacy).
   - Selalu gunakan helper method model User seperti `$user->hasRole($role)` atau `$user->hasAnyRole([$roles])` yang menangani pemeriksaan kolom `role_id` legacy dan relasi pivot secara bersamaan.

4. **Route & Controller Authorization Alignment**:
   - Hak akses yang dideklarasikan di rute (`routes/web.php` melalui middleware `role:XXX`) **WAJIB** selaras dengan pengecekan peran di dalam method controller terkait.
   - Jika controller memperbolehkan multi-role (misal: Editor dan Super Admin), pastikan middleware rute juga memperbolehkan peran-peran tersebut secara eksplisit (misal: `role:Editor,Super Admin`).

5. **PR Review Report Template & Emoji Prohibition**:
   - Laporan review **wajib** ditulis dalam **Bahasa Indonesia** secara profesional dan terstruktur.
   - **Review Pertama kali**: Harus menggunakan format template yang dispesifikasikan di [.agents/rules/review-instructions.md](file:///c:/xampp/htdocs/RPL-2026/.agents/rules/review-instructions.md).
   - **Review Ulang (Re-Review)**: Jika laporan review sudah ada sebelumnya, gunakan format template berikut:
     ```markdown
     # Laporan Pemeriksaan Ulang (Re-Review): PR #<PR_NUMBER> - <PR_TITLE>

     ## Ringkasan Pemeriksaan (Executive Summary)
     <Deskripsi hasil pemeriksaan ulang secara singkat.>

     **Status Akhir: <APPROVED (DISETUJUI) | REQUEST_CHANGES | COMMENT>**

     ---

     ## Hasil Evaluasi Rekomendasi Tindakan Sebelumnya

     ### 1. <Rekomendasi Tindakan 1 dari review sebelumnya>
     - **Rekomendasi**: <Penjelasan singkat rekomendasi sebelumnya>
     - **Status**: <TERPENUHI / BELUM TERPENUHI / TERPENUHI SEBAGIAN> [Penjelasan detail implementasi perbaikan]

     ### 2. <Rekomendasi Tindakan 2, dst.>

     ---

     ## Analisis File Detail (File-by-File Review)

     ### Backend
     #### 1. [NamaFile.php](file:///c:/path/to/NamaFile.php)
     - <Detail review backend>

     ### Frontend
     #### 1. [NamaFile.tsx](file:///c:/path/to/NamaFile.tsx)
     - <Detail review frontend>

     ---

     ## Masukan Tambahan untuk Pengembangan Selanjutnya (Non-Blocking)
     1. <Saran non-blocking untuk peningkatan di masa depan>
     ```
   - **Larangan Emoji**: Seluruh laporan review **TIDAK BOLEH** menggunakan emoji apa pun. Semua simbol visual emoji harus digantikan dengan teks penjelas standar (contoh: mengganti 🔴 dengan [CRITICAL] atau [MUST FIX], mengganti 🟢/✅ dengan [PASSED], [SUKSES], atau [APPROVED]). Larangan emoji ini juga berlaku pada presentasi teks laporan review di dalam ruang obrolan (chat) dengan user agar teks siap salin secara langsung.
   - **Deteksi Wajib Re-Review**: Sebelum membuat laporan review baru, agen **wajib** memeriksa secara lokal apakah berkas `.agents/reviews/PR-<PR_NUMBER>-review.md` sudah ada di workspace. Jika berkas tersebut sudah ada, agen dilarang keras menggunakan templat review pertama kali dan wajib menggunakan templat Re-Review.
   - **Invarian Perpindahan Branch**: Aturan dan templat review ini didefinisikan pada branch `feature/pr-reviewer-antigravity-sdk`. Jika agen berpindah branch untuk keperluan pengujian lokal, file aturan ini kemungkinan akan terhapus dari working directory. Agen **wajib** menggunakan perintah git show (contoh: `git show origin/feature/pr-reviewer-antigravity-sdk:.agents/AGENTS.md`) untuk membaca kembali aturan dan templat agar tidak kehilangan konteks format.
   - **Metode Review Berbasis Subagen (Subagent-Driven)**: Untuk menjaga kebersihan context window dan efisiensi token dalam sesi percakapan utama dengan user, agen utama **sangat disarankan** untuk mendelegasikan proses analisis mendalam (pembacaan berkas fisik, pencocokan spesifikasi, deteksi mismatch, dan verifikasi relasi database) kepada subagen `research` setelah beralih ke branch PR target.
   - **Otomatisasi Alur Kerja Approved**: Apabila laporan re-review menghasilkan keputusan **APPROVED (DISETUJUI)**, dan user memberikan instruksi posting (misal: "posting", "ya posting"), agen **wajib** mengeksekusi rangkaian tindakan berikut secara sekuensial:
     1. Lakukan posting persetujuan resmi: `gh pr review <PR_NUMBER> --approve --body-file <FILE_PATH>`
     2. Lakukan merge ke development: `gh pr merge <PR_NUMBER> --merge --admin`
     3. Berikan komentar penyelesaian pada Issue pelacak terkait (jika ada).
     4. Tutup Issue tersebut sebagai selesai: `gh issue close <ISSUE_NUMBER> --reason "completed"` (jika ada)
   - **Penyelarasan Bahasa Kolom & Eloquent Accessors**: Jika terdapat mismatch antara nama kolom database/model (Bahasa Inggris) dengan kebutuhan visual frontend modul lain (Bahasa Indonesia), prioritaskan penambahan alias virtual menggunakan Eloquent Accessors (`$appends` dan get-methods) pada model terkait daripada merombak total migrasi database yang sudah digunakan oleh modul lain.

6. **Pengecekan Modul Sebelum Deployment Bertahap (Phased Deployment)**:
   - Untuk melakukan validasi modul secara bertahap dan terpisah sebelum deploy, agen **WAJIB** mematuhi alur kerja yang didefinisikan dalam skill [module-checker](file:///c:/xampp/htdocs/RPL-2026/.agents/skills/module-checker/SKILL.md).
   - Validasi harus mencakup pencocokan fungsionalitas dengan dokumen PRD ([Product_Requirement_Document.md](file:///c:/xampp/htdocs/RPL-2026/docs/guidence%20rpl%202026/Product_Requirement_Document.md) atau [PRD_Submission_System_Kelas_G.md](file:///c:/xampp/htdocs/RPL-2026/docs/guidence%20rpl%202026/PRD_Submission_System_Kelas_G.md)) serta kecocokan visual di folder `specs/`.
   - Laporan pengecekan disimpan secara lokal ke `.agents/reviews/Module-<NAMA_MODUL>-review.md` menggunakan Bahasa Indonesia dan mematuhi larangan emoji secara mutlak.
