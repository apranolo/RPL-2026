import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';

export type TimelineStatus = 'completed' | 'active' | 'pending' | 'rejected';

export interface TimelineStep {
    label: string;
    status: TimelineStatus;
    timestamp?: string;
    note?: string;
}

interface StatusTimelineProps {
    steps: TimelineStep[];
    title?: string;
    className?: string;
}

/**
 * StatusTimeline Component
 *
 * Displays a vertical timeline showing the progress of assessment/pembinaan workflow.
 * Shows steps with different states: completed, active, pending, or rejected.
 * Positioned in top-right corner of detail pages.
 *
 * @component
 * @example
 * ```tsx
 * <StatusTimeline
 *   steps={[
 *     { label: 'Pendaftaran', status: 'completed', timestamp: '01 Feb 2026' },
 *     { label: 'Submit Assessment', status: 'active' },
 *     { label: 'Review', status: 'pending' },
 *   ]}
 * />
 * ```
 */
export default function StatusTimeline({ steps, title = 'Status Progress', className }: StatusTimelineProps) {
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

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-6">
                    {steps.map((step, index) => (
                        <div key={index} className="relative flex items-start gap-3">
                            {/* Connector line (except for last item) */}
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

                {/* Legend (optional) */}
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
