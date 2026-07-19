/**
 * @route /reviewer/evaluations
 * @description Halaman daftar laporan kemajuan dosen yang perlu dievaluasi oleh Reviewer
 * @features Live search judul/nama dosen, progress bar per laporan, navigasi ke detail evaluasi
 */

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Daftar Evaluasi', href: '/reviewer/evaluations' },
];

interface PendingEvaluation {
    id_report: number;
    id_contract: number;
    judul_penelitian: string;
    nama_dosen: string;
    last_reported_at: string;
    last_percentage: number;
}

interface Props {
    pendingEvaluations: PendingEvaluation[];
}

function ProgressBar({ percentage }: { percentage: number }) {
    return (
        <div className="h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
        </div>
    );
}

export default function EvaluationIndex({ pendingEvaluations }: Props) {
    const [search, setSearch] = useState('');

    const filtered = pendingEvaluations.filter(
        (item) => item.judul_penelitian.toLowerCase().includes(search.toLowerCase()) || item.nama_dosen.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Daftar Evaluasi Laporan" />
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 md:p-8">
                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Daftar Evaluasi Laporan</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Laporan kemajuan dosen yang perlu dievaluasi.</p>
                    </div>
                </div>

                {/* Search */}
                <div>
                    <input
                        type="text"
                        placeholder="Cari judul penelitian atau nama dosen..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>

                {/* Tabel */}
                {filtered.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Tidak ada laporan yang perlu dievaluasi.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Judul Penelitian</th>
                                    <th className="px-4 py-3 font-semibold">Dosen Pengusul</th>
                                    <th className="px-4 py-3 font-semibold">Progres Terakhir (%)</th>
                                    <th className="px-4 py-3 font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filtered.map((item) => (
                                    <tr key={item.id_report} className="bg-white hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-foreground">{item.judul_penelitian}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.nama_dosen}</td>
                                        <td className="w-48 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <ProgressBar percentage={item.last_percentage} />
                                                <span className="w-8 text-xs font-semibold text-foreground">{item.last_percentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => router.get(route('reviewer.evaluations.show', item.id_report))}
                                                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                                            >
                                                Lihat Detail
                                            </button>
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
