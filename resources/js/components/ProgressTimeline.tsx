/**
 * Progress Timeline Component
 *
 * @description Komponen untuk menampilkan milestone persentase progres riset dosen (0% - 100%).
 * @features Visualisasi progres linear, status hijau untuk target yang terlampaui.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PembinaanRegistration } from '@/types';
import { CheckCircle2, Circle } from 'lucide-react';

export type TimelineStatus = 'completed' | 'active' | 'pending' | 'rejected';

export interface TimelineStep {
    label: string;
    status: TimelineStatus;
    percentage: number;
}

interface ProgressTimelineProps {
    registration?: PembinaanRegistration;
    progressPercentage?: number;
    title?: string;
    className?: string;
}

export default function ProgressTimeline({ registration, progressPercentage = 0, title = 'Progress Riset Dosen', className }: ProgressTimelineProps) {
    // If not explicitly provided, we could try to derive it or default to 0.
    // Since the backend might not have progress_percentage in registration yet, we rely on the prop or default to 0.
    const currentProgress = progressPercentage;

    const milestones = [0, 25, 50, 75, 100];

    const steps: TimelineStep[] = milestones.map((milestone) => {
        let status: TimelineStatus = 'pending';
        if (currentProgress > milestone) {
            status = 'completed';
        } else if (currentProgress === milestone) {
            status = 'active';
        }

        return {
            label: `${milestone}%`,
            status: status,
            percentage: milestone,
        };
    });

    const getStatusIcon = (status: TimelineStatus) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="h-6 w-6 bg-white text-green-500" />;
            case 'active':
                return <Circle className="h-6 w-6 bg-white fill-blue-100 text-blue-500" />;
            default:
                return <Circle className="h-6 w-6 bg-white text-gray-300" />;
        }
    };

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative flex w-full items-center justify-between">
                    {/* Horizontal Connector line background */}
                    <div className="absolute top-1/2 left-0 z-0 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200" />

                    {/* Horizontal Connector line active (green) */}
                    <div
                        className="absolute top-1/2 left-0 z-0 h-1 -translate-y-1/2 rounded-full bg-green-500 transition-all duration-500 ease-in-out"
                        style={{ width: `${currentProgress}%` }}
                    />

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center gap-2">
                            <div className="rounded-full bg-white p-1">{getStatusIcon(step.status)}</div>
                            <span
                                className={cn(
                                    'text-sm font-bold',
                                    step.status === 'completed' ? 'text-green-600' : step.status === 'active' ? 'text-blue-600' : 'text-gray-400',
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
