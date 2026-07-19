/**
 * @file TopResearchList.tsx
 * @description Menampilkan leaderboard 5 penelitian teraktif berdasarkan
 * jumlah luaran (research outputs). Mengambil data dari
 * `GET /api/top-research` jika prop `data` tidak diberikan, atau menampilkan
 * `data` yang dikirim langsung oleh parent component.
 *
 * Palet warna latar (surface) diambil dari CSS custom properties yang
 * didefinisikan di `resources/css/leaderboard-theme.css`, bukan hex hardcoded,
 * agar konsisten dengan TopLecturerList.tsx dan mudah diubah di satu tempat.
 */

import { BookOpen, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Research {
    id: number;
    judul: string;
    citations: number;
}

interface Props {
    data?: Research[];
}

const MEDAL_STYLES: Record<number, string> = {
    0: 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-[var(--color-surface-base)] shadow-yellow-400/30',
    1: 'bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-slate-400/20',
    2: 'bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-orange-400/20',
};

export default function TopResearchList({ data }: Props) {
    const [researchList, setResearchList] = useState<Research[]>(data ?? []);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (data !== undefined) return;

        setLoading(true);
        fetch('/api/top-research')
            .then((res) => {
                if (!res.ok) throw new Error('Network error');
                return res.json();
            })
            .then((fetched: Research[]) => {
                setResearchList(fetched);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, [data]);

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[var(--color-surface-base)] shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[var(--color-surface-header-research)] to-[var(--color-surface-base)] px-5 py-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/20 text-green-400">
                    <BookOpen size={18} strokeWidth={2.2} />
                </span>
                <div>
                    <p className="text-xs font-semibold tracking-widest text-green-400 uppercase">Leaderboard</p>
                    <h3 className="text-sm font-bold text-white">Top 5 Penelitian Teraktif</h3>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 divide-y divide-white/5">
                {/* Skeleton Loading */}
                {loading &&
                    [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex animate-pulse items-start gap-3 px-5 py-4">
                            <div className="mt-0.5 h-8 w-8 flex-shrink-0 rounded-full bg-white/10" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-3 w-4/5 rounded bg-white/10" />
                                <div className="h-2.5 w-2/5 rounded bg-white/5" />
                            </div>
                        </div>
                    ))}

                {/* Error State */}
                {error && (
                    <div className="flex h-full flex-col items-center justify-center py-10 text-white/30">
                        <BookOpen size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Gagal memuat data.</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && researchList.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center py-10 text-white/30">
                        <BookOpen size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Belum ada penelitian aktif.</p>
                    </div>
                )}

                {/* Data List */}
                {!loading &&
                    !error &&
                    researchList.map((research, index) => (
                        <div key={research.id} className="flex items-start gap-3 px-5 py-4 transition-colors duration-150 hover:bg-green-500/10">
                            {/* Rank Badge */}
                            <div
                                className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${MEDAL_STYLES[index] ?? 'border border-white/10 bg-white/10 text-white/50'}`}
                            >
                                {index + 1}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 text-sm leading-snug font-semibold text-white" title={research.judul}>
                                    {research.judul}
                                </p>
                                <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
                                    <Flame size={11} className="text-green-400" />
                                    {research.citations} Luaran Penelitian
                                </p>
                            </div>

                            {/* Score Badge */}
                            <span className="flex-shrink-0 self-center rounded-full border border-green-500/20 bg-green-500/15 px-2.5 py-1 text-xs font-bold text-green-400">
                                {research.citations}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
}
