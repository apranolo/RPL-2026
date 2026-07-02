import { useEffect, useState } from 'react';
import { BookOpen, Flame } from 'lucide-react';

interface Research {
    id: number;
    title: string;
    citations: number;
}

interface Props {
    data?: Research[];
}

const MEDAL_STYLES: Record<number, string> = {
    0: 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-amber-200',
    1: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-200',
    2: 'bg-gradient-to-br from-orange-300 to-orange-600 text-white shadow-orange-200',
};

export default function TopResearchList({ data }: Props) {
    const [researchList, setResearchList] = useState<Research[]>(data ?? []);
    const [loading, setLoading] = useState(!data);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (data !== undefined) return;

        setLoading(true);
        fetch('/api/top-research')
            .then(res => {
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
        <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600">
                    <BookOpen size={18} strokeWidth={2.2} />
                </span>
                <div>
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">Leaderboard</p>
                    <h3 className="text-sm font-bold text-slate-800">Top 5 Penelitian Teraktif</h3>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 divide-y divide-slate-100">

                {/* Skeleton Loading */}
                {loading && [1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-start gap-3 px-5 py-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2 pt-1">
                            <div className="h-3 bg-slate-200 rounded w-4/5" />
                            <div className="h-2.5 bg-slate-100 rounded w-2/5" />
                        </div>
                    </div>
                ))}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                        <BookOpen size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Gagal memuat data.</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && researchList.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                        <BookOpen size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Belum ada penelitian aktif.</p>
                    </div>
                )}

                {/* Data List */}
                {!loading && !error && researchList.map((research, index) => (
                    <div
                        key={research.id}
                        className="flex items-start gap-3 px-5 py-4 hover:bg-indigo-50/40 transition-colors duration-150"
                    >
                        {/* Rank Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm mt-0.5 ${MEDAL_STYLES[index] ?? 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            {index + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2" title={research.title}>
                                {research.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                <Flame size={11} className="text-indigo-400" />
                                {research.citations} Luaran Penelitian
                            </p>
                        </div>

                        {/* Score Badge */}
                        <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 self-center">
                            {research.citations}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
