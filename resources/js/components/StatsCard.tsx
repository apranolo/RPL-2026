import { cn } from '@/lib/utils';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type StatsCardVariant = 'default' | 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' | 'orange';

export interface StatsCardTrend {
    /** Positive means upward trend, negative means downward */
    value: number;
    /** Label appended after the trend value, e.g. "dari bulan lalu" */
    label?: string;
    /** Override automatic direction detection */
    direction?: 'up' | 'down';
    /** Whether a positive value is good (default true) */
    positiveIsGood?: boolean;
}

export interface StatsCardProps {
    /** Card title / label */
    title: string;
    /** Primary numeric or text value to display */
    value: string | number;
    /** Optional description below the value */
    description?: string;
    /** Lucide icon component */
    icon?: LucideIcon;
    /** Color variant */
    variant?: StatsCardVariant;
    /** Optional trend indicator */
    trend?: StatsCardTrend;
    /** Progress bar percentage (0–100) */
    progress?: number;
    /** Progress bar label */
    progressLabel?: string;
    /** Extra className for the card wrapper */
    className?: string;
    /** HTML id attribute for the card wrapper */
    id?: string;
    /** Skeleton loading state */
    loading?: boolean;
    /** Optional badge text rendered inside the icon area */
    badge?: string;
    /** Additional content rendered at the bottom of the card */
    footer?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Variant config
// ─────────────────────────────────────────────────────────────────────────────

const variantConfig: Record<StatsCardVariant, { iconBg: string; iconColor: string; progressColor: string; badgeBg: string }> = {
    default: {
        iconBg: 'bg-slate-100 dark:bg-slate-800/60',
        iconColor: 'text-slate-600 dark:text-slate-300',
        progressColor: 'bg-slate-500',
        badgeBg: 'bg-slate-500',
    },
    blue: {
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-600 dark:text-blue-400',
        progressColor: 'bg-blue-500',
        badgeBg: 'bg-blue-500',
    },
    green: {
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        progressColor: 'bg-emerald-500',
        badgeBg: 'bg-emerald-500',
    },
    amber: {
        iconBg: 'bg-amber-100 dark:bg-amber-900/30',
        iconColor: 'text-amber-600 dark:text-amber-400',
        progressColor: 'bg-amber-500',
        badgeBg: 'bg-amber-500',
    },
    red: {
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-600 dark:text-red-400',
        progressColor: 'bg-red-500',
        badgeBg: 'bg-red-500',
    },
    purple: {
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        progressColor: 'bg-purple-500',
        badgeBg: 'bg-purple-500',
    },
    cyan: {
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
        iconColor: 'text-cyan-600 dark:text-cyan-400',
        progressColor: 'bg-cyan-500',
        badgeBg: 'bg-cyan-500',
    },
    orange: {
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        progressColor: 'bg-orange-500',
        badgeBg: 'bg-orange-500',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    variant = 'default',
    trend,
    progress,
    progressLabel,
    className,
    id,
    loading = false,
    badge,
    footer,
}: StatsCardProps) {
    const colors = variantConfig[variant];

    // Compute trend direction
    const trendDirection = trend ? (trend.direction ?? (trend.value >= 0 ? 'up' : 'down')) : null;

    const positiveIsGood = trend?.positiveIsGood ?? true;
    const trendIsGood = trendDirection === 'up' ? positiveIsGood : !positiveIsGood;

    if (loading) {
        return (
            <div
                id={id}
                className={cn(
                    'relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950',
                    className,
                )}
            >
                <div className="flex animate-pulse items-start justify-between">
                    <div className="space-y-3">
                        <div className="h-3.5 w-28 rounded-full bg-muted" />
                        <div className="h-8 w-16 rounded-md bg-muted" />
                        <div className="h-3 w-36 rounded-full bg-muted" />
                    </div>
                    <div className="h-12 w-12 rounded-full bg-muted" />
                </div>
            </div>
        );
    }

    return (
        <div
            id={id}
            className={cn(
                'group relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6',
                'transition-all duration-200 hover:shadow-md dark:border-sidebar-border dark:bg-neutral-950',
                className,
            )}
        >
            {/* Subtle gradient accent */}
            <div
                className={cn(
                    'pointer-events-none absolute inset-x-0 top-0 h-0.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                    colors.progressColor,
                )}
            />

            {/* Header: label + icon */}
            <div className="flex items-start justify-between">
                <p className="text-sm leading-none font-medium text-muted-foreground">{title}</p>

                {Icon && (
                    <div className="relative">
                        <div
                            className={cn(
                                'flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110',
                                colors.iconBg,
                            )}
                        >
                            <Icon className={cn('h-5 w-5', colors.iconColor)} aria-hidden="true" />
                        </div>
                        {badge && (
                            <span
                                className={cn(
                                    'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white',
                                    colors.badgeBg,
                                )}
                            >
                                {badge}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Value */}
            <div className="mt-3">
                <p className="text-3xl font-bold tracking-tight">{value}</p>
            </div>

            {/* Description */}
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}

            {/* Trend */}
            {trend && trendDirection && (
                <div className="mt-2 flex items-center gap-1">
                    {trendDirection === 'up' ? (
                        <TrendingUp className={cn('h-3.5 w-3.5', trendIsGood ? 'text-emerald-500' : 'text-red-500')} />
                    ) : (
                        <TrendingDown className={cn('h-3.5 w-3.5', trendIsGood ? 'text-emerald-500' : 'text-red-500')} />
                    )}
                    <span
                        className={cn(
                            'text-xs font-semibold',
                            trendIsGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
                        )}
                    >
                        {trend.value > 0 ? '+' : ''}
                        {trend.value}%
                    </span>
                    {trend.label && <span className="text-xs text-muted-foreground">{trend.label}</span>}
                </div>
            )}

            {/* Progress bar */}
            {progress !== undefined && (
                <div className="mt-4 space-y-1">
                    {progressLabel && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{progressLabel}</span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                    )}
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={cn('h-full rounded-full transition-all duration-700 ease-out', colors.progressColor)}
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        />
                    </div>
                </div>
            )}

            {/* Footer slot */}
            {footer && <div className="mt-4 border-t border-sidebar-border/50 pt-3 dark:border-sidebar-border">{footer}</div>}
        </div>
    );
}

export default StatsCard;
