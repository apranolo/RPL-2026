import React from 'react';

export type SubmissionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'review' | 'completed' | 'accepted' | 'declined';

interface SubmissionStatusBadgeProps {
    status: SubmissionStatus | string;
    className?: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
    draft: {
        label: 'Draft',
        classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    pending: {
        label: 'Pending',
        classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
    },
    review: {
        label: 'Dalam Tinjauan',
        classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
    },
    approved: {
        label: 'Approved',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
    },
    completed: {
        label: 'Selesai',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
    },
    accepted: {
        label: 'Diterima',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
    },
    rejected: {
        label: 'Rejected',
        classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
    },
    declined: {
        label: 'Ditolak',
        classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
    },
};

export default function SubmissionStatusBadge({ 
    status, 
    className = '' 
}: SubmissionStatusBadgeProps) {
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : 'draft';
    const config = statusConfig[normalizedStatus] || {
        label: status,
        classes: 'bg-gray-50 text-gray-600 border-gray-200'
    };

    return (
        <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-colors ${config.classes} ${className}`}
        >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {config.label}
        </span>
    );
}
