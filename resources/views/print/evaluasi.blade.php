<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rekap Evaluasi Monev - {{ config('app.name', 'Journal MU') }}</title>

    <style>
        /* ----------------------------------------------------------------
           Print-optimised stylesheet for Rekap Evaluasi Monev
           Designed for A4 landscape output via browser print / PDF export
        ---------------------------------------------------------------- */

        /* Reset & base */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            line-height: 1.5;
            color: #1f2937;
            background: #ffffff;
            padding: 20px 30px;
        }

        /* Header */
        .header {
            text-align: center;
            border-bottom: 3px double #1e3a5f;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }

        .header h1 {
            font-size: 18px;
            font-weight: 700;
            color: #1e3a5f;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .header h2 {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 2px;
        }

        .header .subtitle {
            font-size: 11px;
            color: #6b7280;
        }

        /* Meta info */
        .meta-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 10px;
            color: #6b7280;
        }

        .meta-info .filters span {
            display: inline-block;
            background: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            margin-right: 6px;
            font-weight: 500;
        }

        /* Summary cards */
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
        }

        .summary-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px 16px;
            text-align: center;
        }

        .summary-card .label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .summary-card .value {
            font-size: 22px;
            font-weight: 700;
            color: #1e3a5f;
        }

        .summary-card .unit {
            font-size: 10px;
            color: #9ca3af;
            margin-top: 2px;
        }

        /* Grade distribution */
        .grade-distribution {
            margin-bottom: 24px;
        }

        .grade-distribution h3 {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
        }

        .grade-badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .grade-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 600;
        }

        .grade-badge.grade-a { background: #d1fae5; color: #065f46; }
        .grade-badge.grade-b { background: #dbeafe; color: #1e40af; }
        .grade-badge.grade-c { background: #fef3c7; color: #92400e; }
        .grade-badge.grade-d { background: #fed7aa; color: #9a3412; }
        .grade-badge.grade-e { background: #fee2e2; color: #991b1b; }

        .grade-count {
            background: rgba(0,0,0,0.1);
            padding: 1px 7px;
            border-radius: 10px;
            font-size: 10px;
        }

        /* Data table */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 10px;
        }

        .data-table thead th {
            background: #1e3a5f;
            color: #ffffff;
            padding: 8px 10px;
            text-align: left;
            font-weight: 600;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            white-space: nowrap;
        }

        .data-table thead th:first-child { border-radius: 6px 0 0 0; }
        .data-table thead th:last-child  { border-radius: 0 6px 0 0; }

        .data-table tbody tr {
            border-bottom: 1px solid #f3f4f6;
        }

        .data-table tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        .data-table tbody tr:hover {
            background: #eff6ff;
        }

        .data-table tbody td {
            padding: 7px 10px;
            vertical-align: middle;
        }

        .data-table .text-center { text-align: center; }
        .data-table .text-right  { text-align: right; }

        /* Score badge */
        .score-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 10px;
        }

        .score-excellent { background: #d1fae5; color: #065f46; }
        .score-good      { background: #dbeafe; color: #1e40af; }
        .score-fair       { background: #fef3c7; color: #92400e; }
        .score-poor       { background: #fee2e2; color: #991b1b; }

        /* Status badge */
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: 600;
        }

        .status-draft     { background: #f3f4f6; color: #6b7280; }
        .status-submitted { background: #fef3c7; color: #92400e; }
        .status-reviewed  { background: #d1fae5; color: #065f46; }

        /* Footer */
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #9ca3af;
        }

        /* No-print elements */
        .no-print { }

        .btn-print {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 24px;
            background: #1e3a5f;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 20px;
            transition: background 0.2s;
        }

        .btn-print:hover {
            background: #15304f;
        }

        .btn-back {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 24px;
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 20px;
            margin-right: 8px;
            transition: background 0.2s;
            text-decoration: none;
        }

        .btn-back:hover { background: #e5e7eb; }

        /* ---- Print media ---- */
        @media print {
            body { padding: 0; }
            .no-print { display: none !important; }

            .data-table thead th {
                background: #1e3a5f !important;
                color: #ffffff !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .data-table tbody tr:nth-child(even) {
                background: #f9fafb !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .score-badge, .status-badge, .grade-badge {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .summary-card {
                border: 1px solid #d1d5db !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            @page {
                size: A4 landscape;
                margin: 15mm 10mm;
            }
        }
    </style>
</head>
<body>

    {{-- Action buttons (hidden on print) --}}
    <div class="no-print" style="text-align: right;">
        <a href="javascript:history.back()" class="btn-back">← Kembali</a>
        <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
    </div>

    {{-- Page header --}}
    <div class="header">
        <h1>Rekap Evaluasi Monitoring &amp; Evaluasi</h1>
        <h2>{{ config('app.name', 'Sistem Penelitian Terintegrasi') }}</h2>
        @if($user->university)
            <div class="subtitle">{{ $user->university->name }}</div>
        @endif
    </div>

    {{-- Meta information --}}
    <div class="meta-info">
        <div>
            <strong>Dicetak oleh:</strong> {{ $user->name }} ({{ $user->role->name }})
        </div>
        <div>
            <strong>Tanggal Cetak:</strong> {{ $printDate }}
        </div>
    </div>

    @if(!empty($filters['period']) || !empty($filters['status']))
        <div class="meta-info">
            <div class="filters">
                <strong>Filter:</strong>
                @if(!empty($filters['period']))
                    <span>Periode: {{ $filters['period'] }}</span>
                @endif
                @if(!empty($filters['status']))
                    <span>Status: {{ ucfirst($filters['status']) }}</span>
                @endif
            </div>
        </div>
    @endif

    {{-- Summary statistics --}}
    <div class="summary-grid">
        <div class="summary-card">
            <div class="label">Total Evaluasi</div>
            <div class="value">{{ $statistics['total'] }}</div>
            <div class="unit">assessment</div>
        </div>
        <div class="summary-card">
            <div class="label">Rata-rata Skor</div>
            <div class="value">{{ number_format($statistics['average_score'], 1) }}%</div>
            <div class="unit">persentase</div>
        </div>
        <div class="summary-card">
            <div class="label">Skor Tertinggi</div>
            <div class="value">{{ number_format($statistics['max_score'], 1) }}%</div>
            <div class="unit">terbaik</div>
        </div>
        <div class="summary-card">
            <div class="label">Skor Terendah</div>
            <div class="value">{{ number_format($statistics['min_score'], 1) }}%</div>
            <div class="unit">terendah</div>
        </div>
    </div>

    {{-- Grade distribution --}}
    @if($statistics['by_grade']->count() > 0)
        <div class="grade-distribution">
            <h3>Distribusi Grade</h3>
            <div class="grade-badges">
                @foreach($statistics['by_grade'] as $grade => $count)
                    @php
                        $gradeClass = match(true) {
                            str_starts_with($grade, 'A') => 'grade-a',
                            str_starts_with($grade, 'B') => 'grade-b',
                            str_starts_with($grade, 'C') => 'grade-c',
                            str_starts_with($grade, 'D') => 'grade-d',
                            default => 'grade-e',
                        };
                    @endphp
                    <div class="grade-badge {{ $gradeClass }}">
                        {{ $grade }}
                        <span class="grade-count">{{ $count }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    {{-- Assessment data table --}}
    @if($assessments->count() > 0)
        <table class="data-table">
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th>Jurnal</th>
                    <th>Universitas</th>
                    <th>Pengelola</th>
                    <th class="text-center">Periode</th>
                    <th class="text-center">Tanggal</th>
                    <th class="text-center">Skor</th>
                    <th class="text-center">Persentase</th>
                    <th class="text-center">Grade</th>
                    <th class="text-center">Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($assessments as $index => $assessment)
                    @php
                        $scoreClass = match(true) {
                            $assessment->percentage >= 80 => 'score-excellent',
                            $assessment->percentage >= 60 => 'score-good',
                            $assessment->percentage >= 40 => 'score-fair',
                            default => 'score-poor',
                        };
                        $statusClass = 'status-' . $assessment->status;
                    @endphp
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>
                            <strong>{{ $assessment->journal->title ?? '-' }}</strong>
                            @if($assessment->journal?->issn)
                                <br><small style="color:#6b7280;">ISSN: {{ $assessment->journal->issn }}</small>
                            @endif
                        </td>
                        <td>{{ $assessment->journal->university->name ?? '-' }}</td>
                        <td>{{ $assessment->user->name ?? '-' }}</td>
                        <td class="text-center">{{ $assessment->period ?? '-' }}</td>
                        <td class="text-center">
                            {{ $assessment->assessment_date?->format('d/m/Y') ?? '-' }}
                        </td>
                        <td class="text-right">
                            {{ number_format($assessment->total_score, 2) }} / {{ number_format($assessment->max_score, 2) }}
                        </td>
                        <td class="text-center">
                            <span class="score-badge {{ $scoreClass }}">
                                {{ number_format($assessment->percentage, 1) }}%
                            </span>
                        </td>
                        <td class="text-center">
                            <strong>{{ $assessment->grade }}</strong>
                        </td>
                        <td class="text-center">
                            <span class="status-badge {{ $statusClass }}">
                                {{ $assessment->status_label }}
                            </span>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div style="text-align: center; padding: 40px; color: #9ca3af;">
            <p style="font-size: 14px;">Tidak ada data evaluasi yang ditemukan.</p>
            <p style="font-size: 11px;">Periksa filter yang dipilih atau hubungi administrator.</p>
        </div>
    @endif

    {{-- Footer --}}
    <div class="footer">
        <div>{{ config('app.name', 'Sistem Penelitian Terintegrasi') }} &copy; {{ date('Y') }}</div>
        <div>Halaman ini digenerate otomatis pada {{ $printDate }}</div>
    </div>

</body>
</html>
