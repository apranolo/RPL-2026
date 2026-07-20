import React from 'react';

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