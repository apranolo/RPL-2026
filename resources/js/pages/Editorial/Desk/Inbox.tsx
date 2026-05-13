/**
 * Editor Desk - Inbox Page
 *
 * @description Halaman inbox Editor untuk mengelola naskah yang masuk.
 *              Menampilkan submissions dalam 3 tab: Unassigned, Active, Awaiting Confirmation.
 * @route GET /editorial/desk/inbox
 */
import InboxTab, { type TabItem } from '@/components/InboxTab';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { BookOpen, CheckCircle2, Clock, Eye, FileText, Inbox, Search, UserPlus } from 'lucide-react';
import { useState } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string;
}

interface Author {
    id: number;
    name: string;
    email: string;
}

interface Editor {
    id: number;
    name: string;
}

interface EditorialAssignment {
    id: number;
    editor: Editor;
    status: string;
    status_label: string;
    assigned_at: string;
}

interface Submission {
    id: number;
    title: string;
    authors_display: string | null;
    status: string;
    status_label: string;
    status_color: string;
    submitted_at: string;
    journal: Journal;
    author: Author;
    editorial_assignments: EditorialAssignment[];
}

interface PaginatedSubmissions {
    data: Submission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    submissions: PaginatedSubmissions;
    counts: {
        unassigned: number;
        active: number;
        awaiting: number;
    };
    filters: {
        tab: string;
        search?: string;
    };
}

export default function InboxPage({ submissions, counts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const activeTab = filters.tab || 'unassigned';

    const tabs: TabItem[] = [
        {
            key: 'unassigned',
            label: 'Unassigned',
            count: counts.unassigned,
            icon: <UserPlus className="h-4 w-4" />,
        },
        {
            key: 'active',
            label: 'Active',
            count: counts.active,
            icon: <BookOpen className="h-4 w-4" />,
        },
        {
            key: 'awaiting',
            label: 'Awaiting Confirmation',
            count: counts.awaiting,
            icon: <Clock className="h-4 w-4" />,
        },
    ];

    const handleTabChange = (tab: string) => {
        router.get(
            route('editorial.desk.inbox'),
            { tab, search: search || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearch = () => {
        router.get(
            route('editorial.desk.inbox'),
            { tab: activeTab, search: search || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const getStatusBadge = (submission: Submission) => {
        const colorMap: Record<string, string> = {
            blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
        };

        return (
            <Badge variant="outline" className={colorMap[submission.status_color] || colorMap.gray}>
                {submission.status_label}
            </Badge>
        );
    };

    const totalSubmissions = counts.unassigned + counts.active + counts.awaiting;

    return (
        <AppLayout>
            <Head title="Editor Inbox" />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Inbox className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Editor Inbox</h1>
                            <p className="text-muted-foreground">
                                Kelola naskah yang masuk ke jurnal Anda • {totalSubmissions} total naskah
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                                <UserPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{counts.unassigned}</p>
                                <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Belum Ditugaskan</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{counts.active}</p>
                                <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">Sedang Diproses</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{counts.awaiting}</p>
                                <p className="text-sm text-amber-600/80 dark:text-amber-400/80">Menunggu Konfirmasi</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs + Search */}
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <InboxTab tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />

                    <div className="flex gap-2">
                        <div className="relative w-full lg:w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari judul atau penulis..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" onClick={handleSearch}>
                            Cari
                        </Button>
                    </div>
                </div>

                {/* Submissions Table */}
                <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[45%]">Naskah</TableHead>
                                <TableHead>Jurnal</TableHead>
                                <TableHead>Penulis</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-16 text-center">
                                        <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground/30" />
                                        <p className="mb-2 text-lg font-medium text-muted-foreground">
                                            {activeTab === 'unassigned' && 'Tidak ada naskah yang belum ditugaskan'}
                                            {activeTab === 'active' && 'Tidak ada naskah aktif saat ini'}
                                            {activeTab === 'awaiting' && 'Tidak ada naskah menunggu konfirmasi'}
                                        </p>
                                        <p className="text-sm text-muted-foreground/70">
                                            Naskah akan muncul di sini saat ada submission baru.
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.data.map((submission) => (
                                    <TableRow key={submission.id} className="group">
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold leading-tight group-hover:text-primary">
                                                    {submission.title}
                                                </p>
                                                {submission.authors_display && (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {submission.authors_display}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p className="font-medium">{submission.journal.title}</p>
                                                <p className="text-muted-foreground">{submission.journal.issn}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p>{submission.author.name}</p>
                                                <p className="text-muted-foreground">{submission.author.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(submission)}</TableCell>
                                        <TableCell>
                                            <span className="text-sm text-muted-foreground">
                                                {submission.submitted_at
                                                    ? new Date(submission.submitted_at).toLocaleDateString('id-ID', {
                                                          day: 'numeric',
                                                          month: 'short',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="mr-1 h-4 w-4" />
                                                Detail
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {submissions.last_page > 1 && (
                    <div className="mt-6 flex justify-center gap-2">
                        {submissions.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
