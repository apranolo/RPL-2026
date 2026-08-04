# Template Tabel Penilaian Mahasiswa Kelas B & G Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun template berkas spreadsheet Excel (`docs/Penilaian_Mahasiswa_RPL_2026.xlsx`) untuk rekapitulasi penilaian mahasiswa Kelas B dan Kelas G berdasar status penyelesaian 4 task dan warning merah.

**Architecture:** Menggunakan script Python (`scripts/generate_assessment_excel.py`) dengan pustaka `openpyxl` untuk memparsing data mahasiswa & task dari `Penugasan_RPL_Kelas_B.md` dan `Penugasan_RPL_Kelas_G.md`, kemudian membuat berkas `.xlsx` dengan multi-sheet (`Petunjuk & Legenda`, `Penilaian Kelas B`, `Penilaian Kelas G`), Data Validation dropdown, formula otomatis Excel (`COUNTIF`, `IF`), dan styling conditional formatting.

**Tech Stack:** Python 3, openpyxl, Markdown, Microsoft Excel (.xlsx).

---

### Task 1: Buat Script Python Generator Spreadsheet (`scripts/generate_assessment_excel.py`)

**Files:**
- Create: `scripts/generate_assessment_excel.py`
- Source Docs: `docs/guidence rpl 2026/Penugasan_RPL_Kelas_B.md`, `docs/guidence rpl 2026/Penugasan_RPL_Kelas_G.md`

- [ ] **Step 1: Tulis script generator `scripts/generate_assessment_excel.py`**

