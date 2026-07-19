/**
 * Skeleton Loading Components for Data Fetching
 * Reusable animated skeleton components for loading states
 */

interface SkeletonLoaderProps {
    rows?: number;
    className?: string;
}

interface SkeletonTableProps {
    columns?: number;
    rows?: number;
    className?: string;
}

interface SkeletonCardProps {
    count?: number;
    className?: string;
}

/**
 * Basic Skeleton Loader
 * Generic animated skeleton lines for content loading
 * @example <SkeletonLoader rows={3} />
 */

export function SkeletonLoader({ rows = 3, className = '' }: SkeletonLoaderProps) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
                    <div className="h-3 w-1/2 rounded-lg bg-slate-200" />
                </div>
            ))}
        </div>
    );
}

/**
 * Table Skeleton Loader
 * Animated skeleton for table rows and columns
 * @example <SkeletonTable columns={5} rows={8} />
 */
export function SkeletonTable({ columns = 4, rows = 5, className = '' }: SkeletonTableProps) {
    return (
        <div className={`animate-pulse ${className}`}>
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="p-3 text-left">
                                <div className="h-4 w-full rounded-lg bg-slate-200" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <tr key={rowIdx} className="border-b">
                            {Array.from({ length: columns }).map((_, colIdx) => (
                                <td key={`${rowIdx}-${colIdx}`} className="p-3">
                                    <div className="h-4 w-full rounded-lg bg-slate-200" />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Card Skeleton Loader
 * Animated skeleton for card components
 * @example <SkeletonCard count={3} />
 */
export function SkeletonCard({ count = 3, className = '' }: SkeletonCardProps) {
    return (
        <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg border p-4">
                    <div className="mb-3 h-40 rounded-lg bg-slate-200" />
                    <div className="mb-2 h-4 rounded-lg bg-slate-200" />
                    <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
                </div>
            ))}
        </div>
    );
}

/**
 * Text Skeleton Loader
 * Single animated line for text content
 * @example <SkeletonText width="w-2/3" />
 */
export function SkeletonText({ width = 'w-full' }: { width?: string }) {
    return <div className={`h-4 animate-pulse rounded-lg bg-slate-200 ${width}`} />;
}

/**
 * Avatar Skeleton Loader
 * Circular skeleton for avatar images
 * @example <SkeletonAvatar size="md" />
 */
export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24',
    };

    return <div className={`${sizeClasses[size]} animate-pulse rounded-full bg-slate-200`} />;
}

/**
 * List Skeleton Loader
 * Multiple items with avatar and text
 * @example <SkeletonList rows={5} />
 */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-center gap-4 p-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded-lg bg-slate-200" />
                        <div className="h-3 w-1/2 rounded-lg bg-slate-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Form Skeleton Loader
 * Animated skeleton for form fields
 * @example <SkeletonForm fields={3} />
 */
export function SkeletonForm({ fields = 3 }: { fields?: number }) {
    return (
        <div className="animate-pulse space-y-4">
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="h-4 w-1/4 rounded-lg bg-slate-200" />
                    <div className="h-10 w-full rounded-lg bg-slate-200" />
                </div>
            ))}
            <div className="h-10 w-1/4 rounded-lg bg-slate-200" />
        </div>
    );
}

/**
 * Dashboard Skeleton Loader
 * Animated skeleton for dashboard layout
 * @example <SkeletonDashboard />
 */
export function SkeletonDashboard() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="h-8 w-1/3 rounded-lg bg-slate-200" />
                <div className="h-4 w-1/2 rounded-lg bg-slate-200" />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border p-4">
                        <div className="mb-2 h-4 rounded-lg bg-slate-200" />
                        <div className="h-8 rounded-lg bg-slate-200" />
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="rounded-lg border p-4">
                <div className="mb-4 h-4 w-1/4 rounded-lg bg-slate-200" />
                <div className="h-64 rounded-lg bg-slate-200" />
            </div>

            {/* Table */}
            <div className="rounded-lg border p-4">
                <div className="mb-4 h-4 w-1/4 rounded-lg bg-slate-200" />
                <SkeletonTable columns={5} rows={4} />
            </div>
        </div>
    );
}
