<?php

namespace App\Exports;

use App\Models\PembinaanRegistration;
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

class OutputsExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    WithColumnFormatting,
    WithCustomStartCell,
    ShouldAutoSize,
    WithTitle,
    WithEvents
{
    /**
     * Optional filters applied to the export.
     *
     * @param  string|null  $category  'akreditasi'|'indeksasi'|null
     * @param  string|null  $year      e.g. '2025'|null
     * @param  int|null     $universityId  Filter by a specific university
     */
    public function __construct(
        private readonly ?string $category = null,
        private readonly ?string $year = null,
        private readonly ?int $universityId = null,
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
     * Returns the approved pembinaan registrations with all necessary relations.
     * Applies optional category, year, and university filters.
     */
    public function collection(): Collection
    {
        return PembinaanRegistration::with([
                'journal:id,title,issn,e_issn,sinta_rank,sinta_rank_label,university_id',
                'journal.university:id,name,short_name',
                'pembinaan:id,name,category',
            ])
            ->whereNull('pembinaan_registrations.deleted_at')
            ->where('pembinaan_registrations.status', 'approved')
            ->whereHas('pembinaan', function ($q) {
                $q->whereNull('deleted_at');
                if ($this->category) {
                    $q->where('category', $this->category);
                }
            })
            ->when($this->year, fn ($q) => $q->whereYear('registered_at', $this->year))
            ->when($this->universityId, fn ($q) => $q->whereHas('journal', function ($jq) {
                $jq->where('university_id', $this->universityId);
            }))
            ->orderBy('registered_at', 'asc')
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
            'Nama Jurnal',
            'ISSN',
            'E-ISSN',
            'Peringkat SINTA',
            'Perguruan Tinggi',
            'Program Pembinaan',
            'Kategori',
            'Tahun',
            'Tanggal Daftar',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Row mapping
    |--------------------------------------------------------------------------
    */

    /** @param  PembinaanRegistration  $row */
    public function map($row): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $row->journal->title ?? '-',
            $row->journal->issn  ?? '-',
            $row->journal->e_issn ?? '-',
            $row->journal->sinta_rank_label ?? 'Non Sinta',
            $row->journal->university->name ?? '-',
            $row->pembinaan->name ?? '-',
            ucfirst($row->pembinaan->category ?? '-'),
            $row->registered_at
                ? (int) $row->registered_at->format('Y')
                : '-',
            $row->registered_at
                ? $row->registered_at->format('d/m/Y')
                : '-',
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
            'I' => '@', // Year as text — prevents auto date conversion
            'J' => '@', // Date string as text
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
                'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                'fill'      => [
                    'fillType'   => Fill::FILL_SOLID,
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
        $category    = $this->category;
        $year        = $this->year;
        $universityId = $this->universityId;

        return [
            AfterSheet::class => function (AfterSheet $event) use ($category, $year, $universityId) {
                $sheet = $event->sheet->getDelegate();
                $lastDataRow = $sheet->getHighestRow();
                $lastCol     = 'J'; // Column J = last data column

                /* ── 1. Insert 4 header rows above the data ────────────── */
                $sheet->insertNewRowBefore(1, 4);

                // Row 1: Document title
                $sheet->mergeCells("A1:{$lastCol}1");
                $sheet->setCellValue('A1', 'LAPORAN REKAP LUARAN PROGRAM PEMBINAAN JURNAL');
                $sheet->getStyle('A1')->applyFromArray([
                    'font'      => ['bold' => true, 'size' => 14, 'color' => ['argb' => 'FF1E3A5F']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 2: Subtitle / filter info
                $filterParts = [];
                if ($category) {
                    $filterParts[] = 'Kategori: ' . ucfirst($category);
                }
                if ($year) {
                    $filterParts[] = 'Tahun: ' . $year;
                }
                $subtitle = count($filterParts) > 0
                    ? implode('  ·  ', $filterParts)
                    : 'Semua Kategori & Tahun';

                $sheet->mergeCells("A2:{$lastCol}2");
                $sheet->setCellValue('A2', $subtitle);
                $sheet->getStyle('A2')->applyFromArray([
                    'font'      => ['size' => 10, 'color' => ['argb' => 'FF555555']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 3: Generated timestamp
                $sheet->mergeCells("A3:{$lastCol}3");
                $sheet->setCellValue('A3', 'Dicetak pada: ' . now()->format('d F Y, H:i') . ' WIB');
                $sheet->getStyle('A3')->applyFromArray([
                    'font'      => ['size' => 9, 'italic' => true, 'color' => ['argb' => 'FF777777']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER],
                ]);

                // Row 4: spacer
                $sheet->mergeCells("A4:{$lastCol}4");
                $sheet->getRowDimension(4)->setRowHeight(4);

                /* ── 2. Re-style heading row (now row 5 after insert) ─── */
                $sheet->getStyle("A5:{$lastCol}5")->applyFromArray([
                    'font'      => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF'], 'size' => 10],
                    'fill'      => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FF1E3A5F']],
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
                                'color'       => ['argb' => 'FFB0B0B0'],
                            ],
                        ],
                    ]);

                    // Alternate row shading
                    for ($r = 6; $r <= $totalRows; $r++) {
                        if ($r % 2 === 0) {
                            $sheet->getStyle("A{$r}:{$lastCol}{$r}")->applyFromArray([
                                'fill' => [
                                    'fillType'   => Fill::FILL_SOLID,
                                    'startColor' => ['argb' => 'FFF0F4FA'],
                                ],
                            ]);
                        }
                    }

                    // Centre-align columns: No, Kategori, Tahun, Tgl. Daftar
                    foreach (['A', 'H', 'I', 'J'] as $col) {
                        $sheet->getStyle("{$col}6:{$col}{$totalRows}")
                            ->getAlignment()
                            ->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                }

                /* ── 4. Summary rows below data ─────────────────────── */
                $summaryRow = $totalRows + 2;
                $dataCount  = max(0, $totalRows - 5); // rows 6..N = data

                $sheet->setCellValue("A{$summaryRow}", 'Total Luaran:');
                $sheet->setCellValue("B{$summaryRow}", $dataCount);
                $sheet->getStyle("A{$summaryRow}:B{$summaryRow}")->applyFromArray([
                    'font' => ['bold' => true],
                ]);

                /* ── 5. Column widths (manual override for key cols) ── */
                $sheet->getColumnDimension('B')->setWidth(45); // Nama Jurnal
                $sheet->getColumnDimension('F')->setWidth(40); // Perguruan Tinggi
                $sheet->getColumnDimension('G')->setWidth(35); // Program Pembinaan

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
                    ->setOddHeader('&C&"Arial,Bold"&14Rekap Luaran Program Pembinaan Jurnal')
                    ->setOddFooter('&LDicetak: &D &T&R&P / &N');
            },
        ];
    }
}
