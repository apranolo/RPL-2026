/**
 * @file Logs.tsx
 * @description Halaman Log Perubahan Termin Pendanaan.
 * Bertugas menampilkan riwayat perubahan termin beserta fitur cetak PDF kwitansi.
 *
 * @author MUHAMAD BURHANUDIN AL BACHTIAR
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
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
        <AppLayout>
            <Head title="Log Perubahan Termin" />

            <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                {/* --- Breadcrumbs Manual --- */}
                <div className="mb-4 text-sm font-medium text-gray-500">
                    <Link href="/finance" className="transition-colors hover:text-gray-900">
                        Finance
                    </Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-900">Funding Logs</span>
                </div>
                {/* -------------------------- */}

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold tracking-tight">Riwayat Termin</CardTitle>
                        <CardDescription>Log perubahan dan cetak kwitansi pendanaan.</CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Panel Pengaturan Cetak (Control Bar) */}
                        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                            <span className="text-sm font-semibold text-gray-700">⚙️ Pengaturan Kertas:</span>

                            <Select value={paperSize} onValueChange={setPaperSize}>
                                <SelectTrigger className="w-[140px] bg-white">
                                    <SelectValue placeholder="Pilih Kertas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="A4">A4</SelectItem>
                                    <SelectItem value="legal">Legal</SelectItem>
                                    <SelectItem value="letter">Letter</SelectItem>
                                    <SelectItem value="custom">Custom (PT)</SelectItem>
                                </SelectContent>
                            </Select>

                            {paperSize !== 'custom' && (
                                <Select value={orientation} onValueChange={setOrientation}>
                                    <SelectTrigger className="w-[140px] bg-white">
                                        <SelectValue placeholder="Orientasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="landscape">Landscape</SelectItem>
                                        <SelectItem value="portrait">Portrait</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            {paperSize === 'custom' && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600">W:</span>
                                        <Input
                                            type="number"
                                            value={customWidth}
                                            onChange={(e) => setCustomWidth(Number(e.target.value))}
                                            className="w-24 bg-white"
                                            placeholder="Width"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-600">H:</span>
                                        <Input
                                            type="number"
                                            value={customHeight}
                                            onChange={(e) => setCustomHeight(Number(e.target.value))}
                                            className="w-24 bg-white"
                                            placeholder="Height"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabel Data */}
                        <div className="overflow-hidden rounded-md border border-gray-200">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="border-b border-gray-200 bg-gray-50/80 text-xs text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Judul Kontrak</th>
                                        <th className="px-4 py-3 font-semibold">Termin</th>
                                        <th className="px-4 py-3 font-semibold">Nominal</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Updated At</th>
                                        <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {logs.data.map((log) => (
                                        <tr key={log.id} className="bg-white transition-colors hover:bg-gray-50/50">
                                            <td className="px-4 py-4 font-medium text-gray-900">{log.contract?.title ?? '-'}</td>
                                            <td className="px-4 py-4">{log.termin_number}</td>
                                            <td className="px-4 py-4 font-mono text-gray-900">Rp {Number(log.amount).toLocaleString('id-ID')}</td>
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-gray-500">
                                                {new Date(log.updated_at).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button asChild size="sm">
                                                    <a href={getPrintUrl(log.id)} target="_blank" rel="noopener noreferrer">
                                                        Cetak PDF
                                                    </a>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}

                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-sm font-medium text-gray-500">
                                                Tidak ada riwayat termin ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Navigasi Paginasi */}
                        {logs.links && logs.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap items-center justify-end gap-1">
                                {logs.links.map((link, index) => {
                                    if (link.url === null) {
                                        return (
                                            <span
                                                key={index}
                                                className="cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                                                link.active
                                                    ? 'border-gray-900 bg-gray-900 font-medium text-white'
                                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
