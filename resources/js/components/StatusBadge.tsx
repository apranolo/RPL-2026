/**
 * StatusBadge Component
 *
 * @description
 * A reusable, premium status indicator badge designed for contract lifecycles
 * and generic state indicators (e.g. Draft, Aktif, Selesai, Dibatalkan).
 * Features sleek colors, smooth transitions, and distinct iconography.
 *
 * @author GILANG JA'FAR PRASETYA
 */
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    CheckCircle2,
    FileEdit,
    PlayCircle,
    XCircle,
} from 'lucide-react';

// ─── Status Definitions ───────────────────────────────────────────────────────

export type ContractStatusType = 'draft' | 'active' | 'selesai' | 'dibatalkan' | string;

interface StatusConfig {
    label: string;
    variant: 'secondary' | 'default' | 'outline' | 'destructive';
    styles: string;
    icon: React.ElementType;
}

const STATUS_CONFIGS: Record<string, StatusConfig> = {
    draft: {
        label: 'Draft',
        variant: 'secondary',
        styles: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800',
        icon: FileEdit,
    },
    active: {
        label: 'Aktif',
        variant: 'default',
        styles: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
        icon: PlayCircle,
    },
    aktif: { // Fallback for indonesian variant if passed directly
        label: 'Aktif',
        variant: 'default',
        styles: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
        icon: PlayCircle,
    },
    completed: {
        label: 'Selesai',
        variant: 'outline',
        styles: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
        icon: CheckCircle2,
    },
    selesai: {
        label: 'Selesai',
        variant: 'outline',
        styles: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
        icon: CheckCircle2,
    },
    cancelled: {
        label: 'Dibatalkan',
        variant: 'destructive',
        styles: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
        icon: XCircle,
    },
    dibatalkan: {
        label: 'Dibatalkan',
        variant: 'destructive',
        styles: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
        icon: XCircle,
    },
};

// ─── Component Props ──────────────────────────────────────────────────────────

interface StatusBadgeProps {
    status: ContractStatusType;
    className?: string;
    showIcon?: boolean;
    customLabel?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StatusBadge({
    status,
    className,
    showIcon = true,
    customLabel,
}: StatusBadgeProps) {
    const key = status?.toLowerCase() || 'draft';
    const config = STATUS_CONFIGS[key] || {
        label: status || 'Unknown',
        variant: 'outline',
        styles: 'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300',
        icon: FileEdit,
    };

    const Icon = config.icon;
    const finalLabel = customLabel || config.label;

    return (
        <Badge
            variant={config.variant}
            className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold tracking-wide transition-all duration-300 select-none border shadow-sm rounded-full',
                config.styles,
                className
            )}
        >
            {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span>{finalLabel}</span>
        </Badge>
    );
}
