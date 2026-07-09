import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Building2, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, FileText, FilterX, Search } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface University {
    id: number;
    name: string;
    short_name?: string | null;
    code: string;
}

interface PembinaanProgram {
    id: number;
    name: string;
    category: string;
}

interface Contract {
    id: number;
    contract_number: string;
    title: string;
    status: string;
    status_label: string;
    status_color: string;
    contract_value: number;
    party_1: string | null;
    party_2: string | null;
    funding_total: number;
    disbursed_total: number;
    funding_progress: number;
    fundings_count: number;
    start_date?: string | null;
    end_date?: string | null;
    signed_at?: string | null;
    created_at: string;
    university: University;
    pembinaan?: PembinaanProgram | null;
}

interface FilterOption {
    value: string;
    label: string;
}

interface Props {
    contracts: Paginated<Contract>;
    filters: {
        search?: string;
        status?: string;
        university_id?: number | string;
        pembinaan_id?: number | string;
    };
    summary: {
        total_contracts: number;
        contract_value: number;
        disbursed_value: number;
        outstanding_value: number;
    };
    universities: University[];
    pembinaanPrograms: PembinaanProgram[];
    statusOptions: FilterOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Keuangan',
        href: '/finance/contracts',
    },
    {
        title: 'Kontrak',
        href: '/finance/contracts',
    },
];

const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
});

const statusClassNames: Record<string, string> = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300',
    blue: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-300',
    red: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300',
    gray: 'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
};

function formatCurrency(value: number) {
    return currencyFormatter.format(value || 0);
}

