/**
 * Discussion Index Component
 *
 * @description
 * Displays a list of all discussion threads for a specific submission.
 * Users can view existing threads, see the latest reply, and navigate
 * to individual thread pages. Also shows thread metadata like
 * number of replies and attachments.
 *
 * @route GET /discussions (per submission context)
 *
 * @features
 * - List of discussion threads per submission
 * - Thread preview with latest message
 * - Reply count and attachment indicators
 * - Search/filter discussions
 * - Empty state when no discussions exist
 * - Pagination support
 *
 * @author M FAUZAN PRADHIPTA DIMAS CRISWARA
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Eye, MessageCircle, Paperclip, Search } from 'lucide-react';
import { useState } from 'react';

// Discussion thread type definition
interface DiscussionThread {
    id: number;
    discussable_type: string;
    discussable_id: number;
    user_id: number;
    parent_id: number | null;
    body: string;
    author_role: string | null;
    attachment_path: string | null;
    attachment_filename: string | null;
    created_at: string;
    updated_at: string;
    user: User;
    replies_count?: number;
    replies?: DiscussionThread[];
}

interface Props {
    threads: PaginatedData<DiscussionThread>;
    submissionId: number;
    submissionTitle?: string;
    filters?: {
        search?: string;
    };
}

export default function DiscussionIndex({ threads, submissionId, submissionTitle, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Diskusi',
            href: '#',
        },
    ];

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getRoleBadgeVariant = (role: string | null) => {
        switch (role) {
            case 'Super Admin':
                return 'destructive';
            case 'Admin Kampus':
                return 'default';
            case 'Reviewer':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const truncateBody = (body: string, maxLength: number = 150) => {
        if (body.length <= maxLength) return body;
        return body.substring(0, maxLength) + '...';
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(window.location.pathname, { search: search || undefined }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Diskusi" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <MessageCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    Thread Diskusi
                                </h1>
                                <p className="mt-1 text-muted-foreground">
                                    {submissionTitle ? `Diskusi untuk: ${submissionTitle}` : 'Daftar semua thread diskusi per submission'}
                                </p>
                            </div>
                            {threads.total > 0 && (
                                <Badge variant="secondary" className="w-fit">
                                    {threads.total} Thread
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari diskusi..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button type="submit" variant="outline">
                                Cari
                            </Button>
                        </form>
                    </div>

                    {/* Thread List */}
                    <div className="space-y-4">
                        {threads.data.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <MessageCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">Belum Ada Diskusi</h3>
                                    <p className="text-sm text-muted-foreground">Belum ada thread diskusi untuk submission ini.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            threads.data.map((thread) => (
                                <Card key={thread.id} className="transition-colors hover:bg-muted/50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                                        {thread.user?.name
                                                            ?.split(' ')
                                                            .map((n) => n[0])
                                                            .join('')
                                                            .substring(0, 2)
                                                            .toUpperCase()}
                                                    </div>
                                                    <span>{thread.user?.name}</span>
                                                </CardTitle>
                                                <CardDescription className="mt-1 flex items-center gap-2">
                                                    {thread.author_role && (
                                                        <Badge variant={getRoleBadgeVariant(thread.author_role) as any} className="text-xs">
                                                            {thread.author_role}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">{formatDate(thread.created_at)}</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-3">
                                        <p className="text-sm text-foreground">{truncateBody(thread.body)}</p>

                                        {/* Thread Meta Info */}
                                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                                            {thread.replies_count !== undefined && thread.replies_count > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="h-3 w-3" />
                                                    {thread.replies_count} balasan
                                                </div>
                                            )}
                                            {thread.attachment_path && (
                                                <div className="flex items-center gap-1">
                                                    <Paperclip className="h-3 w-3" />
                                                    {thread.attachment_filename || 'Lampiran'}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                                            <Link href={`/discussions/${thread.id}`}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Lihat Thread
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {threads.total > threads.per_page && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {threads.from} - {threads.to} dari {threads.total} thread
                            </div>
                            <div className="flex gap-2">
                                {threads.prev_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(threads.prev_page_url!)}>
                                        <ChevronLeft className="h-4 w-4" />
                                        Sebelumnya
                                    </Button>
                                )}
                                {threads.next_page_url && (
                                    <Button variant="outline" size="sm" onClick={() => router.get(threads.next_page_url!)}>
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
