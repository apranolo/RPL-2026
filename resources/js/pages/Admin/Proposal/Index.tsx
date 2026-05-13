import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface University {
    id: number;
    name: string;
}

interface Proposal {
    id: number;
    judul: string;
    abstrak: string | null;
    status: string;
    tahun: number | null;
    user: User;
    university: University | null;
    created_at: string;
}

interface Props {
    proposals: Proposal[];
}

const statusColor: Record<string, string> = {
    draft:     'bg-gray-100 text-gray-700',
    submitted: 'bg-blue-100 text-blue-700',
    reviewed:  'bg-yellow-100 text-yellow-700',
    approved:  'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
};

export default function ProposalIndex({ proposals }: Props) {
    return (
        <AppLayout>
            <Head title="Semua Proposal Penelitian" />

            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Semua Proposal Penelitian
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Menampilkan seluruh proposal dari semua universitas
                    </p>
                </div>

                {proposals.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        Belum ada proposal yang diajukan.
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Judul</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pengusul</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Universitas</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tahun</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {proposals.map((proposal, index) => (
                                    <tr key={proposal.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {index + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                {proposal.judul}
                                            </div>
                                            {proposal.abstrak && (
                                                <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                                                    {proposal.abstrak}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900">{proposal.user.name}</div>
                                            <div className="text-xs text-gray-400">{proposal.user.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {proposal.university?.name ?? '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">
                                            {proposal.tahun ?? '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${statusColor[proposal.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {proposal.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {proposal.created_at}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}