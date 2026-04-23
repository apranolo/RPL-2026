import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface ResearchOutput {
    id: number;
    judul: string;
    kategori: string;
    status: string;
    file_path: string | null;
    keterangan: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
}

interface Props extends PageProps {
    outputs: {
        data: ResearchOutput[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function Index({ outputs }: Props) {
    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-200 text-gray-800',
            submitted: 'bg-yellow-200 text-yellow-800',
            approved: 'bg-green-200 text-green-800',
            rejected: 'bg-red-200 text-red-800',
        };
        return colors[status] || 'bg-gray-200 text-gray-800';
    };

    const getKategoriBadge = (kategori: string) => {
        const colors: Record<string, string> = {
            jurnal: 'bg-blue-200 text-blue-800',
            buku: 'bg-purple-200 text-purple-800',
            hki: 'bg-green-200 text-green-800',
            prosiding: 'bg-orange-200 text-orange-800',
            produk: 'bg-pink-200 text-pink-800',
        };
        return colors[kategori] || 'bg-gray-200 text-gray-800';
    };

    return (
        <AppLayout>
            <Head title="Daftar Luaran Penelitian" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Daftar Luaran Penelitian Saya</h1>
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Judul</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {outputs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            Belum ada data luaran penelitian.
                                        </td>
                                    </tr>
                                ) : (
                                    outputs.data.map((output) => (
                                        <tr key={output.id}>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{output.judul}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs ${getKategoriBadge(output.kategori)}`}>
                                                    {output.kategori.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs ${getStatusBadge(output.status)}`}>
                                                    {output.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(output.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className="text-gray-400">Detail</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
