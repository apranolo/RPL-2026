/**
 * Journal Show/Detail Page - Admin Kampus
 *
 * @description Display journal details and all assessments (read-only)
 * @features View journal info, list assessments, view assessment details, download attachments
 * @route GET /admin-kampus/journals/{id}
 */
import { AccreditationBadge, IndexationBadge, SintaBadge } from '@/components/badges';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Bookmark, BookOpen, Building2, Calendar, ExternalLink, FileText, Globe, Mail, User } from 'lucide-react';

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
}

export default function JournalShow({ journal }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Journals', href: route('admin-kampus.journals.index') },
        { title: journal.title, href: route('admin-kampus.journals.show', journal.id) },
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
                        <Link href={route('admin-kampus.journals.index')}>
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </Link>

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                {/* Journal Icon */}
                                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                                    <BookOpen className="h-10 w-10 text-blue-600 dark:text-blue-400" />
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

                        {/* Manager & Contact */}
                        <div className="rounded-lg border border-sidebar-border/70 bg-card p-6 shadow-sm dark:border-sidebar-border">
                            <h3 className="mb-4 text-lg font-semibold text-foreground">Manager & Contact</h3>
                            <div className="space-y-4">
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
                            </div>
                        </div>
                    </div>

                    {/* Assessments Table - Hidden for launch */}
                    {/* <div className="overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <div className="border-b border-sidebar-border/70 p-6 dark:border-sidebar-border">
                            <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                                <TrendingUp className="h-5 w-5" />
                                Assessment History
                            </h3>
                        </div>
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
                    </div> */}
                </div>
            </div>
        </AppLayout>
    );
}
