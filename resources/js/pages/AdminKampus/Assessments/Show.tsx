import AssessmentNotesTimeline from '@/components/AssessmentNotesTimeline';
import JournalMetadataManager from '@/components/JournalMetadataManager';
import StatusTimeline, { type TimelineStep } from '@/components/StatusTimeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, JournalAssessment } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, ClipboardCheck, FileText, User } from 'lucide-react';

/**
 * Assessment Detail Page (Admin Kampus)
 *
 * @description View detailed assessment information
 * @route GET /admin-kampus/assessments/{assessment}
 * @features View assessment details, responses, attachments
 */

interface Props {
    assessment: JournalAssessment;
}

export default function AssessmentShow({ assessment }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessments', href: route('admin-kampus.assessments.index') },
        { title: 'Detail', href: route('admin-kampus.assessments.show', assessment.id) },
    ];

    // Build timeline steps
    const timelineSteps: TimelineStep[] = [
        {
            label: 'Submitted by User',
            status: assessment.submitted_at ? 'completed' : 'pending',
            timestamp: assessment.submitted_at || undefined,
        },
        {
            label: 'Approved by Admin Kampus',
            status: assessment.admin_kampus_approved_at ? 'completed' : assessment.status === 'submitted' ? 'active' : 'pending',
            timestamp: assessment.admin_kampus_approved_at || undefined,
            note: assessment.admin_kampus_approval_notes || undefined,
        },
        {
            label: 'Reviewer Assigned',
            status: assessment.reviewer_id ? 'completed' : 'pending',
            timestamp: assessment.assigned_at || undefined,
            note: assessment.reviewer ? `Reviewer: ${assessment.reviewer.name}` : undefined,
        },
        {
            label: 'In Review',
            status: assessment.status === 'in_review' ? 'active' : assessment.status === 'reviewed' ? 'completed' : 'pending',
        },
        {
            label: 'Review Completed',
            status: assessment.status === 'reviewed' ? 'completed' : 'pending',
            timestamp: assessment.reviewed_at || undefined,
        },
    ];

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            draft: 'secondary',
            submitted: 'outline',
            reviewed: 'default',
        };

        const labels: Record<string, string> = {
            draft: 'Draft',
            submitted: 'Submitted',
            reviewed: 'Reviewed',
        };

        return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assessment - ${assessment.journal.title}`} />

            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Assessment Detail</h1>
                            <p className="text-muted-foreground">View assessment information and responses</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <Link href={route('admin-kampus.assessments.index')}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to List
                                </Link>
                            </Button>
                            {assessment.status === 'submitted' && (
                                <Button asChild>
                                    <Link href={route('admin-kampus.assessments.review', assessment.id)}>
                                        <ClipboardCheck className="mr-2 h-4 w-4" />
                                        Review Assessment
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Assessment Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>{assessment.journal.title}</CardTitle>
                                    <CardDescription>ISSN: {assessment.journal.issn}</CardDescription>
                                </div>
                                {getStatusBadge(assessment.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        <span className="font-medium">Submitted by:</span> {assessment.user.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        <span className="font-medium">Submitted:</span>{' '}
                                        {new Date(assessment.submitted_at || assessment.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {assessment.reviewed_at && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                <span className="font-medium">Reviewed by:</span> {assessment.reviewer?.name || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm">
                                                <span className="font-medium">Reviewed:</span> {new Date(assessment.reviewed_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {assessment.admin_notes && (
                                <div className="mt-4 rounded-lg bg-muted p-4">
                                    <div className="flex items-start gap-2">
                                        <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Admin Notes:</p>
                                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{assessment.admin_notes}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Kategori yang Diusulkan */}
                    {assessment.kategori_diusulkan && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Kategori yang Diusulkan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="outline" className="px-4 py-2 text-lg">
                                    {assessment.kategori_diusulkan}
                                </Badge>
                            </CardContent>
                        </Card>
                    )}

                    {/* Aggregate Counts */}
                    {(assessment.jumlah_editor !== null || assessment.jumlah_reviewer !== null || assessment.jumlah_author !== null) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Jumlah Total Kontributor</CardTitle>
                                <CardDescription>Total keseluruhan editor, reviewer, dan author di semua terbitan</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                    {assessment.jumlah_editor !== null && (
                                        <div className="rounded-lg border p-4">
                                            <div className="mb-1 text-sm text-muted-foreground">Jumlah Editor</div>
                                            <div className="text-2xl font-bold">{assessment.jumlah_editor}</div>
                                        </div>
                                    )}
                                    {assessment.jumlah_reviewer !== null && (
                                        <div className="rounded-lg border p-4">
                                            <div className="mb-1 text-sm text-muted-foreground">Jumlah Reviewer</div>
                                            <div className="text-2xl font-bold">{assessment.jumlah_reviewer}</div>
                                        </div>
                                    )}
                                    {assessment.jumlah_author !== null && (
                                        <div className="rounded-lg border p-4">
                                            <div className="mb-1 text-sm text-muted-foreground">Jumlah Author</div>
                                            <div className="text-2xl font-bold">{assessment.jumlah_author}</div>
                                        </div>
                                    )}
                                    {assessment.jumlah_institusi_editor !== null && (
                                        <div className="rounded-lg border p-4">
                                            <div className="mb-1 text-sm text-muted-foreground">Institusi Editor</div>
                                            <div className="text-2xl font-bold">{assessment.jumlah_institusi_editor}</div>
                                        </div>
                                    )}
                                    {assessment.jumlah_institusi_reviewer !== null && (
                                        <div className="rounded-lg border p-4">
                                            <div className="mb-1 text-sm text-muted-foreground">Institusi Reviewer</div>
                                            <div className="text-2xl font-bold">{assessment.jumlah_institusi_reviewer}</div>
                                        </div>
                                    )}
                                    {assessment.jumlah_institusi_author !== null && (
                                        <div className="rounded-lg border p-4">
                                            <div className="mb-1 text-sm text-muted-foreground">Institusi Author</div>
                                            <div className="text-2xl font-bold">{assessment.jumlah_institusi_author}</div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Journal Metadata */}
                    {assessment.journalMetadata && assessment.journalMetadata.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Terbitan Jurnal</CardTitle>
                                <CardDescription>Informasi per terbitan (volume, nomor, tahun)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <JournalMetadataManager metadata={assessment.journalMetadata} onChange={() => {}} readOnly={true} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Responses Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Responses</CardTitle>
                            <CardDescription>{assessment.responses?.length || 0} responses submitted</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {assessment.responses && assessment.responses.length > 0 ? (
                                <div className="space-y-4">
                                    {assessment.responses.map((response) => (
                                        <div key={response.id} className="border-l-4 border-primary py-2 pl-4">
                                            <p className="font-medium">
                                                {response.evaluation_indicator?.sub_category?.category?.name} -{' '}
                                                {response.evaluation_indicator?.sub_category?.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{response.evaluation_indicator?.question}</p>
                                            <p className="mt-1 text-sm">
                                                <span className="font-medium">Score:</span> {response.score}
                                            </p>
                                            {response.notes && <p className="mt-1 text-sm text-muted-foreground">{response.notes}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No responses yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assessment Notes Timeline */}
                    {assessment.assessmentNotes && assessment.assessmentNotes.length > 0 && (
                        <AssessmentNotesTimeline notes={assessment.assessmentNotes} title="Assessment History" />
                    )}
                </div>

                {/* Sidebar - Status Timeline */}
                <div className="w-80">
                    <div className="sticky top-6">
                        <StatusTimeline steps={timelineSteps} title="Assessment Progress" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
