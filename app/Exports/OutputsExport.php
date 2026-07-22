<?php

namespace App\Exports;

use App\Models\ResearchOutput;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OutputsExport implements FromCollection, ShouldAutoSize, WithColumnFormatting, WithCustomStartCell, WithEvents, WithHeadings, WithMapping, WithStyles, WithTitle
{
    /**
     * Optional filters applied to the export.
     *
     * @param  string|null  $type  'Jurnal'|'Buku'|'HKI'|'Produk'|null
     * @param  string|null  $year  e.g. '2025'|null
     * @param  int|null  $universityId  Filter by a specific university
     * @param  int|null  $userId  Filter by a specific user (for multi-tenancy)
     */
    public function __construct(
        private readonly ?string $type = null,
        private readonly ?string $year = null,
        private readonly ?int $universityId = null,
        private readonly ?int $userId = null,
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Sheet title
    |--------------------------------------------------------------------------
    */

    public function title(): string
    {
        return 'Rekap Luaran';
    }

    /*
    |--------------------------------------------------------------------------
    | Data starts at row 5 (rows 1-4 are the document header)
    |--------------------------------------------------------------------------
    */

    public function startCell(): string
    {
        return 'A5';
    }

    /*
    |--------------------------------------------------------------------------
    | Data source
    |--------------------------------------------------------------------------
    */

    /**
     * Returns the verified research outputs with all necessary relations.
     * Applies optional type, year, university, and user filters.
     */
    public function collection(): Collection
    {
        return ResearchOutput::with(['user.university'])
            ->where('status', 'verified')
            ->when($this->type, fn ($q) => $q->where('type', $this->type))
            ->when($this->year, fn ($q) => $q->where('year', $this->year))
            ->when($this->universityId, fn ($q) => $q->whereHas('user', function ($uq) {
                $uq->where('university_id', $this->universityId);
            }))
            ->when($this->userId, fn ($q) => $q->where('user_id', $this->userId))
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Column headings (row 5)
    |--------------------------------------------------------------------------
    */

    public function headings(): array
    {
        return [
            'No.',
            'Judul Luaran',
            'Jenis Luaran',
            'Tahun Capaian',
            'Dosen Pengusul',
            'Perguruan Tinggi',
            'Status Verifikasi',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Row mapping
    |--------------------------------------------------------------------------
    */

    /** @param  ResearchOutput  $row */
    public function map($row): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $row->title,
            $row->type,
            $row->year,
            $row->user->name ?? '-',
            $row->user->university->name ?? '-',
            ucfirst($row->status),
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Column number formatting
    |--------------------------------------------------------------------------
    */

    public function columnFormats(): array
    {
        return [
            'D' => '@', // Year as text — prevents auto date conversion
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Cell styles
    |--------------------------------------------------------------------------
    */

    public function styles(Worksheet $sheet): array
    {
        // Header row (row 5) — bold + accent background
        return [
            5 => [
                'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['argb' => 'FF1E3A5F'],
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
            ],
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | AfterSheet events — document header rows + borders + footer
    |--------------------------------------------------------------------------
    */

    public function registerEvents(): array
    {
        $type = $this->type;
        $year = $this->year;
        $universityId = $this->universityId;

        return [
            AfterSheet::class => function (AfterSheet $event) use ($type, $year) {
                $sheet = $event->sheet->getDelegate();
                $lastDataRow = $sheet->getHighestRow();
                $lastCol = 'G'; // Column G = last data column

                /* ── 1. Insert 4 header rows above the data ────────────── */
                $sheet->insertNewRowBefore(1, 4);

                // Row 1: Document title
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->setCellValue('A1', 'LAPORAN REKAP LUARAN DOSEN');
                $sheet->getStyle('A1')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF1E3A5F']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 2: Subtitle / filter info
                $filterParts = [];
                if ($type) {
                    $filterParts[] = 'Jenis Luaran: '.$type;
                }
                if ($year) {
                    $filterParts[] = 'Tahun Capaian: '.$year;
                }
                $subtitle = count($filterParts) > 0
                    ? implode('  ·  ', $filterParts)
                    : 'Semua Jenis & Tahun';

                $sheet->mergeCells("A2:{$lastCol}2");
                $sheet->setCellValue('A2', $subtitle);
                $sheet->getStyle('A2')->applyFromArray([
                    'font' => ['size' => 10, 'color' => ['argb' => 'FF555555']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 3: Generated timestamp
                $sheet->mergeCells("A3:{$lastCol}3");
                $sheet->setCellValue('A3', 'Dicetak pada: '.now()->format('d F Y, H:i').' WIB');
                $sheet->getStyle('A3')->applyFromArray([
                    'font' => ['size' => 9, 'italic' => true, 'color' => ['argb' => 'FF777777']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 4: spacer
                $sheet->mergeCells("A4:{$lastCol}4");
                $sheet->getRowDimension(4)->setRowHeight(4);

                /* ── 2. Re-style heading row (now row 5 after insert) ─── */
                $sheet->getStyle("A5:{$lastCol}5")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 10],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1E3A5F']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                ]);
                $sheet->getRowDimension(5)->setRowHeight(20);

                /* ── 3. Borders on the entire data range ─────────────── */
                $totalRows = $sheet->getHighestRow();
                if ($totalRows >= 6) {
                    $sheet->getStyle("A5:{$lastCol}{$totalRows}")->applyFromArray([
                        'borders' => [
                            'allBorders' => [
                                'borderStyle' => Border::BORDER_THIN,
                                'color' => ['argb' => 'FFB0B0B0'],
                            ],
                        ],
                    ]);

                    // Alternate row shading
                    for ($r = 6; $r <= $totalRows; $r++) {
                        if ($r % 2 === 0) {
                            $sheet->getStyle("A{$r}:{$lastCol}{$r}")->applyFromArray([
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => ['argb' => 'FFF0F4FA'],
                                ],
                            ]);
                        }
                    }

                    // Centre-align columns: No, Jenis, Tahun, Status
                    foreach (['A', 'C', 'D', 'G'] as $col) {
                        $sheet->getStyle("{$col}6:{$col}{$totalRows}")
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                }

                /* ── 4. Summary rows below data ─────────────────────── */
                $summaryRow = $totalRows + 2;
                $dataCount = max(0, $totalRows - 5); // rows 6..N = data

                $sheet->setCellValue("A{$summaryRow}", 'Total Luaran:');
                $sheet->setCellValue("B{$summaryRow}", $dataCount);
                $sheet->getStyle("A{$summaryRow}:B{$summaryRow}")->applyFromArray([
                    'font' => ['bold' => true],
                ]);

                /* ── 5. Column widths (manual override for key cols) ── */
                $sheet->getColumnDimension('B')->setWidth(45); // Judul Luaran
                $sheet->getColumnDimension('E')->setWidth(35); // Dosen Pengusul
                $sheet->getColumnDimension('F')->setWidth(35); // Perguruan Tinggi

                /* ── 6. Freeze panes below heading ────────────────────── */
                $sheet->freezePane('A6');

                /* ── 7. Page setup for printing ───────────────────────── */
                $sheet->getPageSetup()
                    ->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE)
                    ->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4)
                    ->setFitToPage(true)
                    ->setFitToWidth(1)
                    ->setFitToHeight(0);

                $sheet->getPageMargins()
                    ->setTop(0.75)
                    ->setBottom(0.75)
                    ->setLeft(0.7)
                    ->setRight(0.7)
                    ->setHeader(0.3)
                    ->setFooter(0.3);

                $sheet->getHeaderFooter()
                    ->setOddHeader('&C&"Arial,Bold"&14Rekap Luaran Dosen')
                    ->setOddFooter('&LDicetak: &D &T&R&P / &N');
            },
        ];
    }
}
