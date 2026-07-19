/**
 * TopResearchList Component
 *
 * @description
 * Leaderboard 5 Riset Teraktif berdasarkan citations.
 *
 * @author JurnalMU Team
 * @filepath /resources/js/components/TopResearchList.tsx
 */

import React from 'react';
import { BookOpen } from 'lucide-react';

interface Research {
    id: number;
    title: string;
    citations: number;
}

interface TopResearchListProps {
    data: Research[];
}

export default function TopResearchList({ data }: TopResearchListProps) {
    return (
        <div className="rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Top Riset Teraktif
            </h3>
            <div className="flow-root">
                <ul className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {data.slice(0, 5).map((research, idx) => {
                        const rankColors = [
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400', // Gold
                            'bg-slate-100 text-slate-800 dark:bg-slate-500/20 dark:text-slate-400', // Silver
                            'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400', // Bronze
                        ];
                        const defaultColor = 'bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-400';
                        const badgeColor = idx < 3 ? rankColors[idx] : defaultColor;

                        return (
                            <li key={idx} className="py-3 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${badgeColor}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-955 dark:text-white line-clamp-2">
                                        {research.title}
                                    </span>
                                </div>
                                <span className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-900 px-2 py-1 rounded whitespace-nowrap">
                                    Sitasi: {research.citations}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
