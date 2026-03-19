/**
 * Journal Show/Detail Page - Admin Kampus
 *
 * @description Display journal details, OAI-PMH harvest controls, and all assessments (read-only)
 * @features View journal info, trigger OAI harvest via queue, list assessments
 * @route GET /admin-kampus/journals/{id}
 */
import { AccreditationBadge, IndexationBadge, SintaBadge } from '@/components/badges';
import { JournalCoverUpload } from '@/components/JournalCoverUpload';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type OaiHarvestingLog } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Bookmark,
    BookOpen,
    Building2,
    Calendar,
    Camera,
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
    oai_pmh_url?: string | null;
    // Cover
    cover_image?: string | null;
    cover_image_url?: string | null;
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
    articlesCount: number;
    lastHarvestLog: OaiHarvestingLog | null;
    isHarvestPending: boolean;
}

export default function JournalShow({ journal, articlesCount, lastHarvestLog, isHarvestPending }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [harvesting, setHarvesting] = useState(false);
    const [forceSyncing, setForceSyncing] = useState(false);
    const [showCoverForm, setShowCoverForm] = useState(false);
    const coverForm = useForm({ cover_image: null as File | null });

    const handleCoverSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        coverForm.transform((data) => ({ ...data, _method: 'PATCH' }));
        coverForm.post(route('admin-kampus.journals.upload-cover', journal.id), {
            forceFormData: true,
            onSuccess: () => setShowCoverForm(false),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journals', href: route('admin-kampus.journals.index') },
        { title: journal.title, href: route('admin-kampus.journals.show', journal.id) },
    ];

    const handleHarvest = () => {
        setHarvesting(true);
        router.post(
            route('admin-kampus.journals.harvest', journal.id),
            {},
            {
                onFinish: () => setHarvesting(false),
            },
        );
    };

    const handleForceSync = () => {
        setForceSyncing(true);
        router.post(
            route('admin-kampus.journals.harvest', journal.id),
            { force: 1 },
            {
                onFinish: () => setForceSyncing(false),
            },
        );
    };

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

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
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
                        <Link href={route('admin-kampus.journals.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* Journal Cover / Icon */}
                                <div
                                    className="group relative flex w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-100 shadow-sm sm:w-28 dark:bg-blue-900/20"
                                    style={{ aspectRatio: '2/3' }}
                                >
                                    {journal.cover_image || journal.cover_image_url ? (
                                        <img
                                            src={journal.cover_image ?? journal.cover_image_url ?? ''}
                                            alt="Cover"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowCoverForm((prev) => !prev)}
                                        className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                        title="Ganti cover"
                                        aria-label="Ganti cover jurnal"
                                    >
                                        <Camera className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-foreground">{journal.title}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
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

                    {/* Cover Upload Form (inline, shown on hover click) */}
                    {showCoverForm && (
                        <form
                            onSubmit={handleCoverSubmit}
                            className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Ganti Cover Jurnal</h4>
                                <button
                                    type="button"
                                    onClick={() => setShowCoverForm(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    aria-label="Tutup formulir unggah cover"
                                >
                                    <XCircle className="h-5 w-5" />
                                </button>
                            </div>
                            <JournalCoverUpload
                                currentCover={journal.cover_image ?? journal.cover_image_url}
                                onChange={(file) => coverForm.setData('cover_image', file)}
                                error={coverForm.errors.cover_image}
                            />
                            <div className="mt-3 flex justify-end gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setShowCoverForm(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" size="sm" disabled={coverForm.processing || !coverForm.data.cover_image}>
                                    {coverForm.processing ? 'Menyimpan...' : 'Simpan Cover'}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* Info Grid */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Journal Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Journal Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                            </CardContent>
                        </Card>

                        {/* Manager & Contact */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Manager & Contact</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
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
                                                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
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
                            </CardContent>
                        </Card>
                    </div>

                    {/* OAI-PMH Harvest Section */}
                    <Card className="mb-8 overflow-hidden border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                        <div className="flex flex-col gap-4 border-b border-sidebar-border/70 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border">
                            <div className="flex items-center gap-2">
                                <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                <h3 className="text-lg font-semibold text-foreground">Artikel OAI-PMH</h3>
                                <Badge variant="secondary" className="ml-1">
                                    {articlesCount} artikel
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
                                    disabled={harvesting || isHarvestPending || !journal.oai_pmh_url}
                                    size="sm"
                                    className="gap-2"
                                    title={
                                        !journal.oai_pmh_url
                                            ? 'Tambahkan OAI-PMH URL di form edit jurnal terlebih dahulu'
                                            : 'Sync artikel dari OAI-PMH endpoint'
                                    }
                                >
                                    <RefreshCw className={`h-4 w-4 ${harvesting ? 'animate-spin' : ''}`} />
                                    {harvesting ? 'Mengirim...' : isHarvestPending ? 'Antrian Aktif' : 'Sync Artikel'}
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            disabled={forceSyncing || !journal.oai_pmh_url}
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
                                                Tindakan ini akan <strong>menghapus semua artikel yang sudah tersimpan</strong> untuk jurnal ini,
                                                kemudian mengimport ulang seluruh data dari OAI-PMH endpoint dari awal.
                                                <br />
                                                <br />
                                                Gunakan opsi ini jika terdapat <strong>data duplikat</strong> atau artikel tidak ter-update dengan
                                                benar setelah sync biasa. Proses tidak dapat dibatalkan.
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
                            {/* OAI-PMH URL */}
                            {journal.oai_pmh_url ? (
                                <div className="mb-4 flex items-start gap-2 rounded-md bg-muted/50 p-3 text-sm">
                                    <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <div>
                                        <span className="text-muted-foreground">OAI-PMH Endpoint: </span>
                                        <a
                                            href={journal.oai_pmh_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono break-all text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            {journal.oai_pmh_url}
                                            <ExternalLink className="ml-1 inline h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span>
                                        OAI-PMH URL belum dikonfigurasi. Tambahkan melalui{' '}
                                        <Link href={route('admin-kampus.journals.edit', journal.id)} className="font-medium underline">
                                            form edit jurnal
                                        </Link>
                                        .
                                    </span>
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
                                                    lastHarvestLog.status === 'success' ? 'border-green-300 text-green-700 dark:text-green-400' : ''
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
                                                Diimpor: <span className="font-medium text-foreground">{lastHarvestLog.records_imported}</span>
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

                    {/* Assessments Table - Hidden for launch */}
                    {/* <Card className="overflow-hidden border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                        <CardHeader className="border-b border-sidebar-border/70 p-6 dark:border-sidebar-border">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5" />
                                Assessment History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
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
                            </div>
                        </CardContent>
                    </Card> */}
                </div>
            </div>
        </AppLayout>
    );
}
