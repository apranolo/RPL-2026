/**
 * @route /admin-kampus/citations (citations.index)
 * @features
 *  - Table of authors with summary citation metrics (total citations, h-index)
 *  - Click an author's name to view their full citation profile
 * @description
 * Lists researchers/authors provided by CitationController@index. Each author
 * name links to the citation profile detail page (Profile/Citation) via the
 * `citations.show` route.
 */
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citations', href: '/admin-kampus/citations' },
];

interface Author {
    id: number;
    name: string;
    affiliation: string;
    total_citations: number;
    h_index: number;
}

interface Props extends PageProps {
    authors: Author[];
}

export default function CitationsIndex({ authors }: Props) {
    const [syncing, setSyncing] = useState(false);

    function handleSync() {
        setSyncing(true);
        router.post(
            route('admin-kampus.citations.sync'),
            {},
            { onFinish: () => setSyncing(false) },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citations" />
            <div className="flex flex-col gap-4 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Authors</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{authors.length} authors</span>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
                            >
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                            </svg>
                            {syncing ? 'Syncing...' : 'Sync Citations'}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-950">
                    <table className="w-full min-w-[600px] text-sm">
                        <thead className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Affiliation</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total Citations</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">h-index</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {authors.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                                        No authors found.
                                    </td>
                                </tr>
                            ) : (
                                authors.map((author, index) => (
                                    <tr key={author.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                        <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium">
                                            <Link
                                                href={`/admin-kampus/citations/${author.id}`}
                                                className="text-primary hover:underline"
                                            >
                                                {author.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{author.affiliation}</td>
                                        <td className="px-4 py-3 text-right text-muted-foreground">{author.total_citations.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-primary">{author.h_index}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
