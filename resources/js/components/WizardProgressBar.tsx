import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardProgressBarProps {
    currentStep: number;
    className?: string;
    steps?: any[];
}

export const WizardProgressBar: React.FC<WizardProgressBarProps> = ({ currentStep, className, steps: propSteps }) => {
    const steps = propSteps || [
        { number: 1, label: 'Start' },
        { number: 2, label: 'Upload' },
        { number: 3, label: 'Metadata' },
        { number: 4, label: 'Contributors' },
        { number: 5, label: 'Confirm' },
    ];

    return (
        <div className={cn("w-full py-4 px-2", className)} aria-label="Progress">
            <ol className="flex items-center justify-between w-full max-w-4xl mx-auto">
                {steps.map((step, idx) => {
                    const isCompleted = step.number < currentStep;
                    const isActive = step.number === currentStep;

                    return (
                        <React.Fragment key={step.number}>
                            <li className="flex items-center space-x-2.5">
                                <span
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full shrink-0 border text-sm font-medium",
                                        isCompleted && "bg-emerald-100 border-emerald-500 text-emerald-700",
                                        isActive && "bg-primary border-primary text-primary-foreground font-bold ring-2 ring-primary/20",
                                        !isCompleted && !isActive && "border-gray-300 text-gray-500 bg-background"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="w-4 h-4 stroke-[3px]" />
                                    ) : (
                                        step.number
                                    )}
                                </span>
                                <span
                                    className={cn(
                                        "text-sm font-medium hidden sm:inline",
                                        isActive && "text-primary font-semibold",
                                        isCompleted && "text-emerald-600",
                                        !isActive && !isCompleted && "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </li>
                            {idx < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-4 hidden sm:block",
                                        step.number < currentStep
                                            ? "bg-emerald-500"
                                            : "bg-gray-200"
                                    )}
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

