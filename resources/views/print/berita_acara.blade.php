<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Berita Acara Review - {{ $journal->title ?? 'Jurnal' }}</title>
    <style>
        /* General styling for screen and print */
        body {
            font-family: "Times New Roman", Times, serif;
            color: #000;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            font-size: 12pt;
            background-color: #fff;
        }
        
        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 30px;
            box-sizing: border-box;
        }

        /* Kop Surat (Institutional Header) */
        .kop-surat {
            display: flex;
            align-items: center;
            border-bottom: 4px double #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .logo-container {
            flex: 0 0 80px;
            text-align: center;
            margin-right: 15px;
        }

        .logo-img {
            max-width: 75px;
            height: auto;
        }
        
        .kop-text {
            flex: 1;
            text-align: center;
        }
        
        .kop-text h1 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
        }
        
        .kop-text h2 {
            font-size: 12pt;
            font-weight: bold;
            margin: 3px 0;
            text-transform: uppercase;
        }
        
        .kop-text h3 {
            font-size: 13pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .kop-text p {
            font-size: 9pt;
            margin: 5px 0 0 0;
            font-style: italic;
        }

        /* Document Title */
        .doc-title {
            text-align: center;
            margin: 25px 0 20px 0;
        }
        
        .doc-title h2 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
            text-decoration: underline;
        }
        
        .doc-title p {
            font-size: 11pt;
            margin: 5px 0 0 0;
        }

        /* Content spacing */
        .preamble {
            text-align: justify;
            margin-bottom: 15px;
            text-indent: 40px;
        }

        /* Section titles */
        .section-title {
            font-weight: bold;
            margin-top: 15px;
            margin-bottom: 8px;
            font-size: 11pt;
            text-transform: uppercase;
        }

        /* Tables styling */
        .table-data {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 11pt;
        }
        
        .table-data td {
            padding: 6px 8px;
            vertical-align: top;
        }

        .table-data td.label {
            width: 200px;
        }

        .table-data td.colon {
            width: 10px;
            text-align: center;
        }
        
        /* Box Table for results */
        .table-bordered {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11pt;
        }
        
        .table-bordered th, .table-bordered td {
            border: 1px solid #000;
            padding: 8px 10px;
            text-align: left;
        }
        
        .table-bordered th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
        }

        /* Feedback box */
        .feedback-content {
            border: 1px solid #000;
            background-color: #fafafa;
            padding: 12px;
            font-size: 11pt;
            text-align: justify;
            white-space: pre-wrap;
            margin-bottom: 25px;
        }

        /* Signatures block */
        .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        
        .signature-col {
            width: 45%;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        .signature-title {
            margin-bottom: 75px;
        }

        .signature-name {
            font-weight: bold;
            text-decoration: underline;
        }
        
        .signature-id {
            font-size: 10pt;
        }

        /* Controls visible only on screen */
        .no-print-toolbar {
            background-color: #f3f4f6;
            padding: 10px 20px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .btn {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            border: none;
            cursor: pointer;
            font-family: sans-serif;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s;
        }

        .btn:hover {
            background-color: #1d4ed8;
        }

        .btn-secondary {
            background-color: #4b5563;
        }
        
        .btn-secondary:hover {
            background-color: #374151;
        }

        /* Print styles optimization */
        @media print {
            .no-print-toolbar {
                display: none !important;
            }
            
            body {
                font-size: 12pt;
                background-color: #fff;
            }
            
            .container {
                padding: 0;
                width: 100%;
                max-width: 100%;
            }
            
            @page {
                size: A4;
                margin: 2cm;
            }
            
            .feedback-content {
                background-color: #fff !important;
            }
        }
    </style>
</head>
<body>

    <!-- Screen Toolbar -->
    <div class="no-print-toolbar">
        <span style="font-family: sans-serif; font-size: 14px; color: #4b5563;">Pratinjau Cetak Berita Acara</span>
        <div style="display: flex; gap: 10px;">
            <button onclick="window.print()" class="btn">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-2-9v12H8V9h8z"/></svg>
                Cetak Dokumen
            </button>
            <button onclick="window.close()" class="btn btn-secondary">Tutup</button>
        </div>
    </div>

    <div class="container">
        <!-- Kop Surat -->
        <div class="kop-surat">
            <div class="logo-container">
                <img src="{{ asset('logo_dark.png') }}" class="logo-img" alt="Logo">
            </div>
            <div class="kop-text">
                <h1>Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi</h1>
                <h2>Direktorat Jenderal Pendidikan Tinggi, Riset, dan Teknologi</h2>
                <h3>Tim Reviewer Akreditasi & Pembinaan Jurnal Nasional</h3>
                <p>Gedung D Kemendikbudristek, Jl. Jenderal Sudirman, Senayan, Jakarta 10270</p>
            </div>
        </div>

        <!-- Document Header -->
        <div class="doc-title">
            @if ($type === 'pembinaan')
                <h2>BERITA ACARA HASIL REVIEW PROGRAM PEMBINAAN JURNAL</h2>
            @else
                <h2>BERITA ACARA HASIL PENILAIAN JURNAL ILMIAH</h2>
            @endif
            <p>Nomor: BA-REV/{{ \Carbon\Carbon::parse($review->reviewed_at ?? now())->format('Y') }}/{{ str_pad($review->id, 4, '0', STR_PAD_LEFT) }}</p>
        </div>

        @php
            $hariIndo = [
                'Sunday' => 'Minggu',
                'Monday' => 'Senin',
                'Tuesday' => 'Selasa',
                'Wednesday' => 'Rabu',
                'Thursday' => 'Kamis',
                'Friday' => 'Jumat',
                'Saturday' => 'Sabtu'
            ];
            $carbonDate = \Carbon\Carbon::parse($review->reviewed_at ?? now())->locale('id');
            $hari = $hariIndo[$carbonDate->format('l')] ?? $carbonDate->isoFormat('dddd');
            $tanggal = $carbonDate->isoFormat('D MMMM YYYY');
        @endphp

        <!-- Preamble -->
        <p class="preamble">
            Pada hari ini, <strong>{{ $hari }}</strong>, tanggal <strong>{{ $tanggal }}</strong>, telah dilaksanakan proses review/penilaian terhadap dokumen pengusulan jurnal dalam sistem informasi pengelolaan jurnal. Hasil review komprehensif dirinci sebagai berikut:
        </p>

        <!-- Section 1: Data Jurnal -->
        <div class="section-title">I. Identitas Jurnal dan Pengusul</div>
        <table class="table-data">
            <tr>
                <td class="label">Judul Jurnal</td>
                <td class="colon">:</td>
                <td><strong>{{ $journal->title ?? '-' }}</strong></td>
            </tr>
            <tr>
                <td class="label">ISSN (Print) / E-ISSN</td>
                <td class="colon">:</td>
                <td>{{ $journal->issn ?? '-' }} / {{ $journal->e_issn ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Penerbit / Universitas</td>
                <td class="colon">:</td>
                <td>{{ $journal->publisher ?? '-' }} / {{ $journal->university?->name ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Bidang Keilmuan</td>
                <td class="colon">:</td>
                <td>{{ $journal->scientificField?->name ?? '-' }}</td>
            </tr>
            <tr>
                <td class="label">Nama Pengusul / Pengelola</td>
                <td class="colon">:</td>
                <td>
                    @if ($type === 'pembinaan')
                        {{ $review->registration?->user?->name ?? '-' }}
                    @else
                        {{ $review->user?->name ?? '-' }}
                    @endif
                </td>
            </tr>
        </table>

        <!-- Section 2: Detail Evaluasi -->
        <div class="section-title">II. Informasi Pelaksanaan Evaluasi</div>
        <table class="table-data">
            @if ($type === 'pembinaan')
                <tr>
                    <td class="label">Nama Program Pembinaan</td>
                    <td class="colon">:</td>
                    <td>{{ $review->registration?->pembinaan?->name ?? 'Program Pembinaan' }}</td>
                </tr>
                <tr>
                    <td class="label">Kategori Program</td>
                    <td class="colon">:</td>
                    <td>{{ ucfirst($review->registration?->pembinaan?->category ?? '-') }}</td>
                </tr>
            @else
                <tr>
                    <td class="label">Jenis Penilaian</td>
                    <td class="colon">:</td>
                    <td>Penilaian Mandiri Jurnal Ilmiah (Self-Assessment)</td>
                </tr>
                <tr>
                    <td class="label">Periode Penilaian</td>
                    <td class="colon">:</td>
                    <td>{{ $review->period ?? '-' }}</td>
                </tr>
            @endif
            <tr>
                <td class="label">Tanggal Selesai Review</td>
                <td class="colon">:</td>
                <td>{{ $carbonDate->isoFormat('D MMMM YYYY, HH:mm') }} WIB</td>
            </tr>
        </table>

        <!-- Section 3: Hasil Penilaian -->
        <div class="section-title">III. Hasil Evaluasi Akhir</div>
        <table class="table-bordered">
            <thead>
                <tr>
                    <th style="width: 40%;">Parameter</th>
                    <th style="width: 30%;">Nilai / Persentase</th>
                    <th style="width: 30%;">Hasil Rekomendasi</th>
                </tr>
            </thead>
            <tbody>
                @if ($type === 'pembinaan')
                    <tr>
                        <td>Skor Kelayakan (0 - 100)</td>
                        <td style="text-align: center; font-size: 13pt; font-weight: bold;">
                            {{ number_format($review->score, 2) }}
                        </td>
                        <td style="text-align: center; font-weight: bold;">
                            {{ $review->score_label }}
                        </td>
                    </tr>
                    <tr>
                        <td>Status Kelayakan</td>
                        <td colspan="2" style="text-align: center; font-weight: bold; color: #16a34a;">
                            Dapat Direkomendasikan
                        </td>
                    </tr>
                @else
                    <tr>
                        <td>Skor Total / Maksimum</td>
                        <td style="text-align: center; font-size: 13pt; font-weight: bold;">
                            {{ number_format($review->total_score, 2) }} / {{ number_format($review->max_score, 2) }}
                        </td>
                        <td rowspan="2" style="text-align: center; font-weight: bold; font-size: 13pt; vertical-align: middle;">
                            {{ $review->grade }}
                        </td>
                    </tr>
                    <tr>
                        <td>Persentase Pencapaian</td>
                        <td style="text-align: center; font-size: 13pt; font-weight: bold;">
                            {{ number_format($review->percentage, 2) }}%
                        </td>
                    </tr>
                @endif
            </tbody>
        </table>

        <!-- Feedback & Recommendation Notes -->
        <div class="section-title">Catatan Dan Rekomendasi Reviewer:</div>
        <div class="feedback-content">{!! nl2br(e($review->feedback ?? $review->admin_notes ?? 'Tidak ada catatan tambahan.')) !!}</div>

        @if ($type === 'pembinaan' && !empty($review->recommendation))
            <div class="section-title">Rekomendasi Tindak Lanjut:</div>
            <div class="feedback-content">{!! nl2br(e($review->recommendation)) !!}</div>
        @endif

        <!-- Signatures -->
        <div class="signatures">
            <div class="signature-col">
                <div class="signature-title">
                    Reviewer/Penilai,
                </div>
                <div>
                    <div class="signature-name">{{ $review->reviewer?->name ?? 'Reviewer' }}</div>
                    <div class="signature-id">NIDN/NIP: {{ $review->reviewer?->position ?? '-' }}</div>
                </div>
            </div>
            
            <div class="signature-col">
                <div class="signature-title">
                    Pengusul Jurnal,
                </div>
                <div>
                    <div class="signature-name">
                        @if ($type === 'pembinaan')
                            {{ $review->registration?->user?->name ?? '-' }}
                        @else
                            {{ $review->user?->name ?? '-' }}
                        @endif
                    </div>
                    <div class="signature-id">Pengelola Jurnal</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Auto trigger browser print window on load
        window.onload = function() {
            // Check if not inside an iframe to prevent recursive printing issues
            if (window.self === window.top) {
                // Short timeout to allow CSS/images rendering
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        };
    </script>
</body>
</html>
