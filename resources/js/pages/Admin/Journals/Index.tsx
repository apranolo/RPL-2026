/**
 * JournalsIndex Component for Super Admin
 *
 * @description
 * A comprehensive list view page for viewing all journals across all universities.
 * This component provides filtering, searching, pagination for journal monitoring.
 *
 * @features
 * - Search by title, ISSN, or e-ISSN
 * - Filter by university/PTM
 * - Filter by assessment status (Draft/Submitted/Reviewed)
 * - Filter by SINTA rank (1-6)
 * - Filter by scientific field
 * - Paginated results with navigation
 * - View journal details (coming in next iteration)
 * - Display assessment status and score
 * - Flash messages for feedback
 *
 * @route GET /admin/journals
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UniversityFilterCombobox } from '@/components/ui/university-filter-combobox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, Eye, Search } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Journals',
        href: '/admin/journals',
    },
];

interface Journal {
    id: number;
    title: string;
    issn: string | null;
    e_issn: string | null;
    url: string;
    university: {
        id: number;
        name: string;
    };
    user: {
        id: number;
        name: string;
        email: string;
    };
    scientific_field: {
        id: number;
        name: string;
    } | null;
    sinta_rank: string | null;
    sinta_rank_label: string;
    is_active: boolean;
    assessment_status: string | null;
    assessment_status_label: string;
    latest_score: number | null;
    created_at: string;
}

interface University {
    id: number;
    name: string;
    code: string;
    short_name?: string;
}

interface ScientificField {
    id: number;
    name: string;
}

interface FilterOption {
    value: string | number;
    label: string;
}

interface Props {
    journals: {
        data: Journal[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        university_id?: number;
        status?: string;
        sinta_rank?: string;
        scientific_field_id?: number;
        indexation?: string;
    };
    universities: University[];
    scientificFields: ScientificField[];
    sintaRanks: FilterOption[];
    statusOptions: FilterOption[];
    indexationOptions: FilterOption[];
}

export default function JournalsIndex({ journals, filters, universities, scientificFields, sintaRanks, statusOptions, indexationOptions }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [universityFilter, setUniversityFilter] = useState(filters.university_id?.toString() || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [sintaRankFilter, setSintaRankFilter] = useState(filters.sinta_rank || '');
    const [scientificFieldFilter, setScientificFieldFilter] = useState(filters.scientific_field_id?.toString() || '');
    const [indexationFilter, setIndexationFilter] = useState(filters.indexation || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.journals.index'),
            {
                search,
                university_id: universityFilter,
                status: statusFilter,
                sinta_rank: sintaRankFilter,
                scientific_field_id: scientificFieldFilter,
                indexation: indexationFilter,
            },
            { preserveState: true },
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setUniversityFilter('');
        setStatusFilter('');
        setSintaRankFilter('');
        setScientificFieldFilter('');
        setIndexationFilter('');
        router.get(route('admin.journals.index'));
    };

    const getStatusBadgeColor = (status: string | null) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
            case 'submitted':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'reviewed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const getSintaRankColor = (rank: string | null) => {
        if (!rank || rank === 'non_sinta') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';

        const numericRank = parseInt(rank.replace('sinta_', ''), 10);
        if (numericRank <= 2) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        if (numericRank <= 4) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    };

    const hasActiveFilters = search || universityFilter || statusFilter || sintaRankFilter || scientificFieldFilter || indexationFilter;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Journals" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    All Journals
                                </h1>
                                <p className="mt-1 text-muted-foreground">View and monitor all journals across all universities</p>
                            </div>
                        </div>
                    </div>

                    {/* Flash Messages */}
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

                    {/* Filters */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search by journal title, ISSN, or e-ISSN..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Filter Row 1 */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                                {/* University Filter - Super Admin Only */}
                                <div className="w-full sm:w-auto">
                                    <UniversityFilterCombobox
                                        universities={universities}
                                        value={universityFilter}
                                        onValueChange={setUniversityFilter}
                                        className="h-12 w-full sm:w-64"
                                    />
                                </div>

                                {/* Scientific Field Filter */}
                                <Select
                                    value={scientificFieldFilter || 'all'}
                                    onValueChange={(value) => setScientificFieldFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-full sm:w-64">
                                        <SelectValue placeholder="All Scientific Fields" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Scientific Fields</SelectItem>
                                        {scientificFields.map((field) => (
                                            <SelectItem key={field.id} value={field.id.toString()}>
                                                {field.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Status Filter */}
                                <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        {statusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* SINTA Rank Filter */}
                                <Select value={sintaRankFilter || 'all'} onValueChange={(value) => setSintaRankFilter(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-full sm:w-48">
                                        <SelectValue placeholder="All SINTA Ranks" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All SINTA Ranks</SelectItem>
                                        {sintaRanks.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter Row 2 - New Filters */}
                            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                                {/* Indexation Filter */}
                                <Select
                                    value={indexationFilter || 'all'}
                                    onValueChange={(value) => setIndexationFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-full sm:w-64">
                                        <SelectValue placeholder="All Indexations" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Indexations</SelectItem>
                                        {indexationOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="flex w-full gap-2 sm:w-auto">
                                    <Button type="submit" className="flex-1 sm:flex-none">
                                        Search
                                    </Button>
                                    {hasActiveFilters && (
                                        <Button type="button" variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-none">
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Results Count */}
                    <div className="mb-4 text-sm text-muted-foreground">
                        Showing {journals.data.length > 0 ? (journals.current_page - 1) * journals.per_page + 1 : 0} to{' '}
                        {Math.min(journals.current_page * journals.per_page, journals.total)} of {journals.total} journals
                    </div>

                    {/* Table View (Desktop) */}
                    <div className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Journal Title</TableHead>
                                    <TableHead>University</TableHead>
                                    <TableHead>ISSN</TableHead>
                                    <TableHead>Pengelola</TableHead>
                                    <TableHead>Scientific Field</TableHead>
                                    <TableHead className="text-center">SINTA Rank</TableHead>
                                    <TableHead className="text-center">Assessment Status</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                                                <p className="font-medium text-muted-foreground">
                                                    {hasActiveFilters ? 'No journals found matching your filters' : 'No journals registered yet'}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.data.map((journal) => (
                                        <TableRow key={journal.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-semibold text-foreground">{journal.title}</div>
                                                    <a
                                                        href={journal.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        {journal.url.substring(0, 35)}...
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium">{journal.university.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {journal.issn && <div>ISSN: {journal.issn}</div>}
                                                    {journal.e_issn && <div className="text-muted-foreground">e-ISSN: {journal.e_issn}</div>}
                                                    {!journal.issn && !journal.e_issn && '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">{journal.user.name}</div>
                                                    <div className="text-xs text-muted-foreground">{journal.user.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{journal.scientific_field?.name || '-'}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={getSintaRankColor(journal.sinta_rank)}>{journal.sinta_rank_label}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={getStatusBadgeColor(journal.assessment_status)}>
                                                    {journal.assessment_status_label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {journal.latest_score !== null && journal.latest_score !== undefined ? (
                                                    <span className="font-semibold text-foreground">{Number(journal.latest_score).toFixed(1)}%</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.journals.show', journal.id)}>
                                                        <Button variant="ghost" size="sm" title="View Details">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Card View (Mobile) */}
                    <div className="block space-y-4 md:hidden">
                        {journals.data.length === 0 ? (
                            <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                                <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                                    <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                                    <p className="font-medium text-muted-foreground">
                                        {hasActiveFilters ? 'No journals found matching your filters' : 'No journals registered yet'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            journals.data.map((journal) => (
                                <Card key={journal.id} className="overflow-hidden border-sidebar-border/70 dark:border-sidebar-border">
                                    <CardContent className="p-4">
                                        <div className="mb-3 flex items-start justify-between">
                                            <div>
                                                <div className="font-semibold text-foreground">{journal.title}</div>
                                                {journal.url ? (
                                                    <a
                                                        href={journal.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        {journal.url.length > 35 ? `${journal.url.substring(0, 35)}...` : journal.url}
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <span className="mt-1 block text-xs text-muted-foreground">
                                                        No URL provided
                                                    </span>
                                                )}
                                            </div>
                                            <Badge className={getSintaRankColor(journal.sinta_rank)}>{journal.sinta_rank_label}</Badge>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">University</span>
                                                <span className="text-right font-medium">{journal.university.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">ISSN / e-ISSN</span>
                                                <span className="text-right">
                                                    {journal.issn && <span>{journal.issn}</span>}
                                                    {journal.issn && journal.e_issn && <span> / </span>}
                                                    {journal.e_issn && <span className="text-muted-foreground">{journal.e_issn}</span>}
                                                    {!journal.issn && !journal.e_issn && '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Pengelola</span>
                                                <span className="text-right">
                                                    <div className="font-medium">{journal.user.name}</div>
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Field</span>
                                                <span className="text-right">{journal.scientific_field?.name || '-'}</span>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-sidebar-border/70 pt-2 dark:border-sidebar-border">
                                                <span className="text-muted-foreground">Status / Score</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getStatusBadgeColor(journal.assessment_status)}>
                                                        {journal.assessment_status_label}
                                                    </Badge>
                                                    {journal.latest_score !== null && journal.latest_score !== undefined ? (
                                                        <span className="font-semibold text-foreground">
                                                            {Number(journal.latest_score).toFixed(1)}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2 border-t border-sidebar-border/70 pt-3 dark:border-sidebar-border">
                                            <Link href={route('admin.journals.show', journal.id)}>
                                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {journals.last_page > 1 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Page {journals.current_page} of {journals.last_page}
                            </div>
                            <div className="flex gap-2">
                                {journals.links.map((link, index) => {
                                    if (link.label === '&laquo; Previous') {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                        );
                                    }
                                    if (link.label === 'Next &raquo;') {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url)}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    return (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                        >
                                            {link.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
