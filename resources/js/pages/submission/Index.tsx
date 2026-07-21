import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button'; 
import SubmissionStatusBadge from '@/components/SubmissionStatusBadge';


interface Submission {
    id: number;
    title: string;
    status: string;
    created_at: string;
}

interface Links {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    submissions: {
        data: Submission[];
        links: Links[];
    };
}

export default function Index({ submissions }: Props) {
    return (
        <AppLayout>
            <Head title="Daftar Pengajuan Naskah" />
            
            <div className="py-12 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-aurora-dark">
                            Daftar Pengajuan Naskah
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola dan pantau seluruh riwayat pengajuan naskah ilmiah Anda.
                        </p>
                    </div>
                    <Link href={route('submissions.create')}>
                        <Button variant="default">
                            Tambah Naskah Baru
                        </Button>
                    </Link>
                </div>
                
                {/* Table Section */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-100 p-6">
                    {submissions.data.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 font-medium">Belum ada riwayat pengajuan naskah.</p>
                            <p className="text-xs text-gray-400 mt-1">Naskah yang Anda buat akan muncul di sini.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul Naskah</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Dibuat</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {submissions.data.map((submission) => (
                                        <tr key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-md truncate">
                                                {submission.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <SubmissionStatusBadge status={submission.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(submission.created_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link 
                                                    href={route('submissions.show', submission.id)}
                                                    className="text-aurora-dark hover:underline mr-4"
                                                >
                                                    Detail
                                                </Link>
                                                <Link 
                                                    href={route('submissions.edit', submission.id)}
                                                    className="text-gray-600 hover:text-gray-900 hover:underline"
                                                >
                                                    Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination Links */}
                    {submissions.links && submissions.links.length > 3 && (
                        <div className="flex justify-center mt-6 gap-1">
                            {submissions.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 text-sm rounded transition-colors ${
                                        link.active 
                                            ? 'bg-aurora-dark text-white font-medium' 
                                            : link.url 
                                                ? 'text-gray-700 hover:bg-gray-100' 
                                                : 'text-gray-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}