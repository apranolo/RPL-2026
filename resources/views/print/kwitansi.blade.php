<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            color: #000; 
            font-size: 10pt; 
            margin: 0; 
            padding: 30px; 
            background-color: #fff;
        }
        .title { 
            font-size: 24pt; 
            font-weight: bold; 
            text-transform: uppercase; 
            letter-spacing: 2px; 
            margin-bottom: 5px; 
        }
        .header-info {
            font-size: 9pt;
            text-transform: uppercase;
            font-weight: bold;
        }
        .divider { 
            border-top: 3px solid #000; 
            margin: 20px 0; 
        }
        .info-table { 
            width: 100%; 
            margin-bottom: 40px; 
            border-collapse: collapse; 
        }
        .info-table td { 
            padding: 15px 0; 
            border-bottom: 1px solid #000; 
        }
        .label { 
            width: 35%; 
            font-weight: bold; 
            text-transform: uppercase; 
            font-size: 9pt; 
        }
        .value { 
            font-size: 11pt; 
        }
        .amount { 
            font-size: 16pt; 
            font-weight: bold; 
        }
        .signature-area { 
            width: 100%; 
            margin-top: 50px; 
        }
        .signature-box { 
            float: right; 
            width: 250px; 
            text-align: center; 
        }
        .signature-line { 
            border-bottom: 1px solid #000; 
            margin-top: 80px; 
            margin-bottom: 5px; 
        }
        .text-sm { 
            font-size: 9pt;
            text-transform: uppercase;
            font-weight: bold;
        }
    </style>
</head>
<body>
    
    <div class="title">Kwitansi Termin</div>
    <div class="header-info">TANGGAL CETAK: {{ $date }} &nbsp;|&nbsp; ID PENDANAAN: #{{ $funding->id }}</div>
    
    <div class="divider"></div>

    <table class="info-table">
        <tr>
            <td class="label">Instansi / Universitas</td>
            <td class="value">{{ $funding->contract->university->name ?? 'Tidak Tersedia' }}</td>
        </tr>
        <tr>
            <td class="label">Pembayaran Termin Ke</td>
            <td class="value">{{ $funding->termin_number ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Jumlah Dana</td>
            <td class="value amount">Rp {{ number_format($funding->amount ?? 0, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label">Keterangan</td>
            <td class="value">{{ $funding->description ?? 'Pencairan Dana Termin' }}</td>
        </tr>
    </table>

    <div class="signature-area">
        <div class="signature-box">
            <div class="label">Mengetahui, Bagian Keuangan</div>
            <div class="signature-line"></div>
            <div class="text-sm">Tanda Tangan & Cap Resmi</div>
        </div>
    </div>

</body>
</html>