/**
 * StatusBadge Component
 *
 * @description
 * A reusable, premium status indicator badge designed for contract lifecycles
 * and generic state indicators (e.g. Draft, Aktif, Selesai, Dibatalkan).
 * Features smooth transitions and distinct iconography.
 *
 * Color policy: ALL colors are derived from the project's global design
 * tokens (CSS custom properties defined in resources/css/app.css) to stay
 * consistent with the "The Progressive Aurora" palette. No hardcoded Tailwind
 * color utilities (bg-emerald-*, bg-blue-*, etc.) are used here.
 *
 * @author GILANG JA'FAR PRASETYA
 */
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, FileEdit, PlayCircle, XCircle } from 'lucide-react';

// ─── Status Definitions ───────────────────────────────────────────────────────

export type ContractStatusType = 'draft' | 'active' | 'selesai' | 'dibatalkan' | string;

interface StatusConfig {
    label: string;
    variant: 'secondary' | 'default' | 'outline' | 'destructive';
    /** Semantic token-based classes only — no hardcoded palette utilities. */
    styles: string;
    icon: React.ElementType;
}

/**
 * STATUS_CONFIGS
 *
 * All `styles` values use CSS-variable-backed Tailwind aliases defined in
 * app.css (@theme block) and shadcn/ui's token conventions:
 *
 *   bg-muted / text-muted-foreground   → neutral grey  (--muted / --muted-foreground)
 *   bg-primary / text-primary          → Muhammadiyah Green (#00853c)
 *   bg-secondary / text-secondary      → Progressive Teal (#04a64b)
 *   bg-destructive / text-destructive  → Error red  (#ef4444)
 *   border-border                      → Global border token (--border)
 */
const STATUS_CONFIGS: Record<string, StatusConfig> = {
    draft: {
        label: 'Draft',
        variant: 'secondary',
        styles: [
            'bg-muted text-muted-foreground border-border',
            'hover:bg-muted/80',
            'dark:bg-muted/40 dark:text-muted-foreground dark:border-border',
        ].join(' '),
        icon: FileEdit,
    },
    active: {
        label: 'Aktif',
        variant: 'default',
        styles: [
            'bg-primary/10 text-primary border-primary/30',
            'hover:bg-primary/20',
            'dark:bg-primary/20 dark:text-primary dark:border-primary/40',
        ].join(' '),
        icon: PlayCircle,
    },
    // Indonesian spelling alias — delegates to the same config as 'active'
    aktif: {
        label: 'Aktif',
        variant: 'default',
        styles: [
            'bg-primary/10 text-primary border-primary/30',
            'hover:bg-primary/20',
            'dark:bg-primary/20 dark:text-primary dark:border-primary/40',
        ].join(' '),
        icon: PlayCircle,
    },
    selesai: {
        label: 'Selesai',
        variant: 'outline',
        styles: [
            'bg-secondary/10 text-secondary border-secondary/30',
            'hover:bg-secondary/20',
            'dark:bg-secondary/20 dark:text-secondary dark:border-secondary/40',
        ].join(' '),
        icon: CheckCircle2,
    },
    dibatalkan: {
        label: 'Dibatalkan',
        variant: 'destructive',
        styles: [
            'bg-destructive/10 text-destructive border-destructive/30',
            'hover:bg-destructive/20',
            'dark:bg-destructive/20 dark:text-destructive dark:border-destructive/40',
        ].join(' '),
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

export default function StatusBadge({ status, className, showIcon = true, customLabel }: StatusBadgeProps) {
    const key = status?.toLowerCase() || 'draft';
    const config = STATUS_CONFIGS[key] || {
        label: status || 'Unknown',
        variant: 'outline' as const,
        styles: 'bg-muted text-muted-foreground border-border',
        icon: FileEdit,
    };

    const Icon = config.icon;
    const finalLabel = customLabel || config.label;

    return (
        <Badge
            variant={config.variant}
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide shadow-sm transition-all duration-300 select-none',
                config.styles,
                className,
            )}
        >
            {showIcon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            <span>{finalLabel}</span>
        </Badge>
    );
}
