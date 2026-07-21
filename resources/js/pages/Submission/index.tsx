import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

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
        className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
      };
    case 'submitted':
      return {
        label: 'Submitted',
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
      };
    case 'in_review':
    case 'under_review':
      return {
        label: 'In Review',
        className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
      };
    case 'revision_required':
      return {
        label: 'Revision Required',
        className: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
      };
    case 'copyediting':
      return {
        label: 'Copyediting',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800'
      };
    case 'production':
      return {
        label: 'Production',
        className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
      };
    case 'published':
    case 'accepted':
      return {
        label: 'Published',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
      };
    case 'declined':
    case 'rejected':
      return {
        label: 'Declined',
        className: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800'
      };
    default:
      return {
        label: status.replace('_', ' ').toUpperCase(),
        className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
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

  const filteredSubmissions = submissions.filter((submission) =>
    submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    submission.journal?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-12 bg-gray-50 dark:bg-zinc-900 min-h-screen">
      <Head title="Daftar Submisi Saya" />

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-zinc-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-zinc-700">
          <div className="p-6 text-gray-900 dark:text-zinc-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Daftar Submisi Saya</h1>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                  Kelola dan pantau status naskah artikel ilmiah yang Anda kirimkan.
                </p>
              </div>
              <Link
                href="/submissions/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow transition duration-150 ease-in-out"
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
                className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submissions Table */}
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg">
                <p className="text-gray-500 dark:text-zinc-400">Tidak ada data submisi yang ditemukan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-zinc-700 text-xs uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Judul Artikel</th>
                      <th className="px-6 py-3 font-semibold">Jurnal Target</th>
                      <th className="px-6 py-3 font-semibold">Tanggal Kirim</th>
                      <th className="px-6 py-3 font-semibold text-center">Status</th>
                      <th className="px-6 py-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                    {filteredSubmissions.map((submission) => {
                      const { label, className } = getStatusBadge(submission.status);
                      return (
                        <tr key={submission.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition">
                          <td className="px-6 py-4 max-w-md">
                            <div className="font-semibold text-gray-900 dark:text-zinc-100 truncate">
                              {submission.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-zinc-400 truncate mt-0.5">
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
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${className}`}>
                              {label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <Link
                              href={`/submissions/${submission.id}`}
                              className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-gray-700 dark:text-zinc-200 text-xs font-medium rounded transition"
                            >
                              Detail
                            </Link>
                            <button
                              onClick={() => handleDelete(submission.id)}
                              className="inline-flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-medium rounded transition"
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