```python
import os
import re
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

def parse_student_tasks(md_filepath):
    """Memparsing file Penugasan_RPL_Kelas_X.md untuk mengekstrak mahasiswa & 4 task-nya."""
    if not os.path.exists(md_filepath):
        print(f"Warning: File {md_filepath} tidak ditemukan.")
        return []
    
    with open(md_filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex untuk mencari baris tabel: | Task | Path | Method | Nama Mahasiswa | Acuan |
    lines = content.split('\n')
    student_tasks = {}
    
    for line in lines:
        if line.startswith('|') and not '---' in line and not 'Nama Mahasiswa' in line:
            parts = [p.strip() for p in line.split('|')[1:-1]]
            if len(parts) >= 4:
                task_desc = parts[0]
                student_name = parts[3]
                
                # Mengabaikan baris header / kosong
                if student_name and student_name != '-' and not student_name.startswith('Nama'):
                    if student_name not in student_tasks:
                        student_tasks[student_name] = []
                    if len(student_tasks[student_name]) < 4:
                        student_tasks[student_name].append(task_desc)

    students_list = []
    for idx, (name, tasks) in enumerate(student_tasks.items(), start=1):
        students_list.append({
            'no': idx,
            'nim': f"NIM-{2026000 + idx}",
            'nama': name,
            'tasks': tasks
        })
    return students_list

def build_excel_workbook(kelas_b_students, kelas_g_students, output_filepath):
    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    # Styling definitions
    header_font = Font(name='Calibri', size=11, bold=True, color='FFFFFF')
    header_fill = PatternFill(start_color='1F4E78', end_color='1F4E78', fill_type='solid')
    
    sub_header_font = Font(name='Calibri', size=11, bold=True, color='1F4E78')
    sub_header_fill = PatternFill(start_color='DDEBF7', end_color='DDEBF7', fill_type='solid')

    border_thin = Side(border_style='thin', color='D9D9D9')
    box_border = Border(left=border_thin, right=border_thin, top=border_thin, bottom=border_thin)
    
    align_center = Alignment(horizontal='center', vertical='center', wrap_text=True)
    align_left = Alignment(horizontal='left', vertical='center', wrap_text=True)

    # ----------------------------------------------------
    # Sheet 1: Petunjuk & Legenda
    # ----------------------------------------------------
    ws1 = wb.create_sheet(title='Petunjuk & Legenda')
    ws1.views.sheetView[0].showGridLines = True

    ws1['A1'] = "TEMPLATE PENILAIAN MAHASISWA RPL 2026"
    ws1['A1'].font = Font(name='Calibri', size=16, bold=True, color='1F4E78')

    ws1['A3'] = "1. Legenda Skala Penilaian"
    ws1['A3'].font = sub_header_font

    headers_legenda = ["Jumlah Task Selesai", "Warning Merah", "Nilai Akhir", "Status Kelulusan"]
    for col_idx, text in enumerate(headers_legenda, start=1):
        cell = ws1.cell(row=4, column=col_idx, value=text)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = align_center

    data_legenda = [
        ["4 Task", "T (Tidak)", "A", "LULUS"],
        ["3 Task", "T (Tidak)", "B+", "LULUS"],
        ["2 Task", "T (Tidak)", "B", "LULUS"],
        ["1 Task", "T (Tidak)", "D", "BELUM LULUS"],
        ["0 Task", "T (Tidak)", "E", "BELUM LULUS"],
        ["Berapapun (0-4 Task)", "Y (Ya)", "E", "BELUM LULUS (Warning Merah)"]
    ]

    for row_idx, row_data in enumerate(data_legenda, start=5):
        for col_idx, val in enumerate(row_data, start=1):
            cell = ws1.cell(row=row_idx, column=col_idx, value=val)
            cell.alignment = align_center
            cell.border = box_border

    ws1['A13'] = "2. Petunjuk Pengisian untuk Dosen / Asisten Praktikum"
    ws1['A13'].font = sub_header_font

    instructions = [
        "a. Buka tab 'Penilaian Kelas B' atau 'Penilaian Kelas G'.",
        "b. Isi kolom Task 1 s/d Task 4 dengan memilih 'Selesai' atau 'Belum' via dropdown list.",
        "c. Isi kolom Warning Merah dengan memilih 'Y' (jika mahasiswa melanggar/dikenakan warning) atau 'T'.",
        "d. Kolom Total Task Selesai, Nilai Akhir, dan Status akan terhitung otomatis oleh formula Excel.",
        "e. Pengubahan Nilai Akhir dan Status secara manual tidak disarankan demi menjaga konsistensi."
    ]

    for idx, inst in enumerate(instructions, start=14):
        ws1.cell(row=idx, column=1, value=inst).font = Font(name='Calibri', size=11)

    # ----------------------------------------------------
    # Helper to build class sheets
    # ----------------------------------------------------
    def create_class_sheet(title, students):
        ws = wb.create_sheet(title=title)
        ws.views.sheetView[0].showGridLines = True

        # Header Title
        ws['A1'] = f"REKAPITULASI PENILAIAN MAHASISWA - {title.upper()}"
        ws['A1'].font = Font(name='Calibri', size=14, bold=True, color='1F4E78')

        headers = [
            "No", "NIM / ID", "Nama Mahasiswa", 
            "Task 1", "Task 2", "Task 3", "Task 4", 
            "Warning Merah", "Total Task Selesai", "Nilai Akhir", "Status", "Catatan"
        ]

        ws.row_dimensions[4].height = 28
        for col_idx, text in enumerate(headers, start=1):
            cell = ws.cell(row=4, column=col_idx, value=text)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = align_center
            cell.border = box_border

        # Populate student rows
        start_row = 5
        for i, std in enumerate(students):
            current_row = start_row + i
            ws.row_dimensions[current_row].height = 22

            ws.cell(row=current_row, column=1, value=std['no']).alignment = align_center
            ws.cell(row=current_row, column=2, value=std['nim']).alignment = align_center
            ws.cell(row=current_row, column=3, value=std['nama']).alignment = align_left

            # Tasks (Default to 'Belum')
            for t_idx in range(4):
                c = ws.cell(row=current_row, column=4 + t_idx, value="Belum")
                c.alignment = align_center

            # Warning Merah (Default to 'T')
            c_warn = ws.cell(row=current_row, column=8, value="T")
            c_warn.alignment = align_center

            # Formulas
            # Total Task Selesai: =COUNTIF(D5:G5, "Selesai")
            ws.cell(row=current_row, column=9, value=f'=COUNTIF(D{current_row}:G{current_row}, "Selesai")').alignment = align_center
            
            # Nilai Akhir: =IF(H5="Y","E",IF(I5=4,"A",IF(I5=3,"B+",IF(I5=2,"B",IF(I5=1,"D","E")))))
            ws.cell(row=current_row, column=10, value=f'=IF(H{current_row}="Y","E",IF(I{current_row}=4,"A",IF(I{current_row}=3,"B+",IF(I{current_row}=2,"B",IF(I{current_row}=1,"D","E")))))').alignment = align_center
            
            # Status: =IF(J5="E","BELUM LULUS","LULUS")
            ws.cell(row=current_row, column=11, value=f'=IF(J{current_row}="E","BELUM LULUS","LULUS")').alignment = align_center
            
            # Catatan
            ws.cell(row=current_row, column=12, value="").alignment = align_left

            # Apply borders
            for c_idx in range(1, 13):
                ws.cell(row=current_row, column=c_idx).border = box_border

        # Add Data Validation for Task (Selesai/Belum) & Warning (Y/T)
        max_row = max(start_row + len(students) - 1, start_row)
        
        dv_task = DataValidation(type="list", formula1='"Selesai,Belum"', allow_blank=True)
        ws.add_data_validation(dv_task)
        dv_task.add(f"D{start_row}:G{max_row}")

        dv_warn = DataValidation(type="list", formula1='"Y,T"', allow_blank=True)
        ws.add_data_validation(dv_warn)
        dv_warn.add(f"H{start_row}:H{max_row}")

        # Set Column widths
        widths = {
            'A': 6, 'B': 14, 'C': 32, 
            'D': 14, 'E': 14, 'F': 14, 'G': 14, 
            'H': 16, 'I': 18, 'J': 14, 'K': 16, 'L': 25
        }
        for col_letter, width in widths.items():
            ws.column_dimensions[col_letter].width = width

    create_class_sheet('Penilaian Kelas B', kelas_b_students)
    create_class_sheet('Penilaian Kelas G', kelas_g_students)

    os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
    wb.save(output_filepath)
    print(f"Berkas spreadsheet berhasil dibuat di: {output_filepath}")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    b_md = os.path.join(base_dir, 'docs', 'guidence rpl 2026', 'Penugasan_RPL_Kelas_B.md')
    g_md = os.path.join(base_dir, 'docs', 'guidence rpl 2026', 'Penugasan_RPL_Kelas_G.md')
    
    b_students = parse_student_tasks(b_md)
    g_students = parse_student_tasks(g_md)

    out_xlsx = os.path.join(base_dir, 'docs', 'Penilaian_Mahasiswa_RPL_2026.xlsx')
    build_excel_workbook(b_students, g_students, out_xlsx)
```

