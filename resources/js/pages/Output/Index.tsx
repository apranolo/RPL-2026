import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface ResearchOutput {
    id: number;
    judul: string;
    kategori: string;
    status: string;
    keterangan: string | null;
    cover_image: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
    };
    tkt_level?: number | null;
    version?: string | null;
    year?: number | null;
    url?: string | null;
}

interface Props {
    outputs: {
        data: ResearchOutput[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// Breadcrumbs dinamis sesuai standar AppLayout
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('dashboard') },
    { title: 'Luaran Penelitian', href: route('user.outputs.index') },
];

export default function Index({ outputs }: Props) {
    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            draft:      'bg-gray-100 text-gray-700',
            submitted:  'bg-yellow-100 text-yellow-800',
            approved:   'bg-green-100 text-green-800',
            rejected:   'bg-red-100 text-red-800',
            published:  'bg-blue-100 text-blue-800',
            patented:   'bg-purple-100 text-purple-800',
        };
        return colors[status] ?? 'bg-gray-100 text-gray-700';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            draft:     'Draft',
            submitted: 'Diajukan',
            approved:  'Disetujui',
            rejected:  'Ditolak',
            published: 'Dipublikasi',
            patented:  'Dipatenkan',
        };
        return labels[status] ?? status;
    };

    const getKategoriBadge = (kategori: string) => {
        const colors: Record<string, string> = {
            jurnal:   'bg-blue-100 text-blue-800',
            buku:     'bg-purple-100 text-purple-800',
            hki:      'bg-green-100 text-green-800',
            prosiding:'bg-orange-100 text-orange-800',
            produk:   'bg-pink-100 text-pink-800',
        };
        return colors[kategori] ?? 'bg-gray-100 text-gray-700';
    };

    const getKategoriLabel = (kategori: string) => {
        const labels: Record<string, string> = {
            jurnal:    'Jurnal',
            buku:      'Buku',
            hki:       'HKI',
            prosiding: 'Prosiding',
            produk:    'Produk/Prototipe',
        };
        return labels[kategori] ?? kategori;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Luaran Penelitian" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Daftar Luaran Penelitian Saya
                        </h1>
                        <span className="text-sm text-gray-500">
                            Total: {outputs.total} luaran
                        </span>
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
                                        <tr key={output.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {output.judul}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getKategoriBadge(output.kategori)}`}>
                                                    {getKategoriLabel(output.kategori)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(output.status)}`}>
                                                    {getStatusLabel(output.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(output.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {output.status === 'draft' && (
                                                    <Link
                                                        href={route('user.outputs.edit', output.id)}
                                                        className="mr-3 text-indigo-600 hover:text-indigo-800"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
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
