/**
 * AdminKampus PembinaanShow Component
 *
 * @description
 * Detail view for a Pembinaan registration with approval/rejection actions
 * and reviewer assignment functionality.
 *
 * @route GET /admin-kampus/pembinaan/registrations/{id}
 *
 * @features
 * - Display registration details with journal info
 * - Show all uploaded attachments with download
 * - Approve/reject registration with notes
 * - Assign reviewers from university
 * - View existing reviews
 * - Manage reviewer assignments
 *
 * @author JurnalMU Team
 */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PembinaanRegistration } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Award, CalendarDays, Check, Download, FileText, Star, Trash2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Props {
    registration: PembinaanRegistration;
    category: 'akreditasi' | 'indeksasi';
}

export default function PembinaanShow({ registration, category }: Props) {
    const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Pembinaan',
            href: '#',
        },
        {
            title: categoryLabel,
            href: route(`admin-kampus.pembinaan.${category}`),
        },
        {
            title: registration.journal?.title || 'Registration',
            href: route('admin-kampus.pembinaan.registrations.show', registration.id),
        },
    ];

    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    // DEPRECATED: Assign reviewer functionality is now only available to Super Admin
    // const [showAssignDialog, setShowAssignDialog] = useState(false);
    // const [selectedReviewer, setSelectedReviewer] = useState('');
    // const [reviewers, setReviewers] = useState<User[]>([]);
    // const [loadingReviewers, setLoadingReviewers] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = () => {
        router.post(
            route('admin-kampus.pembinaan.registrations.approve', registration.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Registration approved successfully');
                    setShowApproveDialog(false);
                },
                onError: () => {
                    toast.error('Failed to approve registration');
                },
            },
        );
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        router.post(
            route('admin-kampus.pembinaan.registrations.reject', registration.id),
            { rejection_reason: rejectionReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Registration rejected');
                    setShowRejectDialog(false);
                    setRejectionReason('');
                },
                onError: () => {
                    toast.error('Failed to reject registration');
                },
            },
        );
    };

    // DEPRECATED: Assign reviewer functionality moved to Super Admin only
    // const loadReviewers = () => {
    //     setLoadingReviewers(true);
    //     fetch(route('admin-kampus.pembinaan.reviewers'))
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setReviewers(data);
    //             setLoadingReviewers(false);
    //         })
    //         .catch(() => {
    //             toast.error('Failed to load reviewers');
    //             setLoadingReviewers(false);
    //         });
    // };

    // const handleAssignReviewer = () => {
    //     if (!selectedReviewer) {
    //         toast.error('Please select a reviewer');
    //         return;
    //     }

    //     router.post(
    //         route('admin-kampus.pembinaan.registrations.assign-reviewer', registration.id),
    //         { reviewer_id: selectedReviewer },
    //         {
    //             preserveScroll: true,
    //             onSuccess: () => {
    //                 toast.success('Reviewer assigned successfully');
    //                 setShowAssignDialog(false);
    //                 setSelectedReviewer('');
    //             },
    //             onError: () => {
    //                 toast.error('Failed to assign reviewer');
    //             },
    //         },
    //     );
    // };

    const handleRemoveAssignment = (assignmentId: number) => {
        if (!confirm('Remove this reviewer assignment?')) return;

        router.delete(route('admin-kampus.pembinaan.assignments.remove', assignmentId), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Reviewer assignment removed');
            },
            onError: () => {
                toast.error('Failed to remove assignment');
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'secondary',
            approved: 'default',
            rejected: 'destructive',
            assigned: 'secondary',
            in_progress: 'default',
            completed: 'outline',
        };
        return (
            <Badge variant={variants[status as keyof typeof variants] as any}>
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Badge>
        );
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getScoreColor = (score?: number) => {
        if (!score) return 'text-muted-foreground';
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-blue-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Registration: ${registration.journal?.title}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4 sm:items-center">
                        <Button variant="outline" size="icon" className="shrink-0" asChild>
                            <Link href={route(`admin-kampus.pembinaan.${category}`)}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-2xl font-bold tracking-tight">{registration.journal?.title}</h1>
                                {getStatusBadge(registration.status)}
                            </div>
                            <p className="text-muted-foreground">
                                {registration.pembinaan?.name} • ISSN: {registration.journal?.issn}
                            </p>
                        </div>
                    </div>

                    {registration.status === 'pending' && (
                        <div className="mt-4 flex w-full flex-col gap-2 sm:mt-0 sm:w-auto sm:flex-row">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowRejectDialog(true)}>
                                <X className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button className="w-full sm:w-auto" onClick={() => setShowApproveDialog(true)}>
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                            </Button>
                        </div>
                    )}

                    {/* DEPRECATED: Assign reviewer only available to Super Admin
                    {registration.status === 'approved' && (
                        <Button
                            onClick={() => {
                                setShowAssignDialog(true);
                                loadReviewers();
                            }}
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Reviewer
                        </Button>
                    )}
                    */}
                </div>

                {/* Program & Journal Info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Award className="h-5 w-5" />
                                Program Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm font-medium">Program Name</div>
                                <div className="text-sm text-muted-foreground">{registration.pembinaan?.name}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">Category</div>
                                <div className="text-sm text-muted-foreground capitalize">{registration.pembinaan?.category}</div>
                            </div>
                            {registration.pembinaan?.accreditation_template && (
                                <div>
                                    <div className="text-sm font-medium">Template</div>
                                    <div className="text-sm text-muted-foreground">{registration.pembinaan.accreditation_template.name}</div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-medium">Assessment Period</div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <CalendarDays className="h-3 w-3" />
                                    <span>
                                        {registration.pembinaan?.assessment_start &&
                                            new Date(registration.pembinaan.assessment_start).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}{' '}
                                        -{' '}
                                        {registration.pembinaan?.assessment_end &&
                                            new Date(registration.pembinaan.assessment_end).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-5 w-5" />
                                Journal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <div className="text-sm font-medium">Title</div>
                                <div className="text-sm text-muted-foreground">{registration.journal?.title}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">ISSN / E-ISSN</div>
                                <div className="text-sm text-muted-foreground">
                                    {registration.journal?.issn}
                                    {registration.journal?.e_issn && ` / ${registration.journal.e_issn}`}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">Pengelola</div>
                                <div className="text-sm text-muted-foreground">
                                    {registration.user?.name} ({registration.user?.email})
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">Registered At</div>
                                <div className="text-sm text-muted-foreground">{formatDate(registration.registered_at)}</div>
                            </div>
                            {registration.reviewed_at && (
                                <div>
                                    <div className="text-sm font-medium">Reviewed At</div>
                                    <div className="text-sm text-muted-foreground">
                                        {formatDate(registration.reviewed_at)}
                                        {registration.reviewer && ` by ${registration.reviewer.name}`}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Rejection Reason */}
                {registration.status === 'rejected' && registration.rejection_reason && (
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-base text-destructive">Rejection Reason</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{registration.rejection_reason}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Attachments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Uploaded Documents
                        </CardTitle>
                        <CardDescription>Files submitted by the journal manager</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!registration.attachments || registration.attachments.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                                <FileText className="mx-auto mb-2 h-8 w-8" />
                                <p>No documents uploaded</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {registration.attachments.map((attachment) => (
                                    <div
                                        key={attachment.id}
                                        className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div className="min-w-0 flex-1">
                                                <div className="truncate text-sm font-medium">{attachment.file_name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {attachment.document_type} •{' '}
                                                    {attachment.file_size && (attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                                            <a href={`/storage/${attachment.file_path}`} download target="_blank" rel="noopener noreferrer">
                                                <Download className="mr-2 h-4 w-4 shrink-0" />
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Reviewer Assignments */}
                {registration.reviewer_assignments && registration.reviewer_assignments.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5" />
                                Reviewer Assignments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader className="whitespace-nowrap">
                                        <TableRow>
                                            <TableHead>Reviewer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Assigned At</TableHead>
                                            <TableHead>Assigned By</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registration.reviewer_assignments.map((assignment) => (
                                            <TableRow key={assignment.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="text-sm font-medium">{assignment.reviewer?.name}</div>
                                                        <div className="text-xs text-muted-foreground">{assignment.reviewer?.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                                                <TableCell className="text-sm whitespace-nowrap">{formatDate(assignment.assigned_at)}</TableCell>
                                                <TableCell className="text-sm">{assignment.assigner?.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end">
                                                        {assignment.status !== 'completed' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveAssignment(assignment.id)}
                                                                title="Remove Assignment"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Reviews */}
                {registration.reviews && registration.reviews.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Reviews
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {registration.reviews.map((review) => (
                                <div key={review.id} className="rounded-lg border p-4">
                                    <div className="mb-3 flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-0">
                                        <div>
                                            <div className="font-medium">{review.reviewer?.name}</div>
                                            <div className="text-sm text-muted-foreground">{formatDate(review.reviewed_at)}</div>
                                        </div>
                                        {review.score !== undefined && (
                                            <div className={`text-xl font-bold sm:text-2xl ${getScoreColor(review.score)}`}>{review.score}/100</div>
                                        )}
                                    </div>
                                    {review.feedback && (
                                        <div className="mb-2">
                                            <div className="mb-1 text-sm font-medium">Feedback</div>
                                            <p className="text-sm text-muted-foreground">{review.feedback}</p>
                                        </div>
                                    )}
                                    {review.recommendation && (
                                        <div>
                                            <div className="mb-1 text-sm font-medium">Recommendation</div>
                                            <p className="text-sm text-muted-foreground">{review.recommendation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Approve Dialog */}
            <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Registration?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will approve the journal registration for {registration.pembinaan?.name}. The journal manager will be notified and
                            you can then assign reviewers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove}>Approve</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Registration</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this registration. The journal manager will receive this feedback.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Rejection Reason *</Label>
                            <Textarea
                                id="reason"
                                placeholder="Explain why this registration is being rejected..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DEPRECATED: Assign reviewer dialog - only Super Admin can assign reviewers
            <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Reviewer</DialogTitle>
                        <DialogDescription>Select a reviewer from your university to evaluate this registration.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reviewer">Reviewer *</Label>
                            <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
                                <SelectTrigger id="reviewer">
                                    <SelectValue placeholder="Select reviewer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {loadingReviewers ? (
                                        <div className="p-2 text-center text-sm text-muted-foreground">Loading reviewers...</div>
                                    ) : reviewers.length === 0 ? (
                                        <div className="p-2 text-center text-sm text-muted-foreground">No reviewers available</div>
                                    ) : (
                                        reviewers.map((reviewer) => (
                                            <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                                                {reviewer.name} ({reviewer.email})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAssignReviewer}>Assign</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            */}
        </AppLayout>
    );
}
