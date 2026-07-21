import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Submission {
    id: number;
    title: string;
    abstract: string;
    keywords: string;
    status: string;
    journal?: {
        id: number;
        title: string;
    };
    created_at: string;
}

interface IndexProps {
    submissions: Submission[];
}

/**
 * Helper untuk mendapatkan kelas warna Tailwind dan label teks
 * yang sesuai dengan status editorial OJS terbaru.
 */
const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'draft':
            return {
                label: 'Draft',
                className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
            };
        case 'submitted':
            return {
                label: 'Submitted',
                className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
            };
        case 'in_review':
        case 'under_review':
            return {
                label: 'In Review',
                className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
            };
        case 'revision_required':
            return {
                label: 'Revision Required',
                className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
            };
        case 'copyediting':
            return {
                label: 'Copyediting',
                className: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
            };
        case 'production':
            return {
                label: 'Production',
                className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
            };
        case 'published':
        case 'accepted':
            return {
                label: 'Published',
                className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
            };
        case 'declined':
        case 'rejected':
            return {
                label: 'Declined',
                className: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
            };
        default:
            return {
                label: status.replace('_', ' ').toUpperCase(),
                className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
            };
    }
};

export default function Index({ submissions }: IndexProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus submisi ini?')) {
            router.delete(`/submissions/${id}`);
        }
    };

    const filteredSubmissions = submissions.filter(
        (submission) =>
            submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            submission.journal?.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 dark:bg-zinc-900">
            <Head title="Daftar Submisi Saya" />

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="overflow-hidden border border-gray-200 bg-white shadow-sm sm:rounded-lg dark:border-zinc-700 dark:bg-zinc-800">
                    <div className="p-6 text-gray-900 dark:text-zinc-100">
                        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-2xl font-bold">Daftar Submisi Saya</h1>
                                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                                    Kelola dan pantau status naskah artikel ilmiah yang Anda kirimkan.
                                </p>
                            </div>
                            <Link
                                href="/submissions/create"
                                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition duration-150 ease-in-out hover:bg-blue-700"
                            >
                                Kirim Submisi Baru
                            </Link>
                        </div>

                        {/* Filter & Search Bar */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Cari berdasarkan judul naskah atau nama jurnal..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full max-w-md rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100"
                            />
                        </div>

                        {/* Submissions Table */}
                        {filteredSubmissions.length === 0 ? (
                            <div className="rounded-lg border-2 border-dashed border-gray-300 py-12 text-center dark:border-zinc-700">
                                <p className="text-gray-500 dark:text-zinc-400">Tidak ada data submisi yang ditemukan.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-zinc-700">
                                    <thead className="bg-gray-50 text-xs tracking-wider text-gray-700 uppercase dark:bg-zinc-700 dark:text-zinc-300">
                                        <tr>
                                            <th className="px-6 py-3 font-semibold">Judul Artikel</th>
                                            <th className="px-6 py-3 font-semibold">Jurnal Target</th>
                                            <th className="px-6 py-3 font-semibold">Tanggal Kirim</th>
                                            <th className="px-6 py-3 text-center font-semibold">Status</th>
                                            <th className="px-6 py-3 text-right font-semibold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                                        {filteredSubmissions.map((submission) => {
                                            const { label, className } = getStatusBadge(submission.status);
                                            return (
                                                <tr key={submission.id} className="transition hover:bg-gray-50 dark:hover:bg-zinc-700/50">
                                                    <td className="max-w-md px-6 py-4">
                                                        <div className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                                                            {submission.title}
                                                        </div>
                                                        <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400">
                                                            {submission.keywords}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-zinc-300">
                                                        {submission.journal?.title || 'Jurnal Tidak Diketahui'}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 dark:text-zinc-400">
                                                        {new Date(submission.created_at).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span
                                                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
                                                        >
                                                            {label}
                                                        </span>
                                                    </td>
                                                    <td className="space-x-2 px-6 py-4 text-right whitespace-nowrap">
                                                        <Link
                                                            href={`/submissions/${submission.id}`}
                                                            className="inline-flex items-center rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                                                        >
                                                            Detail
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(submission.id)}
                                                            className="inline-flex items-center rounded bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
