/**
 * Journal Show/Detail Page - Super Admin
 *
 * @description Display journal details and all assessments (read-only)
 * @features View journal info, list assessments, view assessment details, download attachments
 * @route GET /admin/journals/{id}
 */
import { AccreditationBadge, IndexationBadge, SintaBadge } from '@/components/badges';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type OaiHarvestingLog } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Bookmark,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Database,
    ExternalLink,
    FileText,
    Globe,
    Mail,
    RefreshCw,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Article {
    id: number;
    title: string;
    authors: string | string[];
    publication_date: string | null;
    abstract: string | null;
    doi: string | null;
    url: string | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface University {
    id: number;
    name: string;
    code: string;
}

interface JournalUser {
    id: number;
    name: string;
    email: string;
}

interface ScientificField {
    id: number;
    name: string;
}

interface AssessmentUser {
    id: number;
    name: string;
}

interface Assessment {
    id: number;
    assessment_date: string;
    period: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    status_label: string;
    status_color: string;
    total_score: number;
    max_score: number;
    percentage: number;
    grade: string;
    submitted_at: string | null;
    reviewed_at: string | null;
    user: AssessmentUser;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string | null;
    url: string | null;
    publisher: string | null;
    frequency: string;
    frequency_label: string;
    first_published_year: number | null;
    editor_in_chief: string | null;
    email: string | null;
    // SINTA
    sinta_rank: string | null;
    sinta_rank_label: string;
    // Accreditation
    accreditation_start_year?: number | null;
    accreditation_end_year?: number | null;
    accreditation_sk_number?: string | null;
    accreditation_sk_date?: string | null;
    // Indexations
    indexations?: Record<string, { indexed_at: string }> | null;
    indexation_labels?: string[];
    // OAI-PMH
    oai_urls?: string[] | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    university: University;
    user: JournalUser;
    scientific_field: ScientificField | null;
    assessments: Assessment[];
}

interface Props {
    journal: Journal;
    articles: PaginatedData<Article>;
    lastHarvestLog: OaiHarvestingLog | null;
    isHarvestPending: boolean;
}

export default function JournalShow({ journal, articles, lastHarvestLog, isHarvestPending }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [harvesting, setHarvesting] = useState(false);
    const [forceSyncing, setForceSyncing] = useState(false);

    const handleHarvest = () => {
        router.post(
            route('admin.journals.harvest', journal.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setHarvesting(true),
                onFinish: () => setHarvesting(false),
            },
        );
    };

    const handleForceSync = () => {
        router.post(
            route('admin.journals.harvest', journal.id),
            { force: true },
            {
                preserveScroll: true,
                onStart: () => setForceSyncing(true),
                onFinish: () => setForceSyncing(false),
            },
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journals', href: route('admin.journals.index') },
        { title: journal.title, href: route('admin.journals.show', journal.id) },
    ];

    const getStatusBadge = (assessment: Assessment) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
            gray: 'secondary',
            yellow: 'default',
            green: 'outline',
        };

        return <Badge variant={variants[assessment.status_color] || 'default'}>{assessment.status_label}</Badge>;
    };

    const getGradeBadge = (percentage: number) => {
        if (percentage >= 90) return <Badge className="bg-green-500 text-white">A</Badge>;
        if (percentage >= 80) return <Badge className="bg-blue-500 text-white">B</Badge>;
        if (percentage >= 70) return <Badge className="bg-yellow-500 text-white">C</Badge>;
        if (percentage >= 60) return <Badge className="bg-orange-500 text-white">D</Badge>;
        return <Badge variant="destructive">E</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Journal - ${journal.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                        {flash.error}
                    </div>
                )}

                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <Link href={route('admin.journals.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* Journal Icon */}
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-blue-100 sm:h-20 sm:w-20 dark:bg-blue-900/20">
                                    <BookOpen className="h-8 w-8 text-blue-600 sm:h-10 sm:w-10 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{journal.title}</h1>
                                    <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-2">
                                        {journal.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Inactive</Badge>
                                        )}
                                        <SintaBadge rank={journal.sinta_rank} />
                                        {journal.accreditation_sk_number && (
                                            <AccreditationBadge
                                                sk_number={journal.accreditation_sk_number}
                                                start_year={journal.accreditation_start_year}
                                                end_year={journal.accreditation_end_year}
                                                sinta_rank_label={journal.sinta_rank_label}
                                            />
                                        )}
                                        {journal.indexation_labels &&
                                            journal.indexation_labels.slice(0, 3).map((label) => <IndexationBadge key={label} platform={label} />)}
                                        {journal.indexation_labels && journal.indexation_labels.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{journal.indexation_labels.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="info" className="w-full">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <TabsList className="grid w-full max-w-md grid-cols-2 rounded-lg bg-sidebar-border/30 p-1 dark:bg-sidebar-border/50">
                                <TabsTrigger value="info" className="rounded-md">
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="articles" className="rounded-md">
                                    Artikel
                                    {articles && articles.total > 0 && (
                                        <Badge variant="secondary" className="ml-2 bg-sidebar-border/50 text-xs">
                                            {articles.total}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="info" className="mt-0">
                            {/* Info Grid */}
                            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Journal Details */}
                                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                    <h3 className="mb-4 text-lg font-semibold text-foreground">Journal Details</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Bookmark className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">ISSN</p>
                                                <p className="font-medium text-foreground">{journal.issn}</p>
                                            </div>
                                        </div>
                                        {journal.e_issn && (
                                            <div className="flex items-center gap-3">
                                                <Bookmark className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">E-ISSN</p>
                                                    <p className="font-medium text-foreground">{journal.e_issn}</p>
                                                </div>
                                            </div>
                                        )}
                                        {journal.url && (
                                            <div className="flex items-center gap-3">
                                                <Globe className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Website</p>
                                                    <a
                                                        href={journal.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        Visit Journal
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {journal.publisher && (
                                            <div className="flex items-center gap-3">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Publisher</p>
                                                    <p className="font-medium text-foreground">{journal.publisher}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Frequency</p>
                                                <p className="font-medium text-foreground">{journal.frequency_label}</p>
                                            </div>
                                        </div>
                                        {journal.first_published_year && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">First Published</p>
                                                    <p className="font-medium text-foreground">{journal.first_published_year}</p>
                                                </div>
                                            </div>
                                        )}
                                        {journal.scientific_field && (
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Scientific Field</p>
                                                    <p className="font-medium text-foreground">{journal.scientific_field.name}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* University & Manager */}
                                <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                                    <h3 className="mb-4 text-lg font-semibold text-foreground">University & Manager</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">University</p>
                                                <p className="font-semibold text-foreground">{journal.university.name}</p>
                                                <p className="text-sm text-muted-foreground">{journal.university.code}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Journal Manager</p>
                                                <p className="font-medium text-foreground">{journal.user.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Email</p>
                                                <a
                                                    href={`mailto:${journal.user.email}`}
                                                    className="font-medium break-all text-blue-600 hover:underline dark:text-blue-400"
                                                >
                                                    {journal.user.email}
                                                </a>
                                            </div>
                                        </div>
                                        {journal.editor_in_chief && (
                                            <div className="flex items-center gap-3">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Editor in Chief</p>
                                                    <p className="font-medium text-foreground">{journal.editor_in_chief}</p>
                                                </div>
                                            </div>
                                        )}
                                        {journal.email && (
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Contact Email</p>
                                                    <a
                                                        href={`mailto:${journal.email}`}
                                                        className="font-medium break-all text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        {journal.email}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        <div className="border-t border-sidebar-border/70 pt-4 dark:border-sidebar-border">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Created</p>
                                                    <p className="text-sm text-foreground">{journal.created_at}</p>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Updated</p>
                                                    <p className="text-sm text-foreground">{journal.updated_at}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="articles" className="mt-0 space-y-6">
                            <Card className="overflow-hidden border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                                <div className="flex flex-col gap-4 border-b border-sidebar-border/70 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border">
                                    <div className="flex items-center gap-2">
                                        <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                        <h3 className="text-lg font-semibold text-foreground">Artikel OAI-PMH</h3>
                                        <Badge variant="secondary" className="ml-1">
                                            {articles?.data?.length || 0} artikel
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        {isHarvestPending && (
                                            <span className="flex w-full items-center gap-1.5 text-sm text-amber-600 sm:w-auto dark:text-amber-400">
                                                <Clock className="h-4 w-4 animate-pulse" />
                                                Dalam antrian...
                                            </span>
                                        )}
                                        <Button
                                            onClick={handleHarvest}
                                            disabled={harvesting || isHarvestPending || !journal.oai_urls || journal.oai_urls.length === 0}
                                            size="sm"
                                            className="gap-2"
                                            title={
                                                !journal.oai_urls || journal.oai_urls.length === 0
                                                    ? 'Jurnal belum memiliki OAI-PMH URL'
                                                    : 'Sync artikel dari OAI-PMH endpoint'
                                            }
                                        >
                                            <RefreshCw className={`h-4 w-4 ${harvesting ? 'animate-spin' : ''}`} />
                                            {harvesting ? 'Mengirim...' : isHarvestPending ? 'Antrian Aktif' : 'Sync Artikel'}
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    disabled={forceSyncing || !journal.oai_urls || journal.oai_urls.length === 0}
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    title="Hapus semua artikel lama lalu import ulang dari awal"
                                                >
                                                    <Trash2 className={`h-4 w-4 ${forceSyncing ? 'animate-spin' : ''}`} />
                                                    {forceSyncing ? 'Memproses...' : 'Force Sync'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Konfirmasi Force Sync</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tindakan ini akan <strong>menghapus semua artikel yang sudah tersimpan</strong> untuk jurnal
                                                        ini, kemudian mengimport ulang seluruh data dari OAI-PMH endpoint dari awal.
                                                        <br />
                                                        <br />
                                                        Gunakan opsi ini jika terdapat <strong>data duplikat</strong> atau artikel tidak ter-update
                                                        dengan benar setelah sync biasa. Proses tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleForceSync}
                                                        className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                                                    >
                                                        Ya, Hapus &amp; Import Ulang
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    {/* OAI-PMH URLs */}
                                    {journal.oai_urls && journal.oai_urls.length > 0 ? (
                                        <div className="mb-4 flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm">
                                            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                            <div>
                                                <span className="text-muted-foreground">OAI-PMH Endpoints: </span>
                                                <ul className="mt-1 flex flex-col gap-1">
                                                    {journal.oai_urls.map((oai, idx) => (
                                                        <li key={idx}>
                                                            <a
                                                                href={oai}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="font-mono break-all text-blue-600 hover:underline dark:text-blue-400"
                                                            >
                                                                {oai}
                                                                <ExternalLink className="ml-1 inline h-3 w-3" />
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            <span>OAI-PMH URL belum dikonfigurasi.</span>
                                        </div>
                                    )}

                                    {/* Last harvest log */}
                                    {lastHarvestLog ? (
                                        <div className="space-y-3">
                                            <p className="text-sm font-medium text-foreground">Riwayat Harvest Terakhir</p>
                                            <div className="flex flex-wrap items-center gap-4 rounded-md border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                                                {/* Status */}
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    {lastHarvestLog.status === 'success' && (
                                                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    )}
                                                    {lastHarvestLog.status === 'partial' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                                                    {lastHarvestLog.status === 'failed' && <XCircle className="h-4 w-4 text-red-500" />}
                                                    <Badge
                                                        variant={
                                                            lastHarvestLog.status === 'success'
                                                                ? 'outline'
                                                                : lastHarvestLog.status === 'partial'
                                                                  ? 'default'
                                                                  : 'destructive'
                                                        }
                                                        className={
                                                            lastHarvestLog.status === 'success'
                                                                ? 'border-green-300 text-green-700 dark:text-green-400'
                                                                : ''
                                                        }
                                                    >
                                                        {lastHarvestLog.status === 'success'
                                                            ? 'Berhasil'
                                                            : lastHarvestLog.status === 'partial'
                                                              ? 'Sebagian'
                                                              : 'Gagal'}
                                                    </Badge>
                                                </div>

                                                {/* Stats */}
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span>
                                                        Ditemukan: <span className="font-medium text-foreground">{lastHarvestLog.records_found}</span>
                                                    </span>
                                                    <span>
                                                        Diunggah:{' '}
                                                        <span className="font-medium text-foreground">{lastHarvestLog.records_imported}</span>
                                                    </span>
                                                </div>

                                                {/* Timestamp */}
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {new Date(lastHarvestLog.harvested_at).toLocaleString('id-ID', {
                                                        dateStyle: 'medium',
                                                        timeStyle: 'short',
                                                    })}
                                                </div>
                                            </div>

                                            {/* Error message */}
                                            {lastHarvestLog.status === 'failed' && lastHarvestLog.error_message && (
                                                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                    <span className="font-medium">Error:</span> {lastHarvestLog.error_message}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Belum pernah di-harvest. Klik <strong>Sync Artikel</strong> untuk memulai.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Articles Table */}
                            {articles && articles.data.length > 0 ? (
                                <div className="mt-8 space-y-4">
                                    <h4 className="text-md font-semibold text-foreground">Daftar Artikel (Total: {articles.total})</h4>
                                    <div className="overflow-x-auto rounded-md border border-sidebar-border/70 dark:border-sidebar-border">
                                        <table className="w-full text-left text-sm text-muted-foreground">
                                            <thead className="bg-muted/50 text-xs text-foreground uppercase">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Judul</th>
                                                    <th className="px-4 py-3 font-medium">Penulis</th>
                                                    <th className="cursor-pointer px-4 py-3 font-medium">Tanggal Publish</th>
                                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {articles.data.map((article) => (
                                                    <tr
                                                        key={article.id}
                                                        className="border-b border-sidebar-border/70 last:border-0 hover:bg-muted/30 dark:border-sidebar-border"
                                                    >
                                                        <td className="px-4 py-3">
                                                            <p className="line-clamp-2 font-medium text-foreground" title={article.title}>
                                                                {article.title}
                                                            </p>
                                                            {article.doi && (
                                                                <a
                                                                    href={`https://doi.org/${article.doi}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                                                                >
                                                                    DOI: {article.doi}
                                                                </a>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p
                                                                className="line-clamp-2 text-sm"
                                                                title={Array.isArray(article.authors) ? article.authors.join(', ') : article.authors}
                                                            >
                                                                {Array.isArray(article.authors) ? article.authors.join(', ') : article.authors}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm whitespace-nowrap">{article.publication_date || '-'}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            {article.url && (
                                                                <a
                                                                    href={article.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                                                                    title="Buka Artikel"
                                                                >
                                                                    Buka <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {articles.last_page > 1 && (
                                        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                                            <div className="text-sm text-muted-foreground">
                                                Showing <span className="font-medium">{articles.from || 0}</span> to{' '}
                                                <span className="font-medium">{articles.to || 0}</span> of{' '}
                                                <span className="font-medium">{articles.total}</span> results
                                            </div>
                                            <div className="flex flex-wrap items-center justify-center gap-2">
                                                {articles.links.map((link, index) => {
                                                    const isPrev = link.label.includes('Previous');
                                                    const isNext = link.label.includes('Next');

                                                    if (isPrev) {
                                                        return (
                                                            <Button
                                                                key={index}
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={!link.url}
                                                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                            >
                                                                &laquo; Previous
                                                            </Button>
                                                        );
                                                    }
                                                    if (isNext) {
                                                        return (
                                                            <Button
                                                                key={index}
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={!link.url}
                                                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                            >
                                                                Next &raquo;
                                                            </Button>
                                                        );
                                                    }

                                                    if (link.label === '...') {
                                                        return (
                                                            <span key={index} className="px-2 text-muted-foreground">
                                                                ...
                                                            </span>
                                                        );
                                                    }

                                                    return (
                                                        <Button
                                                            key={index}
                                                            variant={link.active ? 'default' : 'outline'}
                                                            size="sm"
                                                            className={link.active ? 'pointer-events-none' : ''}
                                                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-8 rounded-md border border-dashed border-sidebar-border/70 bg-muted/20 p-8 text-center dark:border-sidebar-border">
                                    <BookOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                                    <h4 className="text-md font-medium text-foreground">Belum ada artikel</h4>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Klik tombol "Sync Artikel" di atas untuk memulai mengambil data artikel dari OAI-PMH endpoint.
                                    </p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Assessments Table - Hidden for launch */}
                    {/* <div className="overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 p-6 dark:border-sidebar-border">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                                <TrendingUp className="h-5 w-5" />
                                Assessment History
                            </h3>
                        </div>
                        <div className="w-full overflow-x-auto">
                            <Table className="w-full min-w-[800px] whitespace-nowrap sm:whitespace-normal">
                                <TableHeader>
                                    <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Period</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Assessor</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journal.assessments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                                            No assessments available yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journal.assessments.map((assessment) => (
                                        <TableRow key={assessment.id}>
                                            <TableCell>{assessment.assessment_date}</TableCell>
                                            <TableCell>{assessment.period || '-'}</TableCell>
                                            <TableCell>{getStatusBadge(assessment)}</TableCell>
                                            <TableCell>
                                                {Number(assessment.total_score).toFixed(1)} / {Number(assessment.max_score).toFixed(1)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{Number(assessment.percentage).toFixed(1)}%</span>
                                                    {getGradeBadge(Number(assessment.percentage))}
                                                </div>
                                            </TableCell>
                                            <TableCell>{assessment.user.name}</TableCell>
                                            <TableCell>{assessment.submitted_at || '-'}</TableCell>
                                            <TableCell className="text-center">
                                                <Link href={route('user.assessments.show', assessment.id)}>
                                                    <Button variant="ghost" size="sm" title="View Details">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div> */}
                </div>
            </div>
        </AppLayout>
    );
}
