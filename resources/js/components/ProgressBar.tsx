import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

/**
 * Color variant type for the progress bar
 */
type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Size variant for the progress bar
 */
type ProgressSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
    /** Current value (0–100) */
    value: number;
    /** Maximum value (defaults to 100) */
    max?: number;
    /** Optional label shown above the bar */
    label?: string;
    /** Whether to display the percentage text */
    showPercentage?: boolean;
    /** Color variant */
    variant?: ProgressVariant;
    /** Auto-select variant based on value thresholds */
    autoVariant?: boolean;
    /** Size of the progress bar */
    size?: ProgressSize;
    /** Whether to animate the bar on mount */
    animated?: boolean;
    /** Whether to show a striped pattern */
    striped?: boolean;
    /** Extra class names for the container */
    className?: string;
}

/**
 * Variant → Tailwind colour mappings
 */
const variantClasses: Record<ProgressVariant, string> = {
    default: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-sky-500',
};

const variantTextClasses: Record<ProgressVariant, string> = {
    default: 'text-primary',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-sky-600',
};

const sizeClasses: Record<ProgressSize, string> = {
    sm: 'h-2',
    md: 'h-3.5',
    lg: 'h-5',
};

/**
 * Resolves the colour variant automatically based on the percentage value.
 *
 * >= 80 → success (green)
 * >= 60 → info    (blue)
 * >= 40 → warning (amber)
 *  < 40 → danger  (red)
 */
function resolveAutoVariant(pct: number): ProgressVariant {
    if (pct >= 80) return 'success';
    if (pct >= 60) return 'info';
    if (pct >= 40) return 'warning';
    return 'danger';
}

/**
 * ProgressBar Component
 *
 * A reusable, animated progress-bar that displays a percentage value.
 * Supports multiple colour variants, sizes, and an auto-variant mode
 * that selects the colour based on the current value.
 *
 * @example
 * ```tsx
 * <ProgressBar value={75} label="Progres Evaluasi" showPercentage />
 * <ProgressBar value={45} autoVariant animated striped />
 * ```
 */
export default function ProgressBar({
    value,
    max = 100,
    label,
    showPercentage = true,
    variant = 'default',
    autoVariant = false,
    size = 'md',
    animated = true,
    striped = false,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const resolvedVariant = autoVariant ? resolveAutoVariant(percentage) : variant;

    // Animate from 0 to target width on mount
    const [displayWidth, setDisplayWidth] = useState(animated ? 0 : percentage);

    useEffect(() => {
        if (!animated) {
            setDisplayWidth(percentage);
            return;
        }

        // Small delay so the transition is visible
        const timer = setTimeout(() => setDisplayWidth(percentage), 100);
        return () => clearTimeout(timer);
    }, [percentage, animated]);

    return (
        <div className={cn('w-full', className)}>
            {/* Label row */}
            {(label || showPercentage) && (
                <div className="mb-1.5 flex items-center justify-between">
                    {label && (
                        <span className="text-sm font-medium text-foreground">
                            {label}
                        </span>
                    )}
                    {showPercentage && (
                        <span
                            className={cn(
                                'text-sm font-semibold tabular-nums',
                                variantTextClasses[resolvedVariant],
                            )}
                        >
                            {percentage.toFixed(1)}%
                        </span>
                    )}
                </div>
            )}

            {/* Track */}
            <div
                className={cn(
                    'relative w-full overflow-hidden rounded-full bg-secondary',
                    sizeClasses[size],
                )}
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label ?? `Progress: ${percentage.toFixed(1)}%`}
            >
                {/* Indicator */}
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        variantClasses[resolvedVariant],
                        striped && 'progress-striped',
                    )}
                    style={{ width: `${displayWidth}%` }}
                />
            </div>

            {/* Inline striped animation style */}
            {striped && (
                <style>{`
                    .progress-striped {
                        background-image: linear-gradient(
                            45deg,
                            rgba(255,255,255,.15) 25%,
                            transparent 25%,
                            transparent 50%,
                            rgba(255,255,255,.15) 50%,
                            rgba(255,255,255,.15) 75%,
                            transparent 75%,
                            transparent
                        );
                        background-size: 1rem 1rem;
                        animation: progress-stripe-move 1s linear infinite;
                    }
                    @keyframes progress-stripe-move {
                        0% { background-position: 1rem 0; }
                        100% { background-position: 0 0; }
                    }
                `}</style>
            )}
        </div>
    );
}
