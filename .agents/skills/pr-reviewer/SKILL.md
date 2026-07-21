---
name: pr-reviewer
description: Autonomously review GitHub Pull Requests (PRs) for the RPL-2026 project, generate markdown reports locally, and post them to GitHub ONLY after user approval.
---

# PR Reviewer Skill

This skill allows the agent to analyze GitHub Pull Requests for the RPL-2026 project and post reviews after explicit user confirmation.

## Instructions & Flow

When the user requests a PR review, follow these exact steps:

1. **Fetch Active PRs (If No PR Number Provided)**:
   - Run: `gh pr list --limit 30 --json number,title,author,headRefName`
   - Present the list of active PRs to the user in a clear table format and ask them to select one or more.

2. **Get PR Code Changes**:
   - Run: `gh pr diff <PR_NUMBER>` to extract the code changes.

3. **Read Review Guidelines**:
   - Read the project's review rules from: `.agents/workflows/review-instructions.md` (if the file doesn't exist, fall back to general code review focusing on Laravel/PHP/React/Tailwind best practices, security, and logical bugs).

4. **Perform Code Analysis**:
   - Review the diff against the guidelines. Check for logic errors, security issues, performance bottlenecks, and design patterns.

5. **Generate & Save Report Locally**:
   - Write the review report in Markdown format.
   - Save the file locally to: `.agents/reviews/PR-<PR_NUMBER>-review.md`

6. **Present Report & Ask for User Approval (CRITICAL)**:
   - Tampilkan seluruh isi laporan review tersebut di dalam chat agar pengguna dapat membacanya.
   - **Tanyakan kepada pengguna**: *"Apakah laporan ini sudah sesuai dan ingin diposting ke GitHub PR #<PR_NUMBER>?"*
   - **TUNGGU persetujuan tertulis dari pengguna (misal: "Ya", "Kirim", atau "Proceed"). JANGAN memposting komentar sebelum ada persetujuan.*

7. **Post Review Comment (Only After Approved)**:
   - Jika pengguna menyetujui, jalankan perintah untuk memposting komentar:
     `gh pr comment <PR_NUMBER> --body-file ".agents/reviews/PR-<PR_NUMBER>-review.md"`
   - Jika pengguna meminta revisi atau menolak, lakukan perbaikan laporan sesuai feedback pengguna atau batalkan proses.

---

## Final Review Workflow (Pemeriksaan Terakhir Mahasiswa)

Pada tahap pemeriksaan terakhir (pasca batas waktu deadline 19 Juli 2026 23:59 WIB), setiap evaluasi Pull Request (PR) **WAJIB** menjalankan langkah-langkah tambahan berikut:

1. **Pemeriksaan Status Waktu Commit (Commit Deadline Check)**:
   - Periksa tanggal dan jam seluruh commit pada branch PR menggunakan:
     `git log -n 10 --format="%h | %an | %ad | %s" --date=iso`
   - Tentukan kategori ketepatan waktu:
     - **`On Time`**: Seluruh commit dikirim **<= 19 Juli 2026 23:59 WIB**.
     - **`Late Submission`**: Terdapat commit yang dikirim **> 19 Juli 2026 23:59 WIB** (commit sebelum deadline tetap diperiksa).
     - **`Overdue`**: Seluruh commit dikirim **> 19 Juli 2026 23:59 WIB** (PR tidak diperiksa).

2. **Verifikasi 4 Task Penugasan Mahasiswa**:
   - Cari 4 task spesifik milik mahasiswa (berdasarkan Nama/NIM) di berkas `docs/guidence rpl 2026/Penugasan_RPL_Kelas_*.md` atau `docs/guidence rpl 2026/specs/`.
   - Evaluasi keterlaksanaan masing-masing dari 4 task tersebut secara teliti dan mendalam:
     - Verifikasi keberadaan file dan method controller/view yang ditugaskan.
     - Pastikan kode bukan *Dead Code* (misal: controller registrasi dibuat tapi tidak didaftarkan di rute auth).
     - Pastikan task routing tidak sekadar menempelkan rute miliknya sendiri, melainkan menyusun pengelompokan grup middleware per peran (`web.php`).
   - Tentukan status masing-masing task pada tabel evaluasi:
     - **`SELESAI`**: Diberikan jika task selesai dan di-commit **sebelum/sampai batas deadline** (<= 19 Juli 2026 23:59 WIB).
     - **`SELESAI (Late)`**: Diberikan jika task baru disempurnakan/diselesaikan pada commit **pasca deadline** (> 19 Juli 2026 23:59 WIB).
     - **`BELUM SELESAI`**: Diberikan jika task belum dikerjakan / dead code.

3. **Format Tabel Evaluasi 4 Task pada Laporan Review**:
   - Sertakan tabel rekapitulasi evaluasi task pada bagian atas laporan review:

     ```markdown
     ## 📋 Evaluasi 4 Task Penugasan Modul

     | No | Deskripsi Penugasan Task | Berkas Utama | Status Task | Catatan Evaluasi Reviewer |
     |----|--------------------------|--------------|-------------|---------------------------|
     | 1 | [Nama Task 1] | `path/to/file` | **SELESAI** / **SELESAI (Late)** / **BELUM SELESAI** | [Catatan] |
     | 2 | [Nama Task 2] | `path/to/file` | **SELESAI** / **SELESAI (Late)** / **BELUM SELESAI** | [Catatan] |
     | 3 | [Nama Task 3] | `path/to/file` | **SELESAI** / **SELESAI (Late)** / **BELUM SELESAI** | [Catatan] |
     | 4 | [Nama Task 4] | `path/to/file` | **SELESAI** / **SELESAI (Late)** / **BELUM SELESAI** | [Catatan] |

     **Capaian Penugasan:** X dari 4 Task Selesai (X%)
     ```

4. **Kebijakan Keputusan Status (Verdict)**:
   - Jika kualitas kode aman, bebas dari crash fatal, dan fitur utamanya berfungsi dengan baik, berikan keputusan status **`APPROVED (dengan catatan task tidak selesai semua)`** atau **`APPROVED (dengan catatan Late Submission)`** daripada menolak terus menerus, lalu lakukan posting ulasan dan merge (dengan `--admin` bypass) sesuai instruksi pengguna.
