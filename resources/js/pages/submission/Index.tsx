import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// SOLUSI: Definisikan tipe fungsi route secara lokal tanpa menggunakan kata 'declare global'
// Ini akan memaksa TypeScript menerima fungsi route() bawaan Laravel Ziggy di dalam file ini
type RouteFunction = (name: string, params?: any) => string;
const route = (window as any).route as RouteFunction;

// ... sisa kode di bawahnya (Interface Submission, Props, dan fungsi Index) tetap sama seperti sebelumnya ...
// Definisi Tipe Data (TypeScript Interface)
interface Submission {
    id: number;
    title: string;
    description: string;
    file_path: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

// Definisi Properti Komponen (Props Interface)
interface Props {
    submissions: Submission[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function Index({ submissions = [], flash }: Props) { // Memberikan default array [] untuk mencegah error jika data kosong
    // State untuk pencarian
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Fungsi Aksi Hapus dengan Type Safety
    const handleDelete = (id: number): void => {
        if (confirm('Apakah Anda yakin ingin menghapus data pengajuan ini?')) {
            router.delete(route('submissions.destroy', id));
        }
    };

    // Filter Pencarian (Client-side) dengan pengecekan safety (?) jika submissions bernilai null
    const filteredSubmissions = (submissions || []).filter((submission) =>
        submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper Penentuan Warna Badge Status
    const getStatusBadge = (status: Submission['status']): string => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800 border border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border border-red-200';
            default:
                return 'bg-amber-100 text-amber-800 border border-amber-200';
        }
    };

    return (
        <div className="py-12 bg-gray-50 min-h-screen">
            <Head title="Daftar Pengajuan" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Flash Message / Notifikasi */}
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded shadow-sm">
                        <div className="flex items-center">
                            <span className="font-medium">Sukses!</span> {flash.success}
                        </div>
                    </div>
                )}

                {/* Kotak Konten Utama */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    {/* Bagian Atas / Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengajuan</h1>
                            <p className="text-sm text-gray-500 mt-1">Daftar dokumen yang diajukan ke sistem.</p>
                        </div>
                        <Link
                            href={route('submissions.create')}
                            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs uppercase tracking-widest rounded-md shadow-sm transition"
                        >
                            + Buat Pengajuan
                        </Link>
                    </div>

                    {/* Input Pencarian */}
                    <div className="mb-6 max-w-md">
                        <input
                            type="text"
                            placeholder="Cari judul atau deskripsi..."
                            value={searchTerm}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                        />
                    </div>

                    {/* Tabel Data */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-3 text-left">Judul Pengajuan</th>
                                    <th className="px-6 py-3 text-left">Deskripsi</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-gray-600">
                                {filteredSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                                            Tidak ada data pengajuan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubmissions.map((submission) => (
                                        <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                {submission.title}
                                            </td>
                                            <td className="px-6 py-4 max-w-md truncate">
                                                {submission.description}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full capitalize ${getStatusBadge(submission.status)}`}>
                                                    {submission.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center font-medium space-x-3">
                                                <Link
                                                    href={route('submissions.show', submission.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Detail
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(submission.id)}
                                                    className="text-red-600 hover:text-red-900 transition bg-none border-none cursor-pointer"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}