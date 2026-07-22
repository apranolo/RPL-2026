<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Laporan Proposal Riset & Luaran</title>
    <style>
        /* ── Reset & Base ──────────────────────────────────── */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1f2937;
            line-height: 1.5;
            background: #ffffff;
        }

        /* ── Page Header ───────────────────────────────────── */
        .report-header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .report-header h1 {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a5f;
            margin-bottom: 4px;
        }

        .report-header h2 {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 2px;
        }

        .report-header .subtitle {
            font-size: 10px;
            color: #6b7280;
        }

        .filter-info {
            margin-top: 8px;
            font-size: 9px;
            color: #6b7280;
        }

        /* ── Summary Cards ─────────────────────────────────── */
        .summary-section {
            margin-bottom: 20px;
        }

        .summary-section h3 {
            font-size: 12px;
            font-weight: bold;
            color: #1e3a5f;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
        }

        .summary-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .summary-grid td {
            padding: 6px 10px;
            vertical-align: top;
        }

        .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 10px 14px;
            text-align: center;
        }

        .summary-card .label {
            font-size: 9px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .summary-card .value {
            font-size: 22px;
            font-weight: bold;
            color: #1e40af;
            margin: 4px 0 2px;
        }

        .summary-card .desc {
            font-size: 8px;
            color: #9ca3af;
        }

        /* ── Status Breakdown ─────────────────────────────── */
        .status-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .status-table th,
        .status-table td {
            padding: 5px 10px;
            text-align: center;
            border: 1px solid #e5e7eb;
            font-size: 9px;
        }

        .status-table th {
            background: #1e40af;
            color: #ffffff;
            font-weight: 600;
        }

        .status-table td {
            background: #f8fafc;
        }

        /* ── Detail Table ──────────────────────────────────── */
        .detail-section {
            margin-bottom: 20px;
        }

        .detail-section h3 {
            font-size: 12px;
            font-weight: bold;
            color: #1e3a5f;
            margin-bottom: 8px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 4px;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 9px;
        }

        .detail-table thead th {
            background: #1e40af;
            color: #ffffff;
            font-weight: 600;
            padding: 6px 8px;
            text-align: left;
            border: 1px solid #1e3a8a;
        }

        .detail-table tbody td {
            padding: 5px 8px;
            border: 1px solid #e5e7eb;
            vertical-align: top;
        }

        .detail-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }

        .detail-table tbody tr:nth-child(odd) {
            background: #ffffff;
        }

        /* ── Status Badges ─────────────────────────────────── */
        .badge {
            display: inline-block;
            padding: 1px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: 600;
        }

        .badge-draft { background: #f3f4f6; color: #6b7280; }
        .badge-submitted { background: #fef3c7; color: #92400e; }
        .badge-approved { background: #d1fae5; color: #065f46; }
        .badge-rejected { background: #fee2e2; color: #991b1b; }

        /* ── Footer ────────────────────────────────────────── */
        .report-footer {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 8px;
            color: #9ca3af;
        }

        .page-break {
            page-break-after: always;
        }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
    </style>
</head>
<body>

    {{-- ── HEADER ───────────────────────────────────────── --}}
    <div class="report-header">
        <h1>Sistem Monitoring & Evaluasi Penelitian</h1>
        <h2>Laporan Proposal Riset & Luaran Dosen</h2>
        <div class="subtitle">Dicetak pada: {{ $generatedAt }}</div>

        @if(count($filterLabels) > 0)
            <div class="filter-info">
                Filter: {{ implode(' | ', $filterLabels) }}
            </div>
        @endif
    </div>

    {{-- ── SUMMARY ──────────────────────────────────────── --}}
    <div class="summary-section">
        <h3>Ringkasan Statistik</h3>
        <table class="summary-grid">
            <tr>
                <td width="33%">
                    <div class="summary-card">
                        <div class="label">Total Proposal</div>
                        <div class="value">{{ $totalProposals }}</div>
                        <div class="desc">Proposal terdaftar</div>
                    </div>
                </td>
                <td width="33%">
                    <div class="summary-card">
                        <div class="label">Proposal Disetujui</div>
                        <div class="value">{{ $approvedProposals }}</div>
                        <div class="desc">
                            @if($totalProposals > 0)
                                {{ round(($approvedProposals / $totalProposals) * 100, 1) }}% dari total
                            @else
                                0%
                            @endif
                        </div>
                    </div>
                </td>
                <td width="33%">
                    <div class="summary-card">
                        <div class="label">Total Dana Disetujui</div>
                        <div class="value" style="font-size: 16px;">Rp {{ number_format($totalDana, 0, ',', '.') }}</div>
                        <div class="desc">Dana proposal approved</div>
                    </div>
                </td>
            </tr>
        </table>
    </div>

    {{-- ── STATUS BREAKDOWN ──────────────────────────────── --}}
    <div class="summary-section">
        <h3>Distribusi Status Proposal</h3>
        <table class="status-table">
            <thead>
                <tr>
                    @foreach($statusBreakdown as $status)
                        <th>{{ $status['label'] }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                <tr>
                    @foreach($statusBreakdown as $status)
                        <td class="font-bold">{{ $status['count'] }}</td>
                    @endforeach
                </tr>
            </tbody>
        </table>
    </div>

    {{-- ── SCHEMA BREAKDOWN ──────────────────────────────── --}}
    @if(count($schemaBreakdown) > 0)
    <div class="summary-section">
        <h3>Distribusi per Skema Penelitian</h3>
        <table class="detail-table">
            <thead>
                <tr>
                    <th width="5%">No</th>
                    <th>Skema Penelitian</th>
                    <th width="15%" class="text-center">Jumlah Proposal</th>
                    <th width="20%" class="text-right">Total Dana (Rp)</th>
                    <th width="15%" class="text-center">Persentase</th>
                </tr>
            </thead>
            <tbody>
                @foreach($schemaBreakdown as $index => $schema)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $schema['name'] }}</td>
                    <td class="text-center font-bold">{{ $schema['count'] }}</td>
                    <td class="text-right">{{ number_format($schema['total_dana'], 0, ',', '.') }}</td>
                    <td class="text-center">
                        @if($totalProposals > 0)
                            {{ round(($schema['count'] / $totalProposals) * 100, 1) }}%
                        @else
                            0%
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    {{-- ── DETAIL TABLE ─────────────────────────────────── --}}
    <div class="detail-section">
        <h3>Detail Proposal Riset ({{ $totalProposals }} proposal)</h3>

        @if($proposals->isEmpty())
            <p style="text-align: center; color: #9ca3af; padding: 20px;">
                Tidak ada data proposal yang sesuai dengan filter.
            </p>
        @else
            <table class="detail-table">
                <thead>
                    <tr>
                        <th width="4%">No</th>
                        <th width="25%">Judul Proposal</th>
                        <th width="15%">Nama Dosen</th>
                        <th width="15%">Skema Penelitian</th>
                        <th width="10%">Status</th>
                        <th width="15%">Nominal Dana (Rp)</th>
                        <th width="8%">Jumlah Luaran</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($proposals as $index => $proposal)
                    <tr>
                        <td class="text-center">{{ $index + 1 }}</td>
                        <td>{{ $proposal->title }}</td>
                        <td>{{ $proposal->user?->name ?? '-' }}</td>
                        <td>{{ $proposal->researchSchema?->name ?? '-' }}</td>
                        <td class="text-center">
                            <span class="badge badge-{{ $proposal->status }}">
                                {{ $proposal->status_label }}
                            </span>
                        </td>
                        <td class="text-right">
                            @if($proposal->dana)
                                {{ number_format($proposal->dana, 0, ',', '.') }}
                            @else
                                -
                            @endif
                        </td>
                        <td class="text-center">
                            {{ $proposal->researchOutputs->count() }}
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>

    {{-- ── FOOTER ───────────────────────────────────────── --}}
    <div class="report-footer">
        <p>Dokumen ini digenerate secara otomatis oleh Sistem Monitoring & Evaluasi Penelitian</p>
        <p>Tanggal cetak: {{ $generatedAt }} | Total data: {{ $totalProposals }} proposal</p>
    </div>

</body>
</html>
