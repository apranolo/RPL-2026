import { Head, Link } from '@inertiajs/react';

interface FundingLog {
    id: number;
    termin: string;
    nominal: number;
    status: string;
    updated_at: string;
    project?: {
        name: string;
    };
    updated_by?: {
        name: string;
    };
}

// Menambahkan interface khusus untuk link paginasi dari Laravel
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

                {/* Tabel Data */}
                <div className="mb-8 w-full overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-y-2 border-black text-xs tracking-wider uppercase">
                                <th className="px-2 py-4">Project</th>
                                <th className="px-2 py-4">Termin</th>
                                <th className="px-2 py-4">Nominal</th>
                                <th className="px-2 py-4">Status</th>
                                <th className="px-2 py-4">Updated By</th>
                                <th className="px-2 py-4">Updated At</th>
                                <th className="px-2 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>

                        <tbody>
                            {logs.data.map((log) => (
                                <tr key={log.id} className="border-b border-black transition-colors hover:bg-gray-50">
                                    <td className="px-2 py-4 font-medium">{log.project?.name ?? '-'}</td>
                                    <td className="px-2 py-4">{log.termin}</td>
                                    <td className="px-2 py-4 font-mono text-base">Rp {Number(log.nominal).toLocaleString('id-ID')}</td>
                                    <td className="px-2 py-4">
                                        <span className="border border-black px-2 py-1 text-xs font-bold uppercase">{log.status}</span>
                                    </td>
                                    <td className="px-2 py-4">{log.updated_by?.name ?? '-'}</td>
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
                                            href={`/finance/funding/${log.id}/print`}
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
                                    <td colSpan={7} className="border-b border-black py-8 text-center text-sm font-medium uppercase">
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
                            // Jika URL null (misal: tombol 'Previous' di halaman 1), render text biasa
                            if (link.url === null) {
                                return (
                                    <div
                                        key={index}
                                        className="cursor-not-allowed border border-gray-300 px-4 py-2 text-sm font-bold text-gray-400 uppercase"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            }

                            // Jika ada URL, render komponen Link Inertia
                            return (
                                <Link
                                    key={index}
                                    href={link.url}
                                    className={`border border-black px-4 py-2 text-sm font-bold uppercase transition-colors ${
                                        link.active
                                            ? 'bg-black text-white' // Style untuk halaman aktif
                                            : 'bg-white text-black hover:bg-black hover:text-white' // Style untuk halaman lain
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
