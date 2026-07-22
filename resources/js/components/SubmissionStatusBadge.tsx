import React from 'react';

feature/submission-module
// Menentukan tipe data properti yang diterima oleh komponen
interface SubmissionStatusBadgeProps {
    status: string;
}

export default function SubmissionStatusBadge({ status }: SubmissionStatusBadgeProps) {
    // Fungsi untuk memetakan status ke gaya warna Tailwind dan label teks yang rapi
    const getStatusConfig = (statusValue: string) => {
        const normalizedStatus = statusValue.toLowerCase();

        switch (normalizedStatus) {
            case 'draft':
                return {
                    text: 'Draft',
                    className: 'bg-gray-100 text-gray-700 border-gray-200',
                };
            case 'pending':
            case 'review':
                return {
                    text: 'Dalam Tinjauan',
                    className: 'bg-amber-50 text-amber-700 border-amber-200',
                };
            case 'approved':
            case 'completed':
            case 'accepted':
                return {
                    text: 'Disetujui',
                    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };
            case 'rejected':
            case 'declined':
                return {
                    text: 'Ditolak',
                    className: 'bg-rose-50 text-rose-700 border-rose-200',
                };
            default:
                return {
                    text: statusValue,
                    className: 'bg-gray-50 text-gray-600 border-gray-200',
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className} transition-colors duration-150`}
        >
            {config.text}
        </span>
    );
}

// 1. Definisikan tipe status yang valid (cocok dengan Enum di Database)
export type SubmissionStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface SubmissionStatusBadgeProps {
    status: SubmissionStatus;
    className?: string;
}

// 2. Pemetaan gaya (styling) berdasarkan status menggunakan Tailwind CSS
const statusConfig: Record<SubmissionStatus, { label: string; classes: string }> = {
    draft: {
        label: 'Draft',
        classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    pending: {
        label: 'Pending',
        classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50',
    },
    approved: {
        label: 'Approved',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50',
    },
    rejected: {
        label: 'Rejected',
        classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50',
    },
};

export const SubmissionStatusBadge: React.FC<SubmissionStatusBadgeProps> = ({ 
    status, 
    className = '' 
}) => {
    // Mengambil konfigurasi visual berdasarkan status, fallback ke 'draft' jika tidak ada yang cocok
    const config = statusConfig[status] || statusConfig.draft;

    return (
        <span
            className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold shadow-sm transition-colors ${config.classes} ${className}`}
        >
            {/* Dot/lingkaran indikator kecil */}
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {config.label}
        </span>
    );
};

export default SubmissionStatusBadge;
development