- [ ] **Step 2: Jalankan script generator Python**

Run: `python scripts/generate_assessment_excel.py`
Expected: "Berkas spreadsheet berhasil dibuat di: .../docs/Penilaian_Mahasiswa_RPL_2026.xlsx"

---

### Task 2: Verifikasi & Validasi Berkas `.xlsx` yang Dihasilkan

**Files:**
- Test/Verify: `docs/Penilaian_Mahasiswa_RPL_2026.xlsx`

- [ ] **Step 1: Jalankan verifikasi pembacaan openpyxl pada berkas `.xlsx`**

Run python verification snippet:
```python
import openpyxl
wb = openpyxl.load_workbook('docs/Penilaian_Mahasiswa_RPL_2026.xlsx')
assert 'Petunjuk & Legenda' in wb.sheetnames
assert 'Penilaian Kelas B' in wb.sheetnames
assert 'Penilaian Kelas G' in wb.sheetnames
print("Workbook validation passed successfully!")
```

---

### Task 3: Commit Berkas Spesifikasi, Script, dan Template Excel

- [ ] **Step 1: Tambahkan dan commit seluruh perubahan ke git**

Run: `git add docs/superpowers/specs/2026-08-04-template-tabel-penilaian-design.md docs/superpowers/plans/2026-08-04-template-tabel-penilaian.md scripts/generate_assessment_excel.py docs/Penilaian_Mahasiswa_RPL_2026.xlsx`
Run: `git commit -m "feat: add template assessment excel table for Class B and Class G"`
