/**
 * ProductionIssueCard Component
 *
 * @description
 * A card component that displays production issue (jurnal) information.
 * Renders the issue's cover image (or a default journal placeholder when absent),
 * volume/number/year, optional title, publication status badge, article count,
 * publish date, and action buttons (Lihat, Edit, Hapus).
 *
 * @component
 *
 * @interface Issue
 * @property {number} id - Unique issue identifier
 * @property {number} volume - Volume number
 * @property {number} number - Issue number within the volume
 * @property {number} year - Publication year
 * @property {string|null} title - Optional thematic title
 * @property {string|null} description - Optional description
 * @property {'Draft'|'Published'} status - Publication status
 * @property {string|null} published_at - ISO date string of publication
 * @property {string|null} cover_image_url - Public URL of cover image
 * @property {number} [galleys_count] - Number of galley articles in this issue
 *
 * @interface Props
 * @property {Issue} issue - The issue data to display
 *
 * @param {Props} props - Component props
 * @param {Issue} props.issue - Issue whose card is rendered
 *
 * @returns The rendered issue card
 *
 * @author JurnalMU Team
 * @filepath /resources/js/components/IssueCard.tsx
 */
import { Link, router } from '@inertiajs/react';

interface Issue {
    id: number;
    volume: number;
    number: number;
    year: number;
    title: string | null;
    description: string | null;
    status: 'Draft' | 'Published';
    published_at: string | null;
    cover_image_url: string | null;
    galleys_count?: number;
}

interface Props {
    issue: Issue;
    readOnly?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

/** Fallback SVG placeholder for issues without a cover image. */
const PLACEHOLDER_COVER = (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
        </svg>
    </div>
);

export default function ProductionIssueCard({ issue }: Props) {
    const handleDelete = () => {
        if (confirm('Yakin ingin menghapus Issue ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('production.issue.destroy', issue.id));
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow hover:shadow-md">
            {/* Cover Image */}
            <div className="h-40 w-full overflow-hidden">
                {issue.cover_image_url ? (
                    <img
                        src={issue.cover_image_url}
                        alt={`Cover Vol. ${issue.volume}, No. ${issue.number} (${issue.year})`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    PLACEHOLDER_COVER
                )}
            </div>

            <div className="p-5">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Vol. {issue.volume}, No. {issue.number} ({issue.year})
                        </h3>
                        {issue.title && <p className="mt-0.5 text-sm text-gray-500 italic">{issue.title}</p>}
                    </div>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            issue.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}
                    >
                        {issue.status === 'Published' ? '✓ Terbit' : '✎ Draft'}
                    </span>
                </div>

                {issue.description && <p className="mb-3 line-clamp-2 text-sm text-gray-600">{issue.description}</p>}

                <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                    <span>📄 {issue.galleys_count ?? 0} artikel</span>
                    {issue.published_at && (
                        <span>
                            📅{' '}
                            {new Date(issue.published_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href={route('production.issue.show', issue.id)}
                        className="rounded bg-primary px-4 py-1.5 text-sm text-white hover:bg-primary/90"
                    >
                        Lihat
                    </Link>

                    {issue.status === 'Draft' && (
                        <>
                            <Link
                                href={route('production.issue.edit', issue.id)}
                                className="rounded bg-gray-100 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-200"
                            >
                                Edit
                            </Link>

                            {(issue.galleys_count ?? 0) === 0 && (
                                <button onClick={handleDelete} className="rounded bg-red-100 px-4 py-1.5 text-sm text-red-600 hover:bg-red-200">
                                    Hapus
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
