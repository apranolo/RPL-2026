import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ContractStatus = 'draft' | 'aktif' | 'selesai' | 'batal';

export type GenericStatus =
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'draft'
    | 'submitted'
    | 'reviewed'
    | 'in_review'
    | 'approved_by_lppm'
    | 'aktif'
    | 'selesai'
    | 'batal'
    | 'active'
    | 'closed'
    | 'assigned'
    | 'in_progress'
    | 'completed'
    | 'success'
    | 'partial'
    | 'failed';

interface StatusConfig {
    label: string;
    /** Tailwind utility classes applied to the Badge */
    className: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Status configuration map
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<GenericStatus, StatusConfig> = {
    // Approval statuses
    pending: {
        label: 'Menunggu',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    },
    approved: {
        label: 'Disetujui',
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    rejected: {
        label: 'Ditolak',
        className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },

    // Assessment statuses
    draft: {
        label: 'Draft',
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },
    submitted: {
        label: 'Dikirim',
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    reviewed: {
        label: 'Direview',
        className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    },
    in_review: {
        label: 'Sedang Direview',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    },
    approved_by_lppm: {
        label: 'Disetujui LPPM',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    },

    // Contract statuses
    aktif: {
        label: 'Aktif',
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    selesai: {
        label: 'Selesai',
        className: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800',
    },
    batal: {
        label: 'Dibatalkan',
        className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },

    // Pembinaan program statuses
    active: {
        label: 'Aktif',
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    closed: {
        label: 'Ditutup',
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
    },

    // Reviewer assignment statuses
    assigned: {
        label: 'Ditugaskan',
        className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    in_progress: {
        label: 'Dalam Proses',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    },
    completed: {
        label: 'Selesai',
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },

    // Harvest / OAI statuses
    success: {
        label: 'Berhasil',
        className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    partial: {
        label: 'Sebagian',
        className: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    },
    failed: {
        label: 'Gagal',
        className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
    /** The status key to look up */
    status: GenericStatus | string;
    /** Override the label (falls back to config label or capitalized status key) */
    label?: string;
    /** Additional Tailwind classes */
    className?: string;
    /** Badge size – matches shadcn Badge variants */
    size?: 'sm' | 'default';
}

/**
 * A reusable status badge component.
 *
 * Renders a colored `<Badge>` based on a status key.
 * Supports all common status values used across the application
 * (contract, assessment, registration, harvest, etc.).
 *
 * @example
 * ```tsx
 * <StatusBadge status="aktif" />
 * <StatusBadge status="draft" label="Draft Kontrak" />
 * <StatusBadge status={contract.status} />
 * ```
 */
export function StatusBadge({ status, label, className, size = 'default' }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status as GenericStatus];

    const resolvedLabel = label ?? config?.label ?? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const resolvedClass = config?.className ?? 'bg-gray-100 text-gray-700 border-gray-200';

    return (
        <Badge
            variant="outline"
            className={cn(
                'border font-medium',
                size === 'sm' && 'px-2 py-0.5 text-xs',
                resolvedClass,
                className,
            )}
        >
            {resolvedLabel}
        </Badge>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Specialised convenience wrappers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Badge specifically for contract statuses (Draft / Aktif / Selesai / Dibatalkan).
 */
export function ContractStatusBadge({
    status,
    className,
}: {
    status: ContractStatus | string;
    className?: string;
}) {
    return <StatusBadge status={status} className={className} />;
}
