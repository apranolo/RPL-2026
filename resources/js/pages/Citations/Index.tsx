import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Citations', href: '/citations' },
];

interface Citation {
    id: number;
    title: string;
    author: string | null;
    publication_year: number | null;
    journal: string | null;
    volume: string | null;
    issue: string | null;
    pages: string | null;
    doi: string | null;
}

interface PaginatedCitations {
    data: Citation[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface SyncStatus {
    status: 'idle' | 'running' | 'done' | 'failed';
    message?: string;
    processed?: number;
    total?: number;
    citations_saved?: number;
    updated_at?: string;
}

interface Props extends PageProps {
    citations: PaginatedCitations;
}

export default function CitationsIndex({ citations }: Props) {
    const { data, total, links } = citations;
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' });
    const [syncing, setSyncing] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchStatus = async () => {
        const res = await fetch('/citations/sync/status');
        const json: SyncStatus = await res.json();
        setSyncStatus(json);

        if (json.status !== 'running') {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            setSyncing(false);
            if (json.status === 'done') {
                router.reload({ only: ['citations'] });
            }
        }
    };

    const startSync = async () => {
        setSyncing(true);
        setSyncStatus({ status: 'running', message: 'Starting...', processed: 0, total: 0, citations_saved: 0 });

        await fetch('/citations/sync', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')!.getAttribute('content')! } });

        pollRef.current = setInterval(fetchStatus, 3000);
    };

    useEffect(() => {
        fetchStatus();
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    const progress = syncStatus.total ? Math.round((syncStatus.processed! / syncStatus.total) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Citations" />
            <div className="flex flex-col gap-4 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Citations</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{total} entries</span>
                        <button
                            onClick={startSync}
                            disabled={syncing || syncStatus.status === 'running'}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
                        >
                            {syncing || syncStatus.status === 'running' ? 'Syncing...' : 'Sync Citations'}
                        </button>
                    </div>
                </div>

                {syncStatus.status !== 'idle' && (
                    <div className="rounded-xl border border-sidebar-border/70 bg-white p-4 dark:border-sidebar-border dark:bg-neutral-950">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium">
                                {syncStatus.status === 'running' && '⏳ '}
                                {syncStatus.status === 'done' && '✓ '}
                                {syncStatus.status === 'failed' && '✗ '}
                                {syncStatus.message}
                            </span>
                            <span className="text-muted-foreground">
                                {syncStatus.citations_saved ?? 0} citations saved
                                {syncStatus.total ? ` · ${syncStatus.processed}/${syncStatus.total} journals` : ''}
                            </span>
                        </div>
                        {syncStatus.status === 'running' && (
                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                                <div
                                    className="h-full rounded-full bg-primary transition-all duration-500"
                                    style={{ width: syncStatus.total ? `${progress}%` : '100%', animation: syncStatus.total ? 'none' : 'pulse 1.5s infinite' }}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 bg-white dark:border-sidebar-border dark:bg-neutral-950">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead className="border-b border-sidebar-border/70 dark:border-sidebar-border">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Author</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Year</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Journal</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">DOI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sidebar-border/70 dark:divide-sidebar-border">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                        No citations found. Click "Sync Citations" to fetch.
                                    </td>
                                </tr>
                            ) : (
                                data.map((citation, index) => (
                                    <tr key={citation.id} className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {(citations.current_page - 1) * citations.per_page + index + 1}
                                        </td>
                                        <td className="px-4 py-3 font-medium">{citation.title}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{citation.author ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{citation.publication_year ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{citation.journal ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            {citation.doi ? (
                                                <a href={citation.doi} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                    {citation.doi}
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {links.length > 3 && (
                    <div className="flex flex-wrap items-center justify-center gap-1">
                        {links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={[
                                    'rounded px-3 py-1 text-sm',
                                    link.active ? 'bg-primary font-medium text-primary-foreground' : 'text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                    !link.url ? 'pointer-events-none opacity-40' : '',
                                ].join(' ')}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
