import { useEffect, useState } from 'react';
import { Trophy, Star } from 'lucide-react';

interface Lecturer {
    name: string;
    score: number;
}

interface Props {
    data?: Lecturer[];
}

const MEDAL_STYLES: Record<number, string> = {
    0: 'bg-gradient-to-br from-yellow-300 to-amber-500 text-white shadow-amber-200',
    1: 'bg-gradient-to-br from-slate-300 to-slate-500 text-white shadow-slate-200',
    2: 'bg-gradient-to-br from-orange-300 to-orange-600 text-white shadow-orange-200',
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
        <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 text-amber-600">
                    <Trophy size={18} strokeWidth={2.2} />
                </span>
                <div>
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest">Leaderboard</p>
                    <h3 className="text-sm font-bold text-slate-800">Top 5 Dosen Produktif</h3>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 divide-y divide-slate-100">

                {/* Skeleton Loading */}
                {loading && [1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 px-5 py-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-slate-200 rounded w-3/4" />
                            <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                        </div>
                    </div>
                ))}

                {/* Error State */}
                {error && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                        <Trophy size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Gagal memuat data.</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && lecturers.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
                        <Trophy size={32} className="mb-2 opacity-40" />
                        <p className="text-sm">Belum ada data dosen produktif.</p>
                    </div>
                )}

                {/* Data List */}
                {!loading && !error && lecturers.map((lecturer, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 px-5 py-4 hover:bg-amber-50/40 transition-colors duration-150"
                    >
                        {/* Rank Badge */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${MEDAL_STYLES[index] ?? 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                            {index + 1}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{lecturer.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <Star size={11} className="text-amber-400" />
                                {lecturer.score} Proposal Diajukan
                            </p>
                        </div>

                        {/* Score Badge */}
                        <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                            Skor {lecturer.score}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
