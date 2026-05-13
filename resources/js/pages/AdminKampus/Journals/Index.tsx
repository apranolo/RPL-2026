/**
 * JournalsIndex Component for Admin Kampus
 *
 * @description
 * Journal management page for LPPM (Admin Kampus) with approve/reject workflow,
 * reassignment, filtering, and CSV import capabilities.
 *
 * @features
 * - Search by title, ISSN, or e-ISSN
 * - Filter by SINTA rank, scientific field, indexation, approval status
 * - Approve/Reject journals with reason
 * - Delete pending/rejected journals
 * - Reassign journal manager
 * - Add new journal / Import CSV
 *
 * @route GET /admin-kampus/journals
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Check,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Eye,
    MoreHorizontal,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Upload,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Journals',
        href: '/admin-kampus/journals',
    },
];

interface Journal {
    id: number;
    name: string;
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
    approval_status: string | null;
    approval_status_label: string;
    rejection_reason: string | null;
    indexation_labels: string[];
    created_at: string;
}

interface UniversityUser {
    id: number;
    name: string;
    email: string;
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
        sinta_rank?: string;
        scientific_field_id?: number;
        indexation?: string;
        // Phase 2 filters
        pembinaan_period?: string;
        pembinaan_year?: string;
        participation?: string;
        approval_status?: string;
    };
    scientificFields: ScientificField[];
    sintaRanks: FilterOption[];
    indexationOptions: FilterOption[];
    // Phase 2 filter options
    pembinaanPeriods: FilterOption[];
    pembinaanYears: FilterOption[];
    participationOptions: FilterOption[];
    approvalStatusOptions: FilterOption[];
    universityUsers?: UniversityUser[];
}

export default function JournalsIndex({
    journals,
    filters,
    scientificFields,
    sintaRanks,
    indexationOptions,
    pembinaanPeriods,
    // pembinaanYears,
    participationOptions,
    approvalStatusOptions,
    universityUsers = [],
}: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [sintaRankFilter, setSintaRankFilter] = useState(filters.sinta_rank || '');
    const [scientificFieldFilter, setScientificFieldFilter] = useState(filters.scientific_field_id?.toString() || '');
    const [indexationFilter, setIndexationFilter] = useState(filters.indexation || '');
    // Phase 2 filter states
    const [pembinaanPeriodFilter, setPembinaanPeriodFilter] = useState(filters.pembinaan_period || '');
    const [pembinaanYearFilter, setPembinaanYearFilter] = useState(filters.pembinaan_year || '');
    const [participationFilter, setParticipationFilter] = useState(filters.participation || '');
    const [approvalStatusFilter, setApprovalStatusFilter] = useState(filters.approval_status || '');

    // Action dialog states
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectingJournal, setRejectingJournal] = useState<Journal | null>(null);
    const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
    const [reassigningJournal, setReassigningJournal] = useState<Journal | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingJournal, setDeletingJournal] = useState<Journal | null>(null);

    // Bulk harvest state
    const [selectedJournals, setSelectedJournals] = useState<number[]>([]);
    const [isBulkHarvesting, setIsBulkHarvesting] = useState(false);

    // Clear selection when journal list changes (e.g. pagination, filtering)
    useEffect(() => {
        setSelectedJournals([]);
    }, [journals.data, journals.current_page]);

    const rejectForm = useForm({ reason: '' });
    const reassignForm = useForm({ new_user_id: '', reason: '' });

    const toggleSelectAll = () => {
        if (selectedJournals.length === journals.data.length) {
            setSelectedJournals([]);
        } else {
            setSelectedJournals(journals.data.map((j) => j.id));
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedJournals((prev) => (prev.includes(id) ? prev.filter((jId) => jId !== id) : [...prev, id]));
    };

    const handleBulkHarvest = () => {
        if (selectedJournals.length === 0) return;
        if (!confirm(`Sinkronisasi OAI akan dijalankan untuk ${selectedJournals.length} jurnal yang dipilih. Lanjutkan?`)) return;

        setIsBulkHarvesting(true);
        router.post(
            route('admin-kampus.journals.harvest.bulk'),
            { journal_ids: selectedJournals },
            {
                preserveScroll: true,
                onSuccess: () => setSelectedJournals([]),
                onFinish: () => setIsBulkHarvesting(false),
            },
        );
    };

    const handleApprove = (journal: Journal) => {
        if (confirm(`Approve journal "${journal.title}"?`)) {
            router.post(
                route('admin-kampus.journals.approve', journal.id),
                {},
                {
                    preserveScroll: true,
                },
            );
        }
    };

    const handleReject = (journal: Journal) => {
        setRejectingJournal(journal);
        rejectForm.reset();
        setRejectDialogOpen(true);
    };

    const submitReject = () => {
        if (!rejectingJournal) return;
        rejectForm.post(route('admin-kampus.journals.reject', rejectingJournal.id), {
            preserveScroll: true,
            onSuccess: () => {
                setRejectDialogOpen(false);
                setRejectingJournal(null);
            },
        });
    };

    const handleDelete = (journal: Journal) => {
        setDeletingJournal(journal);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!deletingJournal) return;
        router.delete(route('admin-kampus.journals.destroy', deletingJournal.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialogOpen(false);
                setDeletingJournal(null);
            },
        });
    };

    const handleReassign = (journal: Journal) => {
        setReassigningJournal(journal);
        reassignForm.reset();
        setReassignDialogOpen(true);
    };

    const submitReassign = () => {
        if (!reassigningJournal) return;
        reassignForm.post(route('admin-kampus.journals.reassign', reassigningJournal.id), {
            preserveScroll: true,
            onSuccess: () => {
                setReassignDialogOpen(false);
                setReassigningJournal(null);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin-kampus.journals.index'),
            {
                search,
                sinta_rank: sintaRankFilter,
                scientific_field_id: scientificFieldFilter,
                indexation: indexationFilter,
                // Phase 2 filters
                pembinaan_period: pembinaanPeriodFilter,
                pembinaan_year: pembinaanYearFilter,
                participation: participationFilter,
                approval_status: approvalStatusFilter,
            },
            { preserveState: true },
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setSintaRankFilter('');
        setScientificFieldFilter('');
        setIndexationFilter('');
        // Phase 2 filters
        setPembinaanPeriodFilter('');
        setPembinaanYearFilter('');
        setParticipationFilter('');
        setApprovalStatusFilter('');
        router.get(route('admin-kampus.journals.index'));
    };

    const getApprovalStatusBadge = (status: string | null) => {
        switch (status) {
            case 'approved':
                return { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', label: 'Approved' };
            case 'rejected':
                return { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', label: 'Rejected' };
            case 'pending':
                return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', label: 'Pending' };
            default:
                return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', label: 'Unknown' };
        }
    };

    const getSintaRankColor = (rank: string | null) => {
        if (!rank || rank === 'non_sinta') return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';

        const numRank = parseInt(rank.replace('sinta_', ''));
        if (numRank <= 2) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
        if (numRank <= 4) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    };

    const hasActiveFilters = search || sintaRankFilter || scientificFieldFilter || indexationFilter;
    // Deprecated: statusFilter and accreditationGradeFilter removed from hasActiveFilters

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Journals Management" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                Journals Management
                            </h1>
                            <p className="mt-1 text-muted-foreground">View and monitor journals from your university</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href={route('admin-kampus.journals.import')}>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import CSV
                                </Button>
                            </Link>
                            <Link href={route('admin-kampus.journals.create')}>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Journal
                                </Button>
                            </Link>
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
                    <div className="mb-6 rounded-xl border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search by journal title, ISSN, or e-ISSN..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {/* Filter Row */}
                            <div className="flex flex-wrap gap-4">
                                {/* Deprecated: Status Filter - No longer used */}
                                {/* <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-48">
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
                                </Select> */}

                                {/* SINTA Rank Filter */}
                                <Select value={sintaRankFilter || 'all'} onValueChange={(value) => setSintaRankFilter(value === 'all' ? '' : value)}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All Accreditation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Accreditation</SelectItem>
                                        {sintaRanks.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Scientific Field Filter */}
                                <Select
                                    value={scientificFieldFilter || 'all'}
                                    onValueChange={(value) => setScientificFieldFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-64">
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

                                {/* Indexation Filter */}
                                <Select
                                    value={indexationFilter || 'all'}
                                    onValueChange={(value) => setIndexationFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-64">
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

                                {/* Approval Status Filter */}
                                <Select
                                    value={approvalStatusFilter || 'all'}
                                    onValueChange={(value) => setApprovalStatusFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-56">
                                        <SelectValue placeholder="All Approval Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Approval Status</SelectItem>
                                        {approvalStatusOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filter Row 2 - Phase 2 Pembinaan & Approval Filters */}
                            {/* <div className="flex flex-wrap gap-4"> */}
                            {/* Pembinaan Period Filter */}
                            {/* <Select
                                    value={pembinaanPeriodFilter || 'all'}
                                    onValueChange={(value) => setPembinaanPeriodFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-64">
                                        <SelectValue placeholder="All Periods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Periods</SelectItem>
                                        {pembinaanPeriods.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select> */}

                            {/* Pembinaan Year Filter 
                                <Select
                                    value={pembinaanYearFilter || 'all'}
                                    onValueChange={(value) => setPembinaanYearFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All Years" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Years</SelectItem>
                                        {pembinaanYears.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select> */}

                            {/* Participation Filter */}
                            {/* <Select
                                    value={participationFilter || 'all'}
                                    onValueChange={(value) => setParticipationFilter(value === 'all' ? '' : value)}
                                >
                                    <SelectTrigger className="w-56">
                                        <SelectValue placeholder="All Participation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Participation</SelectItem>
                                        {participationOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                
                            </div> */}

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Button type="submit">Search</Button>
                                {hasActiveFilters && (
                                    <Button type="button" variant="outline" onClick={handleClearFilters}>
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Results Count */}
                    <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                        <div className="text-sm text-muted-foreground">
                            Showing {journals.data.length > 0 ? (journals.current_page - 1) * journals.per_page + 1 : 0} to{' '}
                            {Math.min(journals.current_page * journals.per_page, journals.total)} of {journals.total} journals
                        </div>
                        {selectedJournals.length > 0 && (
                            <div className="flex items-center gap-4 rounded-md bg-secondary/50 px-4 py-2 text-sm">
                                <span className="font-medium text-foreground">{selectedJournals.length} jurnal dipilih</span>
                                <Button size="sm" onClick={handleBulkHarvest} disabled={isBulkHarvesting} className="gap-2">
                                    <RefreshCw className={`h-4 w-4 ${isBulkHarvesting ? 'animate-spin' : ''}`} />
                                    {isBulkHarvesting ? 'Syncing...' : 'Sync OAI'}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Card View */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {journals.data.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                    <p className="font-medium text-muted-foreground">
                                        {hasActiveFilters ? 'No journals found matching your filters' : 'Belum ada jurnal terdaftar'}
                                    </p>
                                    {!hasActiveFilters && (
                                        <p className="mt-1 text-sm text-muted-foreground">User dapat menambahkan jurnal melalui dashboard mereka.</p>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            journals.data.map((journal) => (
                                <Card key={journal.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <CardTitle className="text-base">{journal.title}</CardTitle>
                                                <a
                                                    href={journal.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                >
                                                    {journal.url.substring(0, 40)}...
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                            <Badge className={getSintaRankColor(journal.sinta_rank)}>{journal.sinta_rank_label}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pb-4">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="block text-xs text-muted-foreground">Pengelola</span>
                                                <span className="font-medium">{journal.user.name}</span>
                                                <span className="block text-xs text-muted-foreground">{journal.user.email}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-muted-foreground">ISSN</span>
                                                <span>{journal.issn || '-'}</span>
                                                <span className="block text-xs text-muted-foreground">e-ISSN: {journal.e_issn || '-'}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="block text-xs text-muted-foreground">Bidang Ilmu</span>
                                                <span>{journal.scientific_field?.name || '-'}</span>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="mb-1 block text-xs text-muted-foreground">Indexations</span>
                                                <div className="flex flex-wrap gap-1">
                                                    {journal.indexation_labels && journal.indexation_labels.length > 0 ? (
                                                        journal.indexation_labels.map((label, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                {label}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                                        {(() => {
                                            const badge = getApprovalStatusBadge(journal.approval_status);
                                            return <Badge className={badge.color}>{badge.label}</Badge>;
                                        })()}

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.visit(route('admin-kampus.journals.show', journal.id))}
                                            >
                                                <Eye className="h-4 w-4 sm:mr-2" />
                                                <span className="hidden sm:inline">View</span>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Open journal actions menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.visit(route('admin-kampus.journals.edit', journal.id))}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    {journal.approval_status === 'pending' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleApprove(journal)}
                                                                className="text-green-600 dark:text-green-400"
                                                            >
                                                                <Check className="mr-2 h-4 w-4" />
                                                                Approve
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleReject(journal)}
                                                                className="text-red-600 dark:text-red-400"
                                                            >
                                                                <X className="mr-2 h-4 w-4" />
                                                                Reject
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleReassign(journal)}>
                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                        Reassign Manager
                                                    </DropdownMenuItem>
                                                    {journal.approval_status !== 'approved' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(journal)}
                                                                className="text-red-600 dark:text-red-400"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Table View (Desktop) */}
                    <div className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm md:block dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12 text-center">
                                        <Checkbox
                                            checked={journals.data.length > 0 && selectedJournals.length === journals.data.length}
                                            onCheckedChange={toggleSelectAll}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead>Journal Title</TableHead>
                                    <TableHead>ISSN</TableHead>
                                    <TableHead>Pengelola</TableHead>
                                    <TableHead>Scientific Field</TableHead>
                                    <TableHead className="text-center">SINTA Rank</TableHead>
                                    <TableHead className="text-center">Approval Status</TableHead>
                                    <TableHead>Indexations</TableHead>
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
                                                    {hasActiveFilters ? 'No journals found matching your filters' : 'Belum ada jurnal terdaftar'}
                                                </p>
                                                {!hasActiveFilters && (
                                                    <p className="text-sm text-muted-foreground">
                                                        User dapat menambahkan jurnal melalui dashboard mereka.
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.data.map((journal) => (
                                        <TableRow key={journal.id}>
                                            <TableCell className="text-center">
                                                <Checkbox
                                                    checked={selectedJournals.includes(journal.id)}
                                                    onCheckedChange={() => toggleSelect(journal.id)}
                                                    aria-label={`Select ${journal.title}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-semibold text-foreground">{journal.title}</div>
                                                    <a
                                                        href={journal.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        {journal.url.substring(0, 40)}...
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
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
                                                {(() => {
                                                    const badge = getApprovalStatusBadge(journal.approval_status);
                                                    return <Badge className={badge.color}>{badge.label}</Badge>;
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {journal.indexation_labels && journal.indexation_labels.length > 0 ? (
                                                        journal.indexation_labels.map((label, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">
                                                                {label}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => router.visit(route('admin-kampus.journals.show', journal.id))}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => router.visit(route('admin-kampus.journals.edit', journal.id))}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        {journal.approval_status === 'pending' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleApprove(journal)}
                                                                    className="text-green-600 dark:text-green-400"
                                                                >
                                                                    <Check className="mr-2 h-4 w-4" />
                                                                    Approve
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleReject(journal)}
                                                                    className="text-red-600 dark:text-red-400"
                                                                >
                                                                    <X className="mr-2 h-4 w-4" />
                                                                    Reject
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleReassign(journal)}>
                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                            Reassign Manager
                                                        </DropdownMenuItem>

                                                        {journal.approval_status !== 'approved' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(journal)}
                                                                    className="text-red-600 dark:text-red-400"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {journals.last_page > 1 && (
                        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                <span className="font-medium">
                                    {journals.data.length > 0 ? (journals.current_page - 1) * journals.per_page + 1 : 0}
                                </span>{' '}
                                to <span className="font-medium">{Math.min(journals.current_page * journals.per_page, journals.total)}</span> of{' '}
                                <span className="font-medium">{journals.total}</span> results
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2">
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

                {/* Reject Reason Dialog */}
                <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reject Journal</DialogTitle>
                            <DialogDescription>
                                Provide a reason for rejecting "{rejectingJournal?.title}". The journal manager will be notified.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="reject-reason">Reason for Rejection</Label>
                                <Textarea
                                    id="reject-reason"
                                    rows={4}
                                    value={rejectForm.data.reason}
                                    onChange={(e) => rejectForm.setData('reason', e.target.value)}
                                    placeholder="Minimum 10 characters..."
                                    className="mt-1"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">{rejectForm.data.reason.length}/1000 characters (min 10)</p>
                                {rejectForm.errors.reason && <p className="mt-1 text-sm text-red-600">{rejectForm.errors.reason}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={submitReject}
                                disabled={rejectForm.processing || rejectForm.data.reason.length < 10}
                            >
                                Reject Journal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Journal</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{deletingJournal?.title}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Delete Journal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reassign Manager Dialog */}
                <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reassign Journal Manager</DialogTitle>
                            <DialogDescription>
                                Transfer "{reassigningJournal?.title}" to another manager in your university. Current manager:{' '}
                                {reassigningJournal?.user.name}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label htmlFor="new-manager">New Manager</Label>
                                <Select value={reassignForm.data.new_user_id} onValueChange={(value) => reassignForm.setData('new_user_id', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select new manager..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {universityUsers
                                            .filter((u) => u.id !== reassigningJournal?.user.id)
                                            .map((user) => (
                                                <SelectItem key={user.id} value={user.id.toString()}>
                                                    {user.name} ({user.email})
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {reassignForm.errors.new_user_id && <p className="mt-1 text-sm text-red-600">{reassignForm.errors.new_user_id}</p>}
                            </div>
                            <div>
                                <Label htmlFor="reassign-reason">Reason (Optional)</Label>
                                <Textarea
                                    id="reassign-reason"
                                    rows={3}
                                    value={reassignForm.data.reason}
                                    onChange={(e) => reassignForm.setData('reason', e.target.value)}
                                    placeholder="Why are you reassigning this journal?"
                                    className="mt-1"
                                    maxLength={500}
                                />
                                <p className="mt-1 text-xs text-muted-foreground">{reassignForm.data.reason.length}/500 characters</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setReassignDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={submitReassign} disabled={reassignForm.processing || !reassignForm.data.new_user_id}>
                                Reassign Journal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
