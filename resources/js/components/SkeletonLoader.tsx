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

export function SkeletonLoader({
  rows = 3,
  className = '',
}: SkeletonLoaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
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
export function SkeletonTable({
  columns = 4,
  rows = 5,
  className = '',
}: SkeletonTableProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-full" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx} className="border-b">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={`${rowIdx}-${colIdx}`} className="p-3">
                  <div className="h-4 bg-gray-100 rounded w-full" />
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
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse p-4 border rounded-lg">
          <div className="h-40 bg-gray-200 rounded mb-3" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
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
  return <div className={`h-4 bg-gray-200 rounded animate-pulse ${width}`} />;
}

/**
 * Avatar Skeleton Loader
 * Circular skeleton for avatar images
 * @example <SkeletonAvatar size="md" />
 */
export function SkeletonAvatar({
  size = 'md',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse`} />
  );
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
        <div key={i} className="flex items-center gap-4 animate-pulse p-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
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
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-100 rounded w-full" />
        </div>
      ))}
      <div className="h-10 bg-gray-200 rounded w-1/4" />
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
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-8 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4 border rounded-lg">
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/4" />
        <div className="h-64 bg-gray-100 rounded" />
      </div>

      {/* Table */}
      <div className="p-4 border rounded-lg">
        <div className="h-4 bg-gray-200 rounded mb-4 w-1/4" />
        <SkeletonTable columns={5} rows={4} />
      </div>
    </div>
  );
}
