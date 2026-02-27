/**
 * Journal Show/Detail Page - User
 *
 * @description Display journal details with tabs for info, assessments, and articles
 * @features View journal details, manage assessments, view approval status
 * @route GET /user/journals/{id}
 */
import { AccreditationBadge, IndexationBadge, SintaBadge } from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, BookOpen, CheckCircle, Edit, ExternalLink, FileText, Globe, Mail, Trash2, XCircle } from 'lucide-react';

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
    authors: string;
    published_date: string;
    volume: string | null;
    issue: string | null;
}

interface Journal {
    id: number;
    title: string;
    issn: string;
    e_issn: string | null;
    url: string | null;
    oai_pmh_url: string | null;
    publisher: string | null;
    frequency: string;
    frequency_label: string;
    first_published_year: number | null;
    editor_in_chief: string | null;
    email: string | null;
    phone: string | null;
    about: string | null;
    scope: string | null;
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
    articles: Article[];
}

interface Statistics {
    total_assessments: number;
    latest_score: number | null;
    total_articles: number;
}

interface Props {
    journal: Journal;
    statistics: Statistics;
}

export default function JournalShow({ journal, statistics }: Props) {
    const { flash } = usePage<SharedData>().props;

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

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
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
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <Link href={route('user.journals.index')}>
                                    <Button variant="ghost" className="mb-4 pl-0">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to My Journals
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                    <div>
                                        <CardTitle className="text-2xl">{journal.title}</CardTitle>
                                        <CardDescription className="mt-1">{journal.university.name}</CardDescription>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('user.journals.edit', journal.id)}>
                                    <Button variant="outline" size="sm">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Button>
                                </Link>
                                {journal.approval_status !== 'approved' && (
                                    <Button variant="outline" size="sm" onClick={handleDelete}>
                                        <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList>
                                <TabsTrigger value="details">Details</TabsTrigger>
                                {/* Assessment tab hidden for launch - will be re-enabled post-launch */}
                                {/* <TabsTrigger value="assessments">
                                    Assessments
                                    {statistics.total_assessments > 0 && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs dark:bg-blue-900/30 dark:text-blue-400">{statistics.total_assessments}</span>}
                                </TabsTrigger> */}
                                <TabsTrigger value="articles">
                                    Articles
                                    {statistics.total_articles > 0 && (
                                        <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs dark:bg-blue-900/30 dark:text-blue-400">
                                            {statistics.total_articles}
                                        </span>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            {/* Details Tab */}
                            <TabsContent value="details" className="space-y-6">
                                {/* Basic Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Basic Information</h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        {journal.oai_pmh_url && (
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-muted-foreground">OAI-PMH URL</p>
                                                <p className="font-mono text-sm">{journal.oai_pmh_url}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                {(journal.editor_in_chief || journal.email || journal.phone) && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Contact Information</h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Assessment History</h3>
                                    <Link href={route('user.assessments.create', { journal_id: journal.id })}>
                                        <Button size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Assessment
                                        </Button>
                                    </Link>
                                </div>

                                {journal.assessments.length === 0 ? (
                                    <div className="rounded-lg border-2 border-dashed p-12 text-center dark:border-gray-700">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                                        <h3 className="mt-4 text-lg font-semibold">No Assessments Yet</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">Create your first assessment to evaluate this journal.</p>
                                        <Link href={route('user.assessments.create', { journal_id: journal.id })}>
                                            <Button className="mt-4">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Assessment
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
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
                                )}
                            </TabsContent> */}

                            {/* Articles Tab */}
                            <TabsContent value="articles" className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold">Published Articles</h3>
                                </div>

                                {journal.articles.length === 0 ? (
                                    <div className="rounded-lg border-2 border-dashed p-12 text-center dark:border-gray-700">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                                        <h3 className="mt-4 text-lg font-semibold">No Articles Yet</h3>
                                        <p className="mt-2 text-sm text-muted-foreground">Articles published in this journal will appear here.</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Authors</TableHead>
                                                <TableHead>Published</TableHead>
                                                <TableHead>Volume/Issue</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {journal.articles.map((article) => (
                                                <TableRow key={article.id}>
                                                    <TableCell className="font-medium">{article.title}</TableCell>
                                                    <TableCell>{article.authors}</TableCell>
                                                    <TableCell>{new Date(article.published_date).toLocaleDateString('id-ID')}</TableCell>
                                                    <TableCell>
                                                        {article.volume && article.issue ? `Vol ${article.volume}, No ${article.issue}` : '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
