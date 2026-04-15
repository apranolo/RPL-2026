import AssessmentNotesTimeline from '@/components/AssessmentNotesTimeline';
import StatusTimeline, { type TimelineStep } from '@/components/StatusTimeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, JournalAssessment, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, UserCheck, UserPlus, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Dikti Assessment Show Page
 *
 * @description View assessment details and assign reviewer
 * @route GET /dikti/assessments/{assessment}
 * @features View full assessment, Assign reviewer, View timeline
 */

interface Props {
    assessment: JournalAssessment;
    availableReviewers: User[];
}

export default function DiktiAssessmentShow({ assessment, availableReviewers }: Props) {
    const [selectedReviewerId, setSelectedReviewerId] = useState<string>(assessment.reviewer_id?.toString() || '');
    const [assignmentNotes, setAssignmentNotes] = useState('');
    const [removalReason, setRemovalReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reviewer Assignment', href: route('dikti.assessments.index') },
        { title: assessment.journal.title, href: route('dikti.assessments.show', assessment.id) },
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
            status: assessment.admin_kampus_approved_at ? 'completed' : 'pending',
            timestamp: assessment.admin_kampus_approved_at || undefined,
            note: assessment.admin_kampus_approval_notes || undefined,
        },
        {
            label: 'Reviewer Assigned',
            status: assessment.reviewer_id ? 'completed' : 'active',
            timestamp: assessment.assigned_at || undefined,
            note: assessment.reviewer ? `Reviewer: ${assessment.reviewer.name}` : undefined,
        },
        {
            label: 'In Review',
            status: assessment.status === 'in_review' ? 'active' : 'pending',
        },
        {
            label: 'Review Completed',
            status: assessment.status === 'reviewed' ? 'completed' : 'pending',
            timestamp: assessment.reviewed_at || undefined,
        },
    ];

    const handleAssignReviewer = () => {
        if (!selectedReviewerId) {
            toast.error('Please select a reviewer');
            return;
        }

        if (!confirm('Are you sure you want to assign this reviewer?')) {
            return;
        }

        setIsProcessing(true);
        router.post(
            route('dikti.assessments.assign-reviewer', assessment.id),
            {
                reviewer_id: selectedReviewerId,
                assignment_notes: assignmentNotes,
            },
            {
                onSuccess: () => {
                    toast.success('Reviewer assigned successfully');
                    setAssignmentNotes('');
                },
                onError: (errors) => {
                    toast.error(errors.reviewer_id || 'Failed to assign reviewer');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    const handleRemoveReviewer = () => {
        if (!confirm('Are you sure you want to remove the current reviewer?')) {
            return;
        }

        setIsProcessing(true);
        router.post(
            route('dikti.assessments.remove-reviewer', assessment.id),
            { removal_reason: removalReason },
            {
                onSuccess: () => {
                    toast.success('Reviewer removed successfully');
                    setSelectedReviewerId('');
                    setRemovalReason('');
                },
                onError: () => {
                    toast.error('Failed to remove reviewer');
                },
                onFinish: () => setIsProcessing(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Assign Reviewer - ${assessment.journal.title}`} />

            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Reviewer Assignment</h1>
                            <p className="text-muted-foreground">Assign reviewer to this assessment</p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={route('dikti.assessments.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Link>
                        </Button>
                    </div>

                    {/* Assessment Summary */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-2xl">{assessment.journal.title}</CardTitle>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Badge variant="outline">ISSN: {assessment.journal.issn}</Badge>
                                        <Badge variant="outline">{assessment.journal.university?.name}</Badge>
                                        {assessment.journal.scientific_field && (
                                            <Badge variant="secondary">{assessment.journal.scientific_field.name}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label className="text-sm text-muted-foreground">Pengelola Jurnal</Label>
                                    <p className="font-medium">{assessment.user.name}</p>
                                    <p className="text-sm text-muted-foreground">{assessment.user.email}</p>
                                </div>
                                <div>
                                    <Label className="text-sm text-muted-foreground">Assessment Date</Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>{new Date(assessment.assessment_date).toLocaleDateString('id-ID')}</span>
                                    </div>
                                </div>
                            </div>

                            {assessment.admin_kampus_approval_notes && (
                                <div className="rounded-lg bg-muted p-3">
                                    <Label className="text-sm font-semibold">Admin Kampus Notes</Label>
                                    <p className="mt-1 text-sm">{assessment.admin_kampus_approval_notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Reviewer Assignment Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Assign Reviewer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {assessment.reviewer ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            <div className="flex-1">
                                                <p className="font-semibold text-green-900 dark:text-green-100">Reviewer Assigned</p>
                                                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                                                    {assessment.reviewer.name} ({assessment.reviewer.email})
                                                </p>
                                                {assessment.assigned_at && (
                                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                                        Assigned on {new Date(assessment.assigned_at).toLocaleString('id-ID')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="removal-reason">Removal Reason (optional)</Label>
                                        <Textarea
                                            id="removal-reason"
                                            value={removalReason}
                                            onChange={(e) => setRemovalReason(e.target.value)}
                                            placeholder="Enter reason for removing reviewer..."
                                            rows={3}
                                        />
                                    </div>

                                    <Button variant="destructive" onClick={handleRemoveReviewer} disabled={isProcessing}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Remove Reviewer
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reviewer">Select Reviewer *</Label>
                                        <Select value={selectedReviewerId} onValueChange={setSelectedReviewerId}>
                                            <SelectTrigger id="reviewer">
                                                <SelectValue placeholder="Choose a reviewer..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableReviewers.map((reviewer) => (
                                                    <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span>{reviewer.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {reviewer.scientific_field?.name || 'No field specified'}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="assignment-notes">Assignment Notes (optional)</Label>
                                        <Textarea
                                            id="assignment-notes"
                                            value={assignmentNotes}
                                            onChange={(e) => setAssignmentNotes(e.target.value)}
                                            placeholder="Add notes about this assignment..."
                                            rows={3}
                                        />
                                    </div>

                                    <Button onClick={handleAssignReviewer} disabled={!selectedReviewerId || isProcessing}>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Assign Reviewer
                                    </Button>
                                </div>
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
