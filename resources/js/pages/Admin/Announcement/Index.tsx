/**
 * Announcement Index Component (Singular)
 *
 * @description
 * A list view for Super Admin to manage announcements.
 * Supports search, journal filtering, active status, published status, and pagination.
 *
 * @route GET /admin/announcements
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { JournalFilterCombobox } from '@/components/ui/journal-filter-combobox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Edit, Eye, Megaphone, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Announcements',
        href: '/admin/announcements',
    },
];

interface Announcement {
    id: number;
    title: string;
    description: string | null;
    is_active: boolean;
    is_featured: boolean;
    published_at: string | null;
    expires_at: string | null;
    journal: {
        id: number;
        title: string;
    } | null;
    user: {
        id: number;
        name: string;
    } | null;
    created_at: string;
}

interface Journal {
    id: number;
    title: string;
    issn?: string;
}

interface Props {
    announcements: {
        data: Announcement[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    journals: Journal[];
    filters: {
        search?: string;
        journal_id?: number;
        is_active?: string;
        is_published?: string;
    };
}

export default function AnnouncementIndex({ announcements, journals, filters }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [journalId, setJournalId] = useState(filters.journal_id?.toString() || '');
    const [isActiveFilter, setIsActiveFilter] = useState(filters.is_active || '');
    const [isPublishedFilter, setIsPublishedFilter] = useState(filters.is_published || '');

    const hasActiveFilters = Boolean(search || journalId || isActiveFilter || isPublishedFilter);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();

        router.get(
            route('admin.announcements.index'),
            {
                search,
                journal_id: journalId === 'all' ? '' : journalId,
                is_active: isActiveFilter,
                is_published: isPublishedFilter,
            },
            { preserveState: true },
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setJournalId('');
        setIsActiveFilter('');
        setIsPublishedFilter('');
        router.get(route('admin.announcements.index'));
    };

    const confirmDelete = (announcementId: number) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) {
            return;
        }

        router.delete(route('admin.announcements.destroy', announcementId), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                <Megaphone className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                Announcements Management
                            </h1>
                            <p className="mt-1 text-muted-foreground">Monitor and manage announcements across all journals.</p>
                        </div>
                        <Link href={route('admin.announcements.create')} className="w-full sm:w-auto">
                            <Button className="flex w-full items-center justify-center gap-2 sm:w-auto">
                                <Plus className="h-4 w-4" />
                                Add Announcement
                            </Button>
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                            {flash.error}
                        </div>
                    )}

                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4 xl:grid-cols-5">
                            <div className="col-span-2">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search by title, content, or description..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <JournalFilterCombobox
                                journals={journals}
                                value={journalId || 'all'}
                                onValueChange={(value) => setJournalId(value)}
                                placeholder="Filter by journal"
                                className="w-full"
                            />

                            <Select value={isActiveFilter} onValueChange={(value) => setIsActiveFilter(value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Active status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={isPublishedFilter} onValueChange={(value) => setIsPublishedFilter(value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Publication status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All publication</SelectItem>
                                    <SelectItem value="1">Published</SelectItem>
                                    <SelectItem value="0">Unpublished</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-3">
                                <Button type="submit" className="w-full">
                                    Search
                                </Button>
                                <Button variant="outline" type="button" onClick={handleClearFilters} className="w-full">
                                    Clear
                                </Button>
                            </div>
                        </form>

                        {hasActiveFilters && (
                            <div className="mt-4 text-sm text-muted-foreground">Filters are currently applied. Clear to reset the list.</div>
                        )}
                    </div>

                    <div className="hidden overflow-hidden rounded-xl border border-sidebar-border/70 md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Journal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Published</TableHead>
                                    <TableHead>Featured</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {announcements.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                            No announcements found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    announcements.data.map((announcement) => (
                                        <TableRow key={announcement.id}>
                                            <TableCell>
                                                <div className="font-medium text-foreground">{announcement.title}</div>
                                                {announcement.description ? (
                                                    <div className="line-clamp-2 text-sm text-muted-foreground">{announcement.description}</div>
                                                ) : null}
                                            </TableCell>
                                            <TableCell>
                                                {announcement.journal ? (
                                                    <div>{announcement.journal.title}</div>
                                                ) : (
                                                    <div className="text-muted-foreground">No journal</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        announcement.is_active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                    }
                                                >
                                                    {announcement.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        announcement.published_at
                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    }
                                                >
                                                    {announcement.published_at ? 'Published' : 'Unpublished'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        announcement.is_featured
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                    }
                                                >
                                                    {announcement.is_featured ? 'Featured' : 'Regular'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{announcement.created_at}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={route('admin.announcements.show', announcement.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin.announcements.edit', announcement.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" onClick={() => confirmDelete(announcement.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {announcements.last_page > 1 && (
                            <div className="border-t border-sidebar-border/70 px-6 py-4 dark:border-sidebar-border">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {(announcements.current_page - 1) * announcements.per_page + 1} to{' '}
                                        {Math.min(announcements.current_page * announcements.per_page, announcements.total)} of {announcements.total}{' '}
                                        results
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {announcements.links.map((link, index) => {
                                            if (!link.url) return null;

                                            const isFirst = index === 0;
                                            const isLast = index === announcements.links.length - 1;

                                            return (
                                                <Link key={index} href={link.url} preserveState preserveScroll>
                                                    <Button variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url}>
                                                        {isFirst ? (
                                                            <span className="sr-only">Previous</span>
                                                        ) : isLast ? (
                                                            <span className="sr-only">Next</span>
                                                        ) : (
                                                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                        )}
                                                    </Button>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 md:hidden">
                        {announcements.data.length === 0 ? (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardContent className="py-8 text-center text-muted-foreground">No announcements found.</CardContent>
                            </Card>
                        ) : (
                            announcements.data.map((announcement) => (
                                <Card key={announcement.id} className="overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                                    <CardContent className="space-y-4 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="font-semibold text-foreground">{announcement.title}</div>
                                                <div className="line-clamp-2 text-sm text-muted-foreground">
                                                    {announcement.description || 'No description available.'}
                                                </div>
                                            </div>
                                            <Badge
                                                className={
                                                    announcement.is_active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                }
                                            >
                                                {announcement.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div className="grid gap-2 text-sm text-muted-foreground">
                                            <div>Journal: {announcement.journal?.title || 'No journal'}</div>
                                            <div>Published: {announcement.published_at ? 'Yes' : 'No'}</div>
                                            <div>Featured: {announcement.is_featured ? 'Yes' : 'No'}</div>
                                            <div>Created: {announcement.created_at}</div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link href={route('admin.announcements.show', announcement.id)}>
                                                <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link href={route('admin.announcements.edit', announcement.id)}>
                                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                    <Edit className="h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full sm:w-auto"
                                                onClick={() => confirmDelete(announcement.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