function formatDate(value?: string | null) {
    if (!value) {
        return '-';
    }

    return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function formatCategory(category?: string) {
    if (!category) {
        return null;
    }

    return category === 'akreditasi' ? 'Akreditasi' : 'Indeksasi';
}

function formatPeriod(startDate?: string | null, endDate?: string | null) {
    if (!startDate && !endDate) {
        return 'Belum ditentukan';
    }

    if (!startDate) {
        return `Sampai ${formatDate(endDate)}`;
    }

    if (!endDate) {
        return `Mulai ${formatDate(startDate)}`;
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function cleanPaginationLabel(label: string) {
    return label.replace('&laquo;', '').replace('&raquo;', '').trim();
}

export default function ContractIndex({ contracts, filters, summary, universities, pembinaanPrograms, statusOptions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [universityId, setUniversityId] = useState(filters.university_id?.toString() || '');
    const [pembinaanId, setPembinaanId] = useState(filters.pembinaan_id?.toString() || '');

    const hasActiveFilters = Boolean(search || status || universityId || pembinaanId);

    const submitFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            route('finance.contracts.index'),
            {
                search,
                status,
                university_id: universityId,
                pembinaan_id: pembinaanId,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setUniversityId('');
        setPembinaanId('');
        router.get(route('finance.contracts.index'));
    };

    const summaryItems = [
        {
            label: 'Total Kontrak',
            value: summary.total_contracts.toLocaleString('id-ID'),
            detail: `${contracts.total.toLocaleString('id-ID')} sesuai filter`,
            icon: FileText,
            tone: 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60',
        },
        {
            label: 'Nilai Kontrak',
            value: formatCurrency(summary.contract_value),
            detail: 'Akumulasi kontrak',
            icon: ClipboardList,
            tone: 'border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40',
        },
        {
            label: 'Dana Dicairkan',
            value: formatCurrency(summary.disbursed_value),
            detail: 'Funding status dicairkan',
            icon: Building2,
            tone: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40',
        },
        {
            label: 'Outstanding',
            value: formatCurrency(summary.outstanding_value),
            detail: 'Belum terealisasi',
            icon: CalendarDays,
            tone: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Kontrak" />

            <div className="flex h-full flex-1 flex-col gap-5 overflow-x-auto p-4">
                <header className="flex flex-col gap-4 border-b border-sidebar-border/70 pb-5 lg:flex-row lg:items-center lg:justify-between dark:border-sidebar-border">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-normal text-foreground">Manajemen Kontrak</h1>
                                <p className="text-sm text-muted-foreground">Monitoring kontrak dan realisasi pendanaan untuk Admin Keuangan.</p>
                            </div>
                        </div>
                    </div>
                </header>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {summaryItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className={cn('rounded-lg border p-4', item.tone)}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                        <p className="mt-2 truncate text-xl font-semibold text-foreground">{item.value}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                                    </div>
                                    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                                </div>
                            </div>
                        );
                    })}
                </section>

                <section className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                    <form onSubmit={submitFilters} className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_240px_240px_auto]">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari nomor kontrak, judul, atau PTMA"
                                className="pl-9"
                            />
                        </div>

                        <Select value={status || 'all'} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua status</SelectItem>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={universityId || 'all'} onValueChange={(value) => setUniversityId(value === 'all' ? '' : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua PTMA" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua PTMA</SelectItem>
                                {universities.map((university) => (
                                    <SelectItem key={university.id} value={university.id.toString()}>
                                        {university.short_name || university.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={pembinaanId || 'all'} onValueChange={(value) => setPembinaanId(value === 'all' ? '' : value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua program" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua program</SelectItem>
                                {pembinaanPrograms.map((program) => (
                                    <SelectItem key={program.id} value={program.id.toString()}>
                                        {program.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex gap-2">
                            <Button type="submit" className="gap-2">
                                <Search className="h-4 w-4" />
                                Filter
                            </Button>
                            {hasActiveFilters && (
                                <Button type="button" variant="outline" size="icon" onClick={clearFilters} aria-label="Reset filter">
                                    <FilterX className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="hidden overflow-hidden rounded-lg border border-sidebar-border/70 bg-card dark:border-sidebar-border lg:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kontrak</TableHead>
                                <TableHead>PTMA</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Pihak</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead className="text-right">Nilai</TableHead>
                                <TableHead>Realisasi</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contracts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <FileText className="h-10 w-10 text-muted-foreground/50" />
                                            <p className="font-medium">Belum ada kontrak yang cocok dengan filter.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contracts.data.map((contract) => (
                                    <TableRow key={contract.id}>
                                        <TableCell className="min-w-72">
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground">{contract.title}</p>
                                                <p className="text-xs text-muted-foreground">{contract.contract_number}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium">{contract.university.short_name || contract.university.code}</p>
                                                <p className="max-w-56 truncate text-xs text-muted-foreground">{contract.university.name}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {contract.pembinaan ? (
                                                <div className="space-y-1">
                                                    <p className="max-w-56 truncate font-medium">{contract.pembinaan.name}</p>
                                                    <p className="text-xs text-muted-foreground">{formatCategory(contract.pembinaan.category)}</p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <p className="font-medium">{contract.party_1 || '-'}</p>
                                                <p className="text-xs text-muted-foreground">{contract.party_2 || '-'}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap text-sm">{formatPeriod(contract.start_date, contract.end_date)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(contract.contract_value)}</TableCell>
                                        <TableCell className="min-w-56">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-3 text-xs">
                                                    <span className="text-muted-foreground">{formatCurrency(contract.disbursed_total)}</span>
                                                    <span className="font-medium">{contract.funding_progress}%</span>
                                                </div>
                                                <Progress value={contract.funding_progress} className="h-2" />
                                                <p className="text-xs text-muted-foreground">{contract.fundings_count} pencatatan funding</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn('border', statusClassNames[contract.status_color] || statusClassNames.gray)}>
                                                {contract.status_label}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </section>

                <section className="grid gap-3 lg:hidden">
                    {contracts.data.length === 0 ? (
                        <div className="rounded-lg border border-sidebar-border/70 bg-card p-8 text-center dark:border-sidebar-border">
                            <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
                            <p className="mt-3 font-medium text-muted-foreground">Belum ada kontrak yang cocok dengan filter.</p>
                        </div>
                    ) : (
                        contracts.data.map((contract) => (
                            <article key={contract.id} className="rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-foreground">{contract.title}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{contract.contract_number}</p>
                                    </div>
                                    <Badge variant="outline" className={cn('shrink-0 border', statusClassNames[contract.status_color] || statusClassNames.gray)}>
                                        {contract.status_label}
                                    </Badge>
                                </div>

                                <div className="mt-4 grid gap-3 text-sm">
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">PTMA</span>
                                        <span className="text-right font-medium">{contract.university.short_name || contract.university.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Pihak 1</span>
                                        <span className="text-right font-medium">{contract.party_1 || '-'}</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Pihak 2</span>
                                        <span className="text-right font-medium">{contract.party_2 || '-'}</span>

                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Nilai</span>
                                        <span className="text-right font-medium">{formatCurrency(contract.contract_value)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-muted-foreground">Periode</span>
                                        <span className="text-right font-medium">{formatPeriod(contract.start_date, contract.end_date)}</span>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">Realisasi {formatCurrency(contract.disbursed_total)}</span>
                                        <span className="font-medium">{contract.funding_progress}%</span>
                                    </div>
                                    <Progress value={contract.funding_progress} className="h-2" />
                                </div>
                            </article>
                        ))
                    )}
                </section>

                {contracts.last_page > 1 && (
                    <div className="flex flex-col gap-3 border-t border-sidebar-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border">
                        <p className="text-sm text-muted-foreground">
                            Halaman {contracts.current_page} dari {contracts.last_page}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {contracts.links.map((link, index) => {
                                if (link.label === '&laquo; Previous') {
                                    return (
                                        <Button
                                            key={index}
                                            type="button"
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
                                            type="button"
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
                                        type="button"
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.visit(link.url)}
                                    >
                                        {cleanPaginationLabel(link.label)}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
