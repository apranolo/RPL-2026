/**
 - @file TopLecturerList.tsx
 - @description Menampilkan leaderboard 5 dosen paling produktif berdasarkan
 - jumlah proposal yang diajukan. Mengambil data dari `GET /api/top-lecturers`
 - jika prop `data` tidak diberikan, atau menampilkan `data` yang dikirim
 - langsung oleh parent component.
 - Palet warna latar (surface) diambil dari CSS custom properties yang
 - didefinisikan di `resources/css/leaderboard-theme.css`, bukan hex hardcoded,
 - agar konsisten dengan TopResearchList.tsx dan mudah diubah di satu tempat.
 */

import { useEffect, useState } from 'react';
import { Trophy, Star } from 'lucide-react';
 * TopLecturerList Component
 *
 * @description
 * Leaderboard 5 Dosen Terproduktif berdasarkan skor proposal/riset.
 *
 * @author JurnalMU Team
 * @filepath /resources/js/components/TopLecturerList.tsx
 */

import React from 'react';
import { Award } from 'lucide-react';

interface Lecturer {
    name: string;
    score: number;
}

interface Props {
    data?: Lecturer[];
}

const MEDAL_STYLES: Record<number, string> = {
    0: 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-[var(--color-surface-base)] shadow-yellow-400/30',
    1: 'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-400/20',
    2: 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-orange-400/20',
};

export default function TopLecturerList({ data }: Props) {
    const [lecturers, setLecturers] = useState<Lecturer[]>(data ?? []);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (data !== undefined) return;

        setLoading(true);
        fetch('/api/top-lecturers')
            .then(res => {
                if (!res.ok) throw new Error('Network error');
                return res.json();
            })
            .then((fetched: Lecturer[]) => {
                setLecturers(fetched);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [data]);

    return (
        <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-[var(--color-surface-base)] shadow-lg overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[var(--color-surface-header-lecturer)] to-[var(--color-surface-base)]">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-yellow-400/20 text-yellow-400">
                    <Trophy size={18} strokeWidth={2.2} />
                </span>
                <div>
                    <p className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">Leaderboard</p>
                    <h3 className="text-sm font-bold text-white">Top 5 Dosen Produktif</h3>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 divide-y divide-white/5">

                {/* Skeleton Loading */}
                {loading && [1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-white/10 rounded w-3/4" />
                            <div className="h-2.5 bg-white/5 rounded w-1/3" />
                        </div>
                    </div>
                ))}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-white/30">
                        <Trophy size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Gagal memuat data.</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && lecturers.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-white/30">
                        <Trophy size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Belum ada data dosen produktif.</p>
                    </div>
                )}

                {/* Data List */}
                {!loading && !error && lecturers.map((lecturer, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 px-5 py-4 hover:bg-green-500/10 transition-colors duration-150"
                    >
                        {/* Rank Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${MEDAL_STYLES[index] ?? 'bg-white/10 text-white/50 border border-white/10'}`}>
                            {index + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{lecturer.name}</p>
                            <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1">
                                <Star size={11} className="text-yellow-400" />
                                {lecturer.score} Proposal Diajukan
                            </p>
                        </div>

                        {/* Score Badge */}
                        <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-400/15 text-yellow-400 border border-yellow-400/20">
                            Skor {lecturer.score}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface TopLecturerListProps {
    data: Lecturer[];
}

export default function TopLecturerList({ data }: TopLecturerListProps) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Dosen Terproduktif
            </h3>
            <div className="flow-root">
                <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {data.slice(0, 5).map((lecturer, idx) => {
                        // Surya Gold, Silver, Bronze badges for top 3
                        const rankColors = [
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', // Gold
                            'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400', // Silver
                            'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400', // Bronze
                        ];
                        const defaultColor = 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-400';
                        const badgeColor = idx < 3 ? rankColors[idx] : defaultColor;

                        return (
                            <li key={idx} className="py-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badgeColor}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-950 dark:text-white">
                                        {lecturer.name}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-900 px-2 py-1 rounded">
                                    Skor: {lecturer.score}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
