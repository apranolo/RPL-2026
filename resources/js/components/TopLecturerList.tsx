/**
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
