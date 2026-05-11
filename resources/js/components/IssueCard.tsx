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
    galleys_count?: number;
}

interface Props {
    issue: Issue;
}

export default function ProductionIssueCard({ issue }: Props) {
    const handleDelete = () => {
        if (confirm('Yakin ingin menghapus Issue ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('production.issue.destroy', issue.id));
        }
    };

    return (
        <div className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">
                        Vol. {issue.volume}, No. {issue.number} ({issue.year})
                    </h3>
                    {issue.title && (
                        <p className="text-sm text-gray-500 mt-0.5 italic">
                            {issue.title}
                        </p>
                    )}
                </div>

                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    issue.status === 'Published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                }`}>
                    {issue.status === 'Published' ? '✓ Terbit' : '✎ Draft'}
                </span>
            </div>

            {issue.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {issue.description}
                </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span>📄 {issue.galleys_count ?? 0} artikel</span>
                {issue.published_at && (
                    <span>
                        📅 {new Date(issue.published_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </span>
                )}
            </div>

            <div className="flex gap-2 flex-wrap">
                <Link
                    href={route('production.issue.show', issue.id)}
                    className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700"
                >
                    Lihat
                </Link>

                {issue.status === 'Draft' && (
                    <>
                        <Link
                            href={route('production.issue.edit', issue.id)}
                            className="text-sm bg-gray-100 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-200"
                        >
                            Edit
                        </Link>

                        {(issue.galleys_count ?? 0) === 0 && (
                            <button
                                onClick={handleDelete}
                                className="text-sm bg-red-100 text-red-600 px-4 py-1.5 rounded hover:bg-red-200"
                            >
                                Hapus
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}