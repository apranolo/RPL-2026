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

Pada tahap pemeriksaan terakhir (pasca batas waktu deadline 19 Juli 2026 23:59 WIB), setiap evaluasi Pull Request (PR) **WAJIB** menjalankan langkah-langkah berikut:

1. **Sinkronisasi Branch dengan Development (Mandatory Pre-Check)**:
   - Setelah melakukan `gh pr checkout <PR_NUMBER>`, reviewer **WAJIB menjalankan**:
     `git pull origin development`
   - Jika terdapat konflik merge akibat pembaruan dari branch development, reviewer **segera menyelesaikan konflik tersebut secara lokal**, memverifikasi kelayakan kode, melakukan commit, dan push ke remote branch PR sebelum ulasan diposting.

2. **Pemeriksaan Riwayat Commit Terperinci (Author Commit History Check)**:
   - JANGAN hanya melihat commit teratas (HEAD). Periksa seluruh riwayat commit yang dibuat oleh pembuat PR menggunakan:
     `git log --author="[Author_Name]" --format="%h | %an | %ad | %s" --date=iso`
   - Tentukan klasifikasi waktu pengumpulan PR:
     - **`On Time`**: Seluruh commit dikirim **<= 19 Juli 2026 23:59 WIB**.
     - **`Late Submission`**: Memiliki commit tugas utama yang dibuat **<= 19 Juli 2026 23:59 WIB**, namun memiliki commit perbaikan/terbaru yang dikirim **> 19 Juli 2026 23:59 WIB** (commit sebelum deadline tetap diperiksa dan dinilai).
     - **`Overdue`**: Seluruh commit baru pertama kali dikirim **> 19 Juli 2026 23:59 WIB** (PR tidak diperiksa).

3. **Aturan Penanganan PR `Late Submission`**:
   - Commit yang dikirim pasca deadline **TIDAK DI-REVERT**, melainkan **TETAP DIPERIKSA**.
   - Jika terdapat perbaikan berkas terkait (bukan pembuatan tugas baru dari nol) atau konflik merge, reviewer **diperbolehkan melakukan modifikasi/perbaikan konflik** agar PR dapat berhasil di-merge ke branch `development`.

4. **Verifikasi & Status 4 Task Penugasan Mahasiswa**:
   - Evaluasi keterlaksanaan masing-masing dari 4 task penugasan individu (berdasarkan spesifikasi modul di `docs/guidence rpl 2026/`):
     - **`SELESAI`**: Diberikan jika task selesai dan di-commit **<= 19 Juli 2026 23:59 WIB**.
     - **`SELESAI (Overdue)`**: Diberikan jika task disempurnakan/diperbaiki pada commit **> 19 Juli 2026 23:59 WIB**.
     - **`BELUM SELESAI`**: Diberikan jika task belum dikerjakan / dead code.

5. **Format Tabel Evaluasi 4 Task pada Laporan Review**:
   - Sertakan tabel rekapitulasi evaluasi task pada bagian atas laporan review:

     ```markdown
     ## 📋 Evaluasi 4 Task Penugasan Modul

     | No | Deskripsi Penugasan Task | Berkas Utama | Status Task | Catatan Evaluasi Reviewer |
     |----|--------------------------|--------------|-------------|---------------------------|
     | 1 | [Nama Task 1] | `path/to/file` | **SELESAI** / **SELESAI (Overdue)** / **BELUM SELESAI** | [Catatan] |
     | 2 | [Nama Task 2] | `path/to/file` | **SELESAI** / **SELESAI (Overdue)** / **BELUM SELESAI** | [Catatan] |
     | 3 | [Nama Task 3] | `path/to/file` | **SELESAI** / **SELESAI (Overdue)** / **BELUM SELESAI** | [Catatan] |
     | 4 | [Nama Task 4] | `path/to/file` | **SELESAI** / **SELESAI (Overdue)** / **BELUM SELESAI** | [Catatan] |

     **Capaian Penugasan:** X dari 4 Task Selesai (X%)
     ```

6. **Kebijakan Keputusan Status (Verdict) & Penilaian Spreadsheet**:
   - Apabila pada tabel evaluasi 4 task terdapat status **`SELESAI (Overdue)`**, tugas secara fisik dianggap selesai (kode dapat di-merge ke development).
   - **NAMUN**, pada ringkasan ulasan/verdict wajib dicantumkan catatan bahwa **status ketercapaian task untuk lembar penilaian spreadsheet dicatat sebagai `Not Completed`**, karena penyempurnaan/perbaikannya dikirimkan melebihi batas waktu deadline push commit (19 Juli 2026 23:59 WIB).
   - *Matriks Penilaian Spreadsheet*:
     - **`SELESAI`** (commit <= deadline) -> Spreadsheet: **`Completed`**
     - **`SELESAI (Overdue)`** (commit > deadline) -> Spreadsheet: **`Not Completed`**
     - **`BELUM SELESAI`** -> Spreadsheet: **`Not Completed`**

7. **Investigasi Historis Terhapusnya Kode saat Merge Conflict**:
   - Apabila terdapat method/task yang hilang pada PR final, jalankan:
     `git log origin/<branch_pr> -p -- app/Http/Controllers/...`
   - Verifikasi apakah author pernah menulis kodenya lalu terhapus saat `git merge development` (kesalahan resolusi konflik author). Kapan dan mengapa terhapus wajib dicatat pada laporan ulasan.

8. **Penanganan PR `CHANGES_REQUESTED` yang Diperbaiki Reviewer & Issue GitHub**:
   - Jika PR ditolak (`CHANGES_REQUESTED`), PR **TIDAK DI-MERGE LANGSUNG** dari PR mahasiswa.
   - Buat Issue GitHub baru (Assignee: `@kyASse`) untuk melacak perbaikan bug/fitur oleh reviewer.
   - Penilaian spreadsheet mahasiswa **TETAP HANYA MENGHITUNG CAPAIAN MURNI MAHASISWA** sebelum deadline (misal: 25% / `Not Completed`).

9. **Penanganan Target Base Branch `main`**:
   - Alihkan target base branch ke `development` menggunakan `gh pr edit <PR_NUMBER> --base development` dan catat pada ulasan.
