/**
 * StatusBadge Component
 *
 * @description Reusable badge for displaying contract/document status
 * @statuses draft | aktif | selesai | batal
 * @usage <StatusBadge status="aktif" /> or <StatusBadge status="selesai" label="Sudah Selesai" />
 */
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleDashed, CircleX, Zap } from 'lucide-react';

export type ContractStatus = 'draft' | 'aktif' | 'selesai' | 'batal';

interface StatusBadgeProps {
    /** The status value from backend */
    status: ContractStatus | string;
    /** Optional override label. Falls back to built-in label. */
    label?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Whether to show the leading icon */
    showIcon?: boolean;
    /** Additional class names */
    className?: string;
}

interface StatusConfig {
    label: string;
    icon: React.ElementType;
    classes: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    draft: {
        label: 'Draft',
        icon: CircleDashed,
        classes: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-700',
    },
    aktif: {
        label: 'Aktif',
        icon: Zap,
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    },
    selesai: {
        label: 'Selesai',
        icon: CheckCircle2,
        classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    batal: {
        label: 'Dibatalkan',
        icon: CircleX,
        classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
};

const SIZE_CLASSES = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-base gap-2',
};

const ICON_SIZE_CLASSES = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
};

/**
 * StatusBadge — renders a pill badge for a contract/document status.
 *
 * @example
 * // Minimal
 * <StatusBadge status="aktif" />
 *
 * // Custom label
 * <StatusBadge status="selesai" label="Sudah Selesai" size="lg" />
 *
 * // No icon
 * <StatusBadge status="draft" showIcon={false} />
 */
export default function StatusBadge({ status, label, size = 'md', showIcon = true, className }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] ?? {
        label: label ?? status,
        icon: CircleDashed,
        classes: 'bg-gray-100 text-gray-600 border-gray-200',
    };

    const Icon = config.icon;
    const displayLabel = label ?? config.label;

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border font-medium transition-colors',
                SIZE_CLASSES[size],
                config.classes,
                className,
            )}
            aria-label={`Status: ${displayLabel}`}
        >
            {showIcon && <Icon className={cn('flex-shrink-0', ICON_SIZE_CLASSES[size])} aria-hidden="true" />}
            {displayLabel}
        </span>
    );
}
