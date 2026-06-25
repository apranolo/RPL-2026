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
