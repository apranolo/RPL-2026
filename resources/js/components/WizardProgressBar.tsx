import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import React from 'react';

interface WizardProgressBarProps {
    currentStep: number;
    steps?: any[];
    className?: string;
}

export const WizardProgressBar: React.FC<WizardProgressBarProps> = ({ currentStep }) => {
    const steps = [
        { number: 1, label: 'Start' },
        { number: 2, label: 'Upload' },
        { number: 3, label: 'Metadata' },
        { number: 4, label: 'Contributors' },
        { number: 5, label: 'Confirm' },
    ];

    return (
        <div className="w-full px-2 py-4" aria-label="Progress">
            <ol className="mx-auto flex w-full max-w-4xl items-center justify-between">
                {steps.map((step, idx) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;

                    return (
                        <React.Fragment key={step.number}>
                            <li className="flex items-center space-x-2.5">
                                <span
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                                        isCompleted && 'border-emerald-500 bg-emerald-100 text-emerald-700',
                                        isActive && 'border-primary bg-primary font-bold text-primary-foreground ring-2 ring-primary/20',
                                        !isCompleted && !isActive && 'border-gray-300 bg-background text-gray-500',
                                    )}
                                >
                                    {isCompleted ? <Check className="h-4 w-4 stroke-[3px]" /> : step.number}
                                </span>
                                <span
                                    className={cn(
                                        'hidden text-sm font-medium sm:inline',
                                        isActive && 'font-semibold text-primary',
                                        isCompleted && 'text-emerald-600',
                                        !isActive && !isCompleted && 'text-muted-foreground',
                                    )}
                                >
                                    {step.label}
                                </span>
                            </li>
                            {idx < steps.length - 1 && (
                                <div
                                    className={cn('mx-4 hidden h-0.5 flex-1 sm:block', step.number < currentStep ? 'bg-emerald-500' : 'bg-gray-200')}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </ol>
        </div>
    );
};

export default WizardProgressBar;
