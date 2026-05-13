/**
 * User Pembinaan Registration Detail Component
 *
 * @description
 * Detailed view of a specific registration for journal managers.
 * Displays comprehensive registration information including status,
 * uploaded documents, reviewer information, review scores, and feedback.
 * Provides actions to cancel pending registrations or upload additional documents.
 *
 * @route GET /user/pembinaan/registration/{id}
 *
 * @features
 * - Registration status display with timeline
 * - Program and journal information
 * - Uploaded attachments list with download
 * - Reviewer information and assignment
 * - Review scores and feedback (if completed)
 * - Rejection reason display
 * - Cancel registration (if pending)
 * - Upload additional documents
 *
 * @author JurnalMU Team
 */
import ReviewerFeedback from '@/components/ReviewerFeedback';
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
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PembinaanRegistration } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    Trash2,
    Upload,
    User,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    registration: PembinaanRegistration;
    category: 'akreditasi' | 'indeksasi';
}

export default function PembinaanRegistrationShow({ registration, category }: Props) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);

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
            title: category.charAt(0).toUpperCase() + category.slice(1),
            href: route(`user.pembinaan.${category}`),
        },
        {
            title: 'Registration Detail',
            href: route('user.pembinaan.registration', registration.id),
        },
    ];

    const getStatusConfig = (status: string) => {
        const configs = {
            pending: {
                icon: Clock,
                variant: 'secondary',
                label: 'Pending Review',
                description: 'Your registration is being reviewed',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-100',
            },
            approved: {
                icon: CheckCircle2,
                variant: 'default',
                label: 'Approved',
                description: 'Your registration has been approved',
                color: 'text-green-600',
                bgColor: 'bg-green-100',
            },
            rejected: {
                icon: XCircle,
                variant: 'destructive',
                label: 'Rejected',
                description: 'Your registration was not approved',
                color: 'text-destructive',
                bgColor: 'bg-destructive/10',
            },
        };

        return configs[status as keyof typeof configs];
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatDateTime = (date: string) => {
        return new Date(date).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(ext || '')) {
            return '🖼️';
        }
        return '📄';
    };

    const handleCancelRegistration = () => {
        router.delete(route('user.pembinaan.registration.cancel', registration.id), {
            onSuccess: () => {
                setShowCancelDialog(false);
            },
        });
    };

    const statusConfig = getStatusConfig(registration.status);
    const StatusIcon = statusConfig.icon;
    const reviewerUniversityName = (registration.reviewer as unknown as { university?: { name?: string } })?.university?.name;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registration Detail" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                                <Button variant="ghost" size="sm" asChild className="mb-2 w-full justify-start sm:w-auto">
                                    <a href={route(`user.pembinaan.${category}`)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Pembinaan
                                    </a>
                                </Button>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">Registration Detail</h1>
                                <p className="mt-1 text-muted-foreground">View your registration status and information</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Banner */}
                    <Card className={statusConfig.bgColor}>
                        <CardContent className="flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:text-left">
                            <div className={`rounded-full p-3 ${statusConfig.bgColor}`}>
                                <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
                            </div>
                            <div className="flex-1">
                                <h2 className={`text-xl font-bold ${statusConfig.color}`}>{statusConfig.label}</h2>
                                <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
                            </div>
                            <Badge
                                variant={statusConfig.variant as 'default' | 'secondary' | 'outline' | 'destructive'}
                                className="w-full justify-center px-4 py-2 text-base sm:w-auto"
                            >
                                {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                            </Badge>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Program & Journal Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Registration Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <Award className="h-4 w-4" />
                                            Program
                                        </div>
                                        <p className="text-lg font-semibold">{registration.pembinaan?.name}</p>
                                        {registration.pembinaan?.category && (
                                            <Badge variant="outline" className="mt-1 capitalize">
                                                {registration.pembinaan.category}
                                            </Badge>
                                        )}
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="mb-1 flex items-center gap-2 text-sm text-muted-foreground">
                                            <BookOpen className="h-4 w-4" />
                                            Journal
                                        </div>
                                        <p className="text-lg font-semibold">{registration.journal?.title}</p>
                                        {registration.journal?.issn && (
                                            <p className="text-sm text-muted-foreground">ISSN: {registration.journal.issn}</p>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="grid gap-3 text-sm">
                                        <div className="flex flex-col sm:flex-row sm:justify-between">
                                            <span className="text-muted-foreground">Registered At:</span>
                                            <span className="font-medium">{formatDateTime(registration.registered_at)}</span>
                                        </div>
                                        {registration.reviewed_at && (
                                            <div className="flex flex-col sm:flex-row sm:justify-between">
                                                <span className="text-muted-foreground">Reviewed At:</span>
                                                <span className="font-medium">{formatDateTime(registration.reviewed_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Rejection Reason */}
                            {registration.rejection_reason && (
                                <Card className="border-destructive">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-destructive">
                                            <AlertCircle className="h-5 w-5" />
                                            Rejection Reason
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="whitespace-pre-wrap text-muted-foreground">{registration.rejection_reason}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Uploaded Documents */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Uploaded Documents
                                    </CardTitle>
                                    <CardDescription>{registration.attachments?.length || 0} file(s) uploaded</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {registration.attachments && registration.attachments.length > 0 ? (
                                        <div className="overflow-x-auto rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="min-w-[200px] whitespace-nowrap">Document</TableHead>
                                                        <TableHead className="whitespace-nowrap">Type</TableHead>
                                                        <TableHead className="whitespace-nowrap">Uploaded</TableHead>
                                                        <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {registration.attachments.map((attachment) => (
                                                        <TableRow key={attachment.id}>
                                                            <TableCell className="min-w-[200px]">
                                                                <div className="flex items-center gap-2">
                                                                    <span>{getFileIcon(attachment.file_name)}</span>
                                                                    <span className="font-medium">{attachment.file_name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap">
                                                                <Badge variant="outline" className="capitalize">
                                                                    {attachment.document_type?.replace('_', ' ') || 'N/A'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap text-muted-foreground">
                                                                {attachment.created_at ? formatDate(attachment.created_at) : 'N/A'}
                                                            </TableCell>
                                                            <TableCell className="text-right whitespace-nowrap">
                                                                <Button variant="ghost" size="sm" asChild>
                                                                    <a href={route('user.pembinaan.attachments.download', attachment.id)} download>
                                                                        <Download className="h-4 w-4" />
                                                                    </a>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <p className="py-6 text-center text-sm text-muted-foreground">No documents uploaded</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Reviews */}
                            {registration.reviews && registration.reviews.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Review Results
                                        </CardTitle>
                                        <CardDescription>{registration.reviews.length} review(s) completed</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {registration.reviews.map((review) => (
                                            <div key={review.id} className="space-y-3 rounded-lg border p-4">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <p className="font-semibold">{review.reviewer?.name}</p>
                                                        <p className="text-sm text-muted-foreground">{formatDate(review.reviewed_at)}</p>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-2xl font-bold">{review.score}</p>
                                                        <p className="text-xs text-muted-foreground">Score</p>
                                                    </div>
                                                </div>

                                                {review.feedback && (
                                                    <>
                                                        <Separator />
                                                        <div>
                                                            <p className="mb-1 text-sm font-medium">Feedback:</p>
                                                            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{review.feedback}</p>
                                                        </div>
                                                    </>
                                                )}

                                                {review.recommendation && (
                                                    <div>
                                                        <p className="mb-1 text-sm font-medium">Recommendation:</p>
                                                        <Badge variant="outline" className="inline-flex break-words whitespace-normal capitalize">
                                                            {review.recommendation}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Assessment Section */}
                        {registration.status === 'approved' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        Self-Assessment
                                    </CardTitle>
                                    <CardDescription>Complete the self-assessment form to proceed with the coaching program</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {registration.assessment ? (
                                        <div className="space-y-4">
                                            {/* Assessment Status */}
                                            <div className="flex flex-col items-center justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:gap-0">
                                                <div className="text-center sm:text-left">
                                                    <p className="font-semibold">Assessment Status</p>
                                                    {(() => {
                                                        const status = registration.assessment.status;
                                                        const variant =
                                                            status === 'draft' ? 'secondary' : status === 'submitted' ? 'default' : 'outline';
                                                        const label =
                                                            status === 'draft'
                                                                ? 'Draft'
                                                                : status === 'submitted'
                                                                  ? 'Submitted - Pending Review'
                                                                  : 'Reviewed';
                                                        return (
                                                            <Badge className="mt-1" variant={variant}>
                                                                {label}
                                                            </Badge>
                                                        );
                                                    })()}
                                                </div>
                                                <div className="text-center text-sm text-muted-foreground sm:text-right">
                                                    {registration.assessment.updated_at && (
                                                        <p>Last updated: {formatDate(registration.assessment.updated_at)}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Reviewer Feedback */}
                                            {registration.assessment.status === 'reviewed' && (
                                                <ReviewerFeedback assessment={registration.assessment} />
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                                                {registration.assessment.status === 'draft' && (
                                                    <>
                                                        <Button className="w-full sm:w-auto sm:flex-1" asChild>
                                                            <Link href={route('user.assessments.edit', registration.assessment.id)}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Continue Assessment
                                                            </Link>
                                                        </Button>
                                                    </>
                                                )}
                                                {registration.assessment.status === 'submitted' && (
                                                    <Button variant="outline" className="w-full sm:w-auto sm:flex-1" asChild>
                                                        <Link href={route('user.assessments.show', registration.assessment.id)}>
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            View Submission
                                                        </Link>
                                                    </Button>
                                                )}
                                                {registration.assessment.status === 'reviewed' && (
                                                    <>
                                                        <Button variant="outline" className="w-full sm:w-auto sm:flex-1" asChild>
                                                            <Link href={route('user.assessments.show', registration.assessment.id)}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                View Results
                                                            </Link>
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 py-6 text-center">
                                            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <div>
                                                <p className="font-semibold">No Assessment Yet</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Start filling out the self-assessment form to proceed with the coaching program.
                                                </p>
                                            </div>
                                            <Button asChild>
                                                <button
                                                    onClick={() => {
                                                        router.post(
                                                            route('user.pembinaan.registrations.create-assessment', registration.id),
                                                            {},
                                                            {
                                                                onSuccess: () => {
                                                                    router.reload({ only: ['registration'] });
                                                                },
                                                            },
                                                        );
                                                    }}
                                                >
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Start Assessment
                                                </button>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {registration.pembinaan && (
                                        <Button variant="outline" className="w-full" asChild>
                                            <a href={route('user.pembinaan.programs.show', registration.pembinaan.id)}>
                                                <Award className="mr-2 h-4 w-4" />
                                                View Program
                                            </a>
                                        </Button>
                                    )}

                                    {registration.status === 'pending' && (
                                        <>
                                            <Button variant="outline" className="w-full">
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Additional Files
                                            </Button>

                                            <Button variant="destructive" className="w-full" onClick={() => setShowCancelDialog(true)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Cancel Registration
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Reviewer Info */}
                            {registration.reviewer && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            Reviewer
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div>
                                            <p className="font-semibold">{registration.reviewer.name}</p>
                                            <p className="text-muted-foreground">{registration.reviewer.email}</p>
                                        </div>
                                        {reviewerUniversityName && (
                                            <>
                                                <Separator />
                                                <div>
                                                    <p className="text-xs text-muted-foreground">University</p>
                                                    <p className="font-medium">{reviewerUniversityName}</p>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div className="rounded-full bg-primary p-1">
                                                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                                                </div>
                                                <div className="h-full w-0.5 bg-border" />
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="font-medium">Registered</p>
                                                <p className="text-sm text-muted-foreground">{formatDateTime(registration.registered_at)}</p>
                                            </div>
                                        </div>

                                        {registration.reviewed_at && (
                                            <div className="flex gap-3">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`rounded-full p-1 ${
                                                            registration.status === 'approved' ? 'bg-green-600' : 'bg-destructive'
                                                        }`}
                                                    >
                                                        {registration.status === 'approved' ? (
                                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium capitalize">{registration.status}</p>
                                                    <p className="text-sm text-muted-foreground">{formatDateTime(registration.reviewed_at)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Registration?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this registration? This action cannot be undone. You will need to register again if you
                            change your mind.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Registration</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelRegistration}
                            className={`bg-destructive text-destructive-foreground hover:bg-destructive/90`}
                        >
                            Yes, Cancel Registration
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
