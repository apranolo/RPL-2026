/**
 * Log Perubahan Termin Pendanaan
 *
 * @author MUHAMAD BURHANUDIN AL BACHTIAR
 */
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface FundingLog {
    id: number;
    termin_number: string;
    amount: number;
    status: string;
    updated_at: string;
    contract?: {
        title: string;
    };
    // updated_by sudah dihapus dari sini
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    logs: {
        data: FundingLog[];
        links: PaginationLink[];
    };
}

export default function Logs({ logs }: Props) {
    // State untuk menyimpan pengaturan cetak PDF
    const [paperSize, setPaperSize] = useState('A4');
    const [orientation, setOrientation] = useState('landscape');
    const [customWidth, setCustomWidth] = useState(600);
    const [customHeight, setCustomHeight] = useState(300);

    // Fungsi untuk merakit URL cetak secara dinamis
    const getPrintUrl = (id: number) => {
        let url = `/finance/funding/${id}/print?size=${paperSize}&orientation=${orientation}`;
        if (paperSize === 'custom') {
            url += `&width=${customWidth}&height=${customHeight}`;
        }
        return url;
    };

    return (
        <>
            <Head title="Log Perubahan Termin" />

            <div className="mx-auto max-w-7xl p-8 font-sans text-black">
                {/* Header */}
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight uppercase">Riwayat Termin</h1>
                        <p className="mt-1 text-sm font-medium">LOG PERUBAHAN DAN CETAK KWITANSI PENDANAAN</p>
                    </div>
                </div>

                {/* Panel Pengaturan Cetak (Control Bar) */}
                <div className="mb-4 flex flex-wrap items-center gap-4 border-2 border-black bg-gray-50 p-4">
                    <div className="text-xs font-bold uppercase">⚙️ Pengaturan Kertas:</div>

                    {/* Pilih Ukuran Kertas */}
                    <select
                        value={paperSize}
                        onChange={(e) => setPaperSize(e.target.value)}
                        className="cursor-pointer border border-black bg-white px-3 py-1 text-xs font-bold uppercase outline-none"
                    >
                        <option value="A4">A4</option>
                        <option value="legal">Legal</option>
                        <option value="letter">Letter</option>
                        <option value="custom">Custom (PT)</option>
                    </select>

                    {/* Pilih Orientasi (Sembunyikan jika mode Custom) */}
                    {paperSize !== 'custom' && (
                        <select
                            value={orientation}
                            onChange={(e) => setOrientation(e.target.value)}
                            className="cursor-pointer border border-black bg-white px-3 py-1 text-xs font-bold uppercase outline-none"
                        >
                            <option value="landscape">Landscape</option>
                            <option value="portrait">Portrait</option>
                        </select>
                    )}

                    {/* Input untuk mode Custom */}
                    {paperSize === 'custom' && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase">W:</span>
                            <input
                                type="number"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(Number(e.target.value))}
                                className="w-20 border border-black px-2 py-1 text-xs outline-none"
                                placeholder="Width"
                            />
                            <span className="text-xs font-bold uppercase">H:</span>
                            <input
                                type="number"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(Number(e.target.value))}
                                className="w-20 border border-black px-2 py-1 text-xs outline-none"
                                placeholder="Height"
                            />
                        </div>
                    )}
                </div>

                {/* Tabel Data */}
                <div className="mb-8 w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-y-2 border-black text-xs tracking-wider uppercase">
                                <th className="px-2 py-4">Judul Kontrak</th>
                                <th className="px-2 py-4">Termin</th>
                                <th className="px-2 py-4">Nominal</th>
                                <th className="px-2 py-4">Status</th>
                                {/* Kolom Updated By sudah dihapus dari sini */}
                                <th className="px-2 py-4">Updated At</th>
                                <th className="px-2 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.data.map((log) => (
                                <tr key={log.id} className="border-b border-black transition-colors hover:bg-gray-50">
                                    <td className="px-2 py-4 font-medium">{log.contract?.title ?? '-'}</td>
                                    <td className="px-2 py-4">{log.termin_number}</td>
                                    <td className="px-2 py-4 font-mono text-base">Rp {Number(log.amount).toLocaleString('id-ID')}</td>
                                    <td className="px-2 py-4">
                                        <span className="border border-black px-2 py-1 text-xs font-bold uppercase">{log.status}</span>
                                    </td>
                                    {/* Data Updated By sudah dihapus dari sini */}
                                    <td className="px-2 py-4">
                                        {new Date(log.updated_at).toLocaleString('id-ID', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>
                                    <td className="px-2 py-4 text-right">
                                        <a
                                            href={getPrintUrl(log.id)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block bg-black px-4 py-2 text-xs font-bold tracking-wider text-white uppercase transition-all hover:bg-transparent hover:text-black hover:ring-2 hover:ring-black hover:ring-inset"
                                        >
                                            Cetak PDF
                                        </a>
                                    </td>
                                </tr>
                            ))}

                            {logs.data.length === 0 && (
                                <tr>
                                    {/* colSpan diubah menjadi 6 karena jumlah kolom sisa 6 */}
                                    <td colSpan={6} className="border-b border-black py-8 text-center text-sm font-medium uppercase">
                                        Tidak ada riwayat termin ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Navigasi Paginasi */}
                {logs.links && logs.links.length > 3 && (
                    <div className="flex flex-wrap justify-end gap-2">
                        {logs.links.map((link, index) => {
                            if (link.url === null) {
                                return (
                                    <div
                                        key={index}
                                        className="cursor-not-allowed border border-gray-300 px-4 py-2 text-sm font-bold text-gray-400 uppercase"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`border border-black px-4 py-2 text-sm font-bold uppercase transition-colors ${
                                        link.active ? 'bg-black text-white' : 'bg-white text-black hover:bg-black hover:text-white'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
