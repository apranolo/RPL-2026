import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { PembinaanRegistration } from '@/types';

export type TimelineStatus = 'completed' | 'active' | 'pending' | 'rejected';

export interface TimelineStep {
    label: string;
    status: TimelineStatus;
    timestamp?: string;
    note?: string;
}

interface ProgressTimelineProps {
    registration?: PembinaanRegistration;
    steps?: TimelineStep[];
    title?: string;
    className?: string;
}

export default function ProgressTimeline({ registration, steps: customSteps, title = 'Progress Evaluasi Monev', className }: ProgressTimelineProps) {
    const getStatusIcon = (status: TimelineStatus) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case 'active':
                return <Clock className="h-5 w-5 animate-pulse text-blue-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Circle className="h-5 w-5 text-gray-300" />;
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            return format(new Date(dateString), 'dd MMM yyyy, HH:mm', {
                locale: id,
            });
        } catch {
            return dateString;
        }
    };

    // Build timeline steps dynamically if registration data is provided
    const steps: TimelineStep[] = customSteps || (() => {
        if (!registration) return [];

        const list: TimelineStep[] = [];

        // Step 1: Registrasi Jurnal
        list.push({
            label: 'Registrasi Jurnal',
            status: 'completed',
            timestamp: registration.registered_at,
            note: `Jurnal: ${registration.journal?.title || '-'}`
        });

        // Step 2: Penunjukan Reviewer
        const hasAssignment = registration.reviewer_assignments && registration.reviewer_assignments.length > 0;
        const assignment = hasAssignment ? registration.reviewer_assignments![0] : null;
        let assignmentStatus: TimelineStatus = 'pending';
        let assignmentNote = 'Menunggu penunjukan reviewer oleh Admin';
        let assignmentTime = undefined;

        if (hasAssignment && assignment) {
            assignmentStatus = 'completed';
            assignmentTime = assignment.assigned_at;
            assignmentNote = `Reviewer ditunjuk: ${assignment.reviewer?.name || 'Reviewer'}`;
        } else if (registration.status === 'pending') {
            assignmentStatus = 'active';
        }

        list.push({
            label: 'Penunjukan Reviewer',
            status: assignmentStatus,
            timestamp: assignmentTime,
            note: assignmentNote
        });

        // Step 3: Proses Evaluasi
        let evalStatus: TimelineStatus = 'pending';
        let evalNote = 'Menunggu penilaian reviewer';
        let evalTime = undefined;

        if (registration.review_status === 'review_selesai') {
            evalStatus = 'completed';
            evalNote = 'Evaluasi selesai dilakukan oleh reviewer';
            // Get reviewed time
            const review = registration.reviews && registration.reviews.length > 0 ? registration.reviews[0] : null;
            if (review) {
                evalTime = review.reviewed_at;
            }
        } else if (registration.review_status === 'sedang_direview') {
            evalStatus = 'active';
            evalNote = 'Proposal sedang dievaluasi oleh reviewer';
        } else if (registration.review_status === 'ditolak') {
            evalStatus = 'rejected';
            evalNote = 'Evaluasi ditolak/revisi';
        } else if (hasAssignment) {
            evalStatus = 'active';
        }

        list.push({
            label: 'Proses Evaluasi',
            status: evalStatus,
            timestamp: evalTime,
            note: evalNote
        });

        // Step 4: Persetujuan Akhir (Verification / Final Status)
        let finalStatus: TimelineStatus = 'pending';
        let finalNote = 'Menunggu keputusan akhir Admin LPPM';
        let finalTime = undefined;

        if (registration.status === 'approved') {
            finalStatus = 'completed';
            finalNote = 'Pendaftaran Monev disetujui';
            finalTime = registration.reviewed_at;
        } else if (registration.status === 'rejected') {
            finalStatus = 'rejected';
            finalNote = registration.rejection_reason 
                ? `Pendaftaran ditolak: ${registration.rejection_reason}`
                : 'Pendaftaran ditolak';
            finalTime = registration.reviewed_at;
        } else if (registration.review_status === 'review_selesai') {
            finalStatus = 'active';
        }

        list.push({
            label: 'Keputusan Akhir',
            status: finalStatus,
            timestamp: finalTime,
            note: finalNote
        });

        return list;
    })();

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex items-start gap-3">
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        'absolute top-8 left-[10px] h-[calc(100%+8px)] w-0.5',
                                        step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200',
                                    )}
                                />
                            )}

                            {/* Status icon */}
                            <div className="relative z-10 flex-shrink-0">{getStatusIcon(step.status)}</div>

                            {/* Step content */}
                            <div className="min-w-0 flex-1 pt-0.5">
                                <p
                                    className={cn(
                                        'text-sm font-medium',
                                        step.status === 'completed' && 'text-gray-900',
                                        step.status === 'active' && 'text-blue-600',
                                        step.status === 'rejected' && 'text-red-600',
                                        step.status === 'pending' && 'text-gray-500',
                                    )}
                                >
                                    {step.label}
                                </p>

                                {step.timestamp && <p className="mt-1 text-xs text-muted-foreground">{formatDate(step.timestamp)}</p>}

                                {step.note && <p className="mt-1 text-xs text-muted-foreground italic">{step.note}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-gray-600">Selesai</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-blue-500" />
                            <span className="text-gray-600">Sedang Proses</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Circle className="h-3 w-3 text-gray-300" />
                            <span className="text-gray-600">Menunggu</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <XCircle className="h-3 w-3 text-red-500" />
                            <span className="text-gray-600">Ditolak</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
