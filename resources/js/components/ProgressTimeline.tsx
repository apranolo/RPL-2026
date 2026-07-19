/**
 * Progress Timeline Component
 * 
 * @description Komponen untuk menampilkan milestone persentase progres riset dosen (0% - 100%).
 * @features Visualisasi progres linear, status hijau untuk target yang terlampaui.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';
import { PembinaanRegistration } from '@/types';

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
    
    const steps: TimelineStep[] = milestones.map(milestone => {
        let status: TimelineStatus = 'pending';
        if (currentProgress > milestone) {
            status = 'completed';
        } else if (currentProgress === milestone) {
            status = 'active';
        }
        
        return {
            label: `${milestone}%`,
            status: status,
            percentage: milestone
        };
    });

    const getStatusIcon = (status: TimelineStatus) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="h-6 w-6 text-green-500 bg-white" />;
            case 'active':
                return <Circle className="h-6 w-6 text-blue-500 fill-blue-100 bg-white" />;
            default:
                return <Circle className="h-6 w-6 text-gray-300 bg-white" />;
        }
    };

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative flex items-center justify-between w-full">
                    {/* Horizontal Connector line background */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-gray-200 rounded-full z-0" />
                    
                    {/* Horizontal Connector line active (green) */}
                    <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 rounded-full z-0 transition-all duration-500 ease-in-out" 
                        style={{ width: `${currentProgress}%` }}
                    />

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 flex flex-col items-center gap-2">
                            <div className="rounded-full bg-white p-1">
                                {getStatusIcon(step.status)}
                            </div>
                            <span 
                                className={cn(
                                    'text-sm font-bold',
                                    step.status === 'completed' ? 'text-green-600' : 
                                    step.status === 'active' ? 'text-blue-600' : 'text-gray-400'
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
