import IssueCard from '@/components/IssueCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { AssessmentAttachment, AssessmentResponse, BreadcrumbItem, JournalAssessment } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Assessment Review Page (Admin Kampus)
 *
 * @description Review submitted assessment and approve or request revision
 * @route GET /admin-kampus/assessments/{assessment}/review
 * @features Approve assessment, Request revision with notes, View all responses
 */

interface Props {
    assessment: JournalAssessment;
}

export default function AssessmentReview({ assessment }: Props) {
    const [adminNotes, setAdminNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Validate assessment status on mount
    useEffect(() => {
        if (assessment.status !== 'submitted') {
            toast.error('This assessment is not available for review');
            router.visit(route('admin-kampus.assessments.index'));
        }
    }, [assessment.status]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Assessments', href: route('admin-kampus.assessments.index') },
        { title: 'Review', href: route('admin-kampus.assessments.review', assessment.id) },
    ];

    const handleApprove = () => {
        if (isProcessing) return;

        if (!confirm('Are you sure you want to approve this assessment? This action cannot be undone.')) {
            return;
        }

        setIsProcessing(true);
        router.post(
            route('admin-kampus.assessments.approve', assessment.id),
            { admin_notes: adminNotes },
            {
                onSuccess: () => {
                    toast.success('Assessment approved successfully');
                },
                onError: (errors) => {
                    toast.error(errors.message || 'Failed to approve assessment');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleRequestRevision = () => {
        if (isProcessing) return;

        if (!adminNotes.trim()) {
            toast.error('Please provide notes for revision request');
            return;
        }

        if (!confirm('Are you sure you want to request revision? This will send the assessment back to draft status and notify the user.')) {
            return;
        }

        setIsProcessing(true);
        router.post(
            route('admin-kampus.assessments.request-revision', assessment.id),
            { admin_notes: adminNotes },
            {
                onSuccess: () => {
                    toast.success('Revision requested successfully');
                },
                onError: (errors) => {
                    toast.error(errors.message || 'Failed to request revision');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Review Assessment - ${assessment.journal.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Review Assessment</h1>
                        <p className="text-muted-foreground">Review and approve or request revision for this assessment</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('admin-kampus.assessments.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                </div>

                {/* Journal Info */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle>{assessment.journal.title}</CardTitle>
                                <CardDescription>
                                    ISSN: {assessment.journal.issn} | Submitted by: {assessment.user.name}
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-yellow-500 text-white">
                                Submitted
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <span className="font-medium">University:</span> {assessment.journal.university.name}
                            </div>
                            <div>
                                <span className="font-medium">Scientific Field:</span> {assessment.journal.scientific_field?.name || 'N/A'}
                            </div>
                            <div>
                                <span className="font-medium">Submitted:</span>{' '}
                                {new Date(assessment.submitted_at || assessment.created_at).toLocaleString()}
                            </div>
                            <div>
                                <span className="font-medium">Total Responses:</span> {assessment.responses?.length || 0}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assessment Responses */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assessment Responses</CardTitle>
                        <CardDescription>Review all submitted responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {assessment.responses && assessment.responses.length > 0 ? (
                            <div className="space-y-6">
                                {assessment.responses.map((response: AssessmentResponse, index: number) => {
                                    const category = response.evaluation_indicator?.sub_category?.category?.name || 'Uncategorized';
                                    const subCategory = response.evaluation_indicator?.sub_category?.name || 'N/A';
                                    const question = response.evaluation_indicator?.question || 'No question available';

                                    return (
                                        <div key={response.id} className="border-l-4 border-primary py-3 pl-4">
                                            <div className="mb-2 flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground">
                                                        {category} - {subCategory}
                                                    </p>
                                                    <p className="mt-1 font-medium">
                                                        {index + 1}. {question}
                                                    </p>
                                                </div>
                                                <Badge variant="default">Score: {response.score ?? 0}</Badge>
                                            </div>
                                            {response.notes && (
                                                <div className="mt-2 rounded-md bg-muted p-3">
                                                    <p className="mb-1 text-sm font-medium">Notes:</p>
                                                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{response.notes}</p>
                                                </div>
                                            )}
                                            {response.attachments && response.attachments.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="mb-1 text-sm font-medium">Attachments:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {response.attachments.map((attachment: AssessmentAttachment) => (
                                                            <Badge key={attachment.id} variant="secondary">
                                                                {attachment.file_name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">No responses submitted.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Assessment Issues */}
                {assessment.issues && assessment.issues.length > 0 && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                <CardTitle>Issues Identified</CardTitle>
                            </div>
                            <CardDescription>
                                The user has identified {assessment.issues.length} issue{assessment.issues.length !== 1 ? 's' : ''} during
                                self-assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4">
                                {assessment.issues.map((issue) => (
                                    <IssueCard key={issue.id} issue={issue} readOnly />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Review Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Review Decision</CardTitle>
                        <CardDescription>Approve the assessment or request revision with feedback</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="admin_notes">Admin Notes (Optional for approval, Required for revision)</Label>
                            <Textarea
                                id="admin_notes"
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Provide feedback or notes for the user..."
                                rows={6}
                                maxLength={1000}
                            />
                            <p className="text-sm text-muted-foreground">{adminNotes.length}/1000 characters</p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button size="lg" onClick={handleApprove} disabled={isProcessing} className="flex-1">
                                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                                {isProcessing ? 'Processing...' : 'Approve Assessment'}
                            </Button>
                            <Button
                                size="lg"
                                variant="destructive"
                                onClick={handleRequestRevision}
                                disabled={isProcessing || !adminNotes.trim()}
                                className="flex-1"
                            >
                                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <XCircle className="mr-2 h-5 w-5" />}
                                {isProcessing ? 'Processing...' : 'Request Revision'}
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            <strong>Approve:</strong> Mark as reviewed and complete. <strong>Request Revision:</strong> Send back to draft status with
                            your notes.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
