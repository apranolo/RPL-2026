/**
 * Journal Show/Detail Page - User
 *
 * @description Display journal details with tabs for info, assessments, and articles
 * @features View journal details, manage assessments, view approval status
 * @route GET /user/journals/{id}
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type OaiHarvestingLog, type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    BookOpen,
    Camera,
    CheckCircle,
    CheckCircle2,
    Clock,
    Database,
    Edit,
    ExternalLink,
    Globe,
    Mail,
    RefreshCw,
    Trash2,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface University {
    id: number;
    name: string;
}

interface ScientificField {
    id: number;
    name: string;
}

interface Assessment {
    id: number;
    assessment_date: string;
    period: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    status_label: string;
    total_score: number | null;
    max_score: number | null;
    percentage: number | null;
    grade: string | null;
    submitted_at: string | null;
}

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

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string | null;
    url: string | null;
    oai_urls: string[] | null;
    publisher: string | null;
    frequency: string;
    frequency_label: string;
    first_published_year: number | null;
    editor_in_chief: string | null;
    email: string | null;
    phone: string | null;
    about: string | null;
    scope: string | null;
    // Cover
    cover_image?: string | null;
    cover_image_url?: string | null;
    sinta_rank: string | null;
    sinta_rank_label: string | null;
    accreditation_start_year: number | null;
    accreditation_end_year: number | null;
    accreditation_sk_number: string | null;
    accreditation_sk_date: string | null;
    indexations: Record<string, { url: string }> | null;
    approval_status: 'pending' | 'approved' | 'rejected';
    approval_status_label: string;
    rejection_reason: string | null;
    approved_at: string | null;
    is_active: boolean;
    created_at: string;
    university: University;
    scientific_field: ScientificField | null;
    assessments: Assessment[];
}

interface Statistics {
    total_assessments: number;
    latest_score: number | null;
    total_articles: number;
}

interface Props {
    journal: Journal;
    articles: PaginatedData<Article>;
    statistics: Statistics;
    lastHarvestLog?: OaiHarvestingLog | null;
    isHarvestPending?: boolean;
}

export default function JournalShow({ journal, articles, statistics, lastHarvestLog, isHarvestPending }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [showCoverForm, setShowCoverForm] = useState(false);
    const coverForm = useForm({ cover_image: null as File | null });
    const [harvesting, setHarvesting] = useState(false);
    const [forceSyncing, setForceSyncing] = useState(false);

    const handleHarvest = () => {
        setHarvesting(true);
        router.post(
            route('user.journals.harvest', journal.id),
            {},
            {
                onFinish: () => setHarvesting(false),
            },
        );
    };

    const handleForceSync = () => {
        setForceSyncing(true);
        router.post(
            route('user.journals.harvest', journal.id),
            { force: 1 },
            {
                onFinish: () => setForceSyncing(false),
            },
        );
    };

    const handleCoverSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        coverForm.transform((data) => ({ ...data, _method: 'PATCH' }));
        coverForm.post(route('user.journals.upload-cover', journal.id), {
            forceFormData: true,
            onSuccess: () => setShowCoverForm(false),
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Jurnal', href: route('user.journals.index') },
        { title: journal.title, href: route('user.journals.show', journal.id) },
    ];

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${journal.title}?`)) {
            router.delete(route('user.journals.destroy', journal.id));
        }
    };

    const getApprovalStatusIcon = () => {
        switch (journal.approval_status) {
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
            default:
                return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
        }
    };

    const getApprovalStatusClass = () => {
        switch (journal.approval_status) {
            case 'approved':
                return 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20';
            case 'rejected':
                return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20';
            default:
                return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20';
        }
    };

    const getStatusBadge = (status: 'draft' | 'submitted' | 'reviewed') => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            submitted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            reviewed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        };
        return <Badge className={colors[status]}>{status === 'draft' ? 'Draft' : status === 'submitted' ? 'Submitted' : 'Reviewed'}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={journal.title} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 sm:p-6 lg:p-8">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                        {flash.error}
                    </div>
                )}

                {/* Approval Status Banner */}
                {journal.approval_status !== 'approved' && (
                    <div className={`flex items-start gap-3 rounded-lg border p-4 ${getApprovalStatusClass()}`}>
                        {getApprovalStatusIcon()}
                        <div className="flex-1">
                            <h4 className="font-semibold">{journal.approval_status_label}</h4>
                            {journal.approval_status === 'pending' && (
                                <p className="mt-1 text-sm">Your journal is awaiting approval from LPPM Admin Kampus.</p>
                            )}
                            {journal.approval_status === 'rejected' && journal.rejection_reason && (
                                <p className="mt-1 text-sm">Reason: {journal.rejection_reason}</p>
                            )}
                        </div>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                                <Link href={route('user.journals.index')}>
                                    <Button variant="ghost" className="mb-4 pl-0">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to My Journals
                                    </Button>
                                </Link>
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    {/* Journal cover thumbnail */}
                                    <div
                                        className="group relative mx-auto flex w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blue-100 shadow-md sm:mx-0 sm:w-24 dark:bg-blue-900/20"
                                        style={{ aspectRatio: '2/3' }}
                                    >
                                        {journal.cover_image || journal.cover_image_url ? (
                                            <img
                                                src={journal.cover_image ?? journal.cover_image_url ?? ''}
                                                alt={journal.title ? `Sampul jurnal "${journal.title}"` : 'Sampul jurnal'}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowCoverForm((prev) => !prev)}
                                            className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                            title="Ganti cover"
                                        >
                                            <Camera className="h-5 w-5 text-white" />
                                            <span className="text-xs font-medium text-white">Ganti Cover</span>
                                        </button>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <CardTitle className="text-xl leading-tight sm:text-2xl">{journal.title}</CardTitle>
                                        <CardDescription className="mt-2 sm:mt-1">{journal.university.name}</CardDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-2 flex w-full flex-row justify-center gap-2 sm:mt-0 sm:w-auto sm:justify-start">
                                <Link href={route('user.journals.edit', journal.id)} className="flex-1 sm:flex-initial">
                                    <Button variant="outline" size="sm" className="w-full">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                {journal.approval_status !== 'approved' && (
                                    <Button variant="outline" size="sm" onClick={handleDelete} className="flex-1 sm:flex-initial">
                                        <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Cover upload form */}
                        {showCoverForm && (
                            <form
                                onSubmit={handleCoverSubmit}
                                className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Ganti Cover Jurnal</h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowCoverForm(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                        aria-label="Tutup formulir ganti cover"
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
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue="details" className="w-full">
                            <div className="w-full overflow-x-auto pb-2">
                                <TabsList className="mt-1 w-full flex-nowrap justify-start sm:w-auto">
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    {/* Assessment tab hidden for launch - will be re-enabled post-launch */}
                                    {/* <TabsTrigger value="assessments">
                                        Assessments
                                        {statistics.total_assessments > 0 && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs dark:bg-blue-900/30 dark:text-blue-400">{statistics.total_assessments}</span>}
                                    </TabsTrigger> */}
                                </TabsList>
                            </div>

                            {/* Details Tab */}
                            <TabsContent value="details" className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">ISSN (Print)</p>
                                            <p className="font-medium">{journal.issn || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">E-ISSN</p>
                                            <p className="font-medium">{journal.e_issn || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Publisher</p>
                                            <p className="font-medium">{journal.publisher || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Frequency</p>
                                            <p className="font-medium">{journal.frequency_label}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">First Published</p>
                                            <p className="font-medium">{journal.first_published_year || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Scientific Field</p>
                                            <p className="font-medium">{journal.scientific_field?.name || '-'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-muted-foreground">Website</p>
                                            {journal.url ? (
                                                <a
                                                    href={journal.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    <Globe className="h-4 w-4" />
                                                    {journal.url}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <p className="font-medium">-</p>
                                            )}
                                        </div>
                                        {journal.oai_urls && journal.oai_urls.length > 0 && (
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-muted-foreground">OAI-PMH URLs</p>
                                                <ul className="list-inside list-disc">
                                                    {journal.oai_urls.map((oai, idx) => (
                                                        <li key={idx}>
                                                            <p className="inline font-mono text-sm">{oai}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                {(journal.editor_in_chief || journal.email || journal.phone) && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Contact Information</h3>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {journal.editor_in_chief && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Editor-in-Chief</p>
                                                    <p className="font-medium">{journal.editor_in_chief}</p>
                                                </div>
                                            )}
                                            {journal.email && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Email</p>
                                                    <a
                                                        href={`mailto:${journal.email}`}
                                                        className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                        {journal.email}
                                                    </a>
                                                </div>
                                            )}
                                            {journal.phone && (
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Phone</p>
                                                    <p className="font-medium">{journal.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* About & Scope */}
                                {(journal.about || journal.scope) && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Description</h3>
                                        {journal.about && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">About</p>
                                                <p className="mt-1 whitespace-pre-line">{journal.about}</p>
                                            </div>
                                        )}
                                        {journal.scope && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Scope & Focus</p>
                                                <p className="mt-1 whitespace-pre-line">{journal.scope}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Rankings & Indexations */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Peringkat & Indeksasi</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="mb-2 text-sm text-muted-foreground">Peringkat Akreditasi</p>
                                            <div className="flex items-center gap-2">
                                                <SintaBadge rank={journal.sinta_rank} />
                                            </div>
                                        </div>

                                        {journal.accreditation_sk_number && (
                                            <div>
                                                <p className="mb-2 text-sm text-muted-foreground">Detail Akreditasi</p>
                                                <AccreditationBadge
                                                    sk_number={journal.accreditation_sk_number}
                                                    start_year={journal.accreditation_start_year}
                                                    end_year={journal.accreditation_end_year}
                                                    sinta_rank_label={journal.sinta_rank_label}
                                                />
                                            </div>
                                        )}

                                        {journal.indexations && Object.keys(journal.indexations).length > 0 && (
                                            <div>
                                                <p className="mb-2 text-sm text-muted-foreground">Terindeks Di</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {Object.entries(journal.indexations).map(([platform, data]) => (
                                                        <IndexationBadge key={platform} platform={platform} url={data.url} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Assessments Tab - Hidden for launch */}
                            {/* <TabsContent value="assessments" className="space-y-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-lg font-semibold">Assessment History</h3>
                                    <Link href={route('user.assessments.create', { journal_id: journal.id })}>
                                        <Button size="sm" className="w-full sm:w-auto">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Assessment
                                        </Button>
                                    </Link>
                                </div>

                                {journal.assessments.length === 0 ? (
                                    <div className="rounded-lg border-2 border-dashed p-8 text-center sm:p-12 dark:border-gray-700">
                                        <h3 className="mt-4 text-lg font-semibold">No Assessments Yet</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">Create your first assessment to evaluate this journal.</p>
                                        <Link href={route('user.assessments.create', { journal_id: journal.id })}>
                                            <Button className="mt-4 w-full sm:w-auto">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Assessment
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:hidden">
                                            {journal.assessments.map((assessment) => (
                                                <Card key={assessment.id} className="overflow-hidden">
                                                    <CardContent className="p-4 space-y-3">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="font-medium">
                                                                    {new Date(assessment.assessment_date).toLocaleDateString('id-ID')}
                                                                </p>
                                                                <p className="text-sm text-gray-500">Period: {assessment.period || '-'}</p>
                                                            </div>
                                                            {getStatusBadge(assessment.status)}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                {assessment.total_score !== null ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-semibold text-lg">
                                                                            {assessment.total_score} <span className="text-sm text-gray-500 font-normal">/ {assessment.max_score}</span>
                                                                        </span>
                                                                        {assessment.grade && <Badge variant="outline">{assessment.grade}</Badge>}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-muted-foreground">Not scored</span>
                                                                )}
                                                            </div>
                                                            <Link href={route('user.assessments.show', assessment.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <TrendingUp className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                        <div className="hidden overflow-x-auto rounded-md border md:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Assessment Date</TableHead>
                                                    <TableHead>Period</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Score</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {journal.assessments.map((assessment) => (
                                                    <TableRow key={assessment.id}>
                                                        <TableCell>{new Date(assessment.assessment_date).toLocaleDateString('id-ID')}</TableCell>
                                                        <TableCell>{assessment.period || '-'}</TableCell>
                                                        <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                                                        <TableCell>
                                                            {assessment.total_score !== null ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-semibold">
                                                                        {assessment.total_score} / {assessment.max_score}
                                                                    </span>
                                                                    {assessment.grade && <Badge variant="outline">{assessment.grade}</Badge>}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-muted-foreground">Not scored</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Link href={route('user.assessments.show', assessment.id)}>
                                                                <Button variant="ghost" size="sm">
                                                                    <TrendingUp className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        </div>
                                    </div>
                                )}
                            </TabsContent> */}
                        </Tabs>
                    </CardContent>
                </Card>

                {/* OAI-PMH Harvest Section */}
                <Card className="mb-0 overflow-hidden border-sidebar-border/70 shadow-sm dark:border-sidebar-border">
                    <div className="flex flex-col gap-4 border-b border-sidebar-border/70 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-sidebar-border">
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <h3 className="text-lg font-semibold text-foreground">Artikel OAI-PMH</h3>
                            <Badge variant="secondary" className="ml-1">
                                {statistics.total_articles} artikel
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
                                            Tindakan ini akan <strong>menghapus semua artikel yang sudah tersimpan</strong> untuk jurnal ini, kemudian
                                            mengimport ulang seluruh data dari OAI-PMH endpoint dari awal.
                                            <br />
                                            <br />
                                            Gunakan opsi ini jika terdapat <strong>data duplikat</strong> atau artikel tidak ter-update dengan benar
                                            setelah sync biasa. Proses tidak dapat dibatalkan.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleForceSync}
                                            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                                        >
                                            Ya, Hapus & Import Ulang
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
                                <span>
                                    OAI-PMH URL belum dikonfigurasi. Tambahkan melalui{' '}
                                    <Link href={route('user.journals.edit', journal.id)} className="font-medium underline">
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
                                            Ditemukan: <span className="font-medium text-foreground">{lastHarvestLog.records_found ?? 0}</span>
                                        </span>
                                        <span>
                                            Diimpor: <span className="font-medium text-foreground">{lastHarvestLog.records_imported ?? 0}</span>
                                        </span>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date(lastHarvestLog.harvested_at).toLocaleString('id-ID', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short',
                                            timeZone: 'Asia/Jakarta',
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
                                Belum pernah di-harvest. Klik <strong>Sync Artikel</strong> untuk memulai sinkronisasi OAI.
                            </p>
                        )}
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
