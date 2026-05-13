/**
 * WizardProgressBar Component
 *
 * @description Step indicator showing progress through the submission wizard.
 *              Each step displays its label, completion status (complete / current / upcoming),
 *              and a connecting line between steps.
 *
 * @usage
 * ```tsx
 * <WizardProgressBar
 *     steps={[
 *         { label: 'Info Dasar', description: '...', complete: true },
 *         { label: 'Kontributor', description: '...', complete: true },
 *         { label: 'Terbitan', description: '...', complete: false },
 *         { label: 'Evaluasi', description: '...', complete: false },
 *         { label: 'Konfirmasi', description: '...', complete: false },
 *     ]}
 *     currentStep={2}
 * />
 * ```
 */

import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

export interface WizardStep {
    label: string;
    description?: string;
    complete: boolean;
}

interface WizardProgressBarProps {
    steps: WizardStep[];
    currentStep: number; // 0-indexed
    className?: string;
}

export default function WizardProgressBar({ steps, currentStep, className }: WizardProgressBarProps) {
    return (
        <nav aria-label="Wizard Progress" className={cn('w-full', className)}>
            {/* Desktop / Tablet layout */}
            <ol className="hidden items-center sm:flex">
                {steps.map((step, index) => {
                    const isComplete = step.complete;
                    const isCurrent = index === currentStep;
                    const isUpcoming = !isComplete && !isCurrent;

                    return (
                        <li
                            key={index}
                            className={cn('flex items-center', index < steps.length - 1 ? 'flex-1' : '')}
                        >
                            {/* Step circle + label */}
                            <div className="flex flex-col items-center gap-2">
                                <div
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
                                        isComplete &&
                                            'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/25',
                                        isCurrent &&
                                            'border-blue-500 bg-blue-50 text-blue-600 ring-4 ring-blue-500/20 dark:bg-blue-950 dark:text-blue-400',
                                        isUpcoming &&
                                            'border-muted-foreground/30 bg-muted text-muted-foreground',
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="h-5 w-5" strokeWidth={3} />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                <div className="text-center">
                                    <p
                                        className={cn(
                                            'text-xs font-medium transition-colors',
                                            isComplete && 'text-emerald-600 dark:text-emerald-400',
                                            isCurrent && 'text-blue-600 dark:text-blue-400',
                                            isUpcoming && 'text-muted-foreground',
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                    {step.description && (
                                        <p className="mt-0.5 max-w-[120px] text-[10px] leading-tight text-muted-foreground">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="mx-2 mb-8 h-0.5 flex-1">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all duration-500',
                                            step.complete
                                                ? 'bg-emerald-500'
                                                : 'bg-muted-foreground/20',
                                        )}
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>

            {/* Mobile layout */}
            <ol className="space-y-3 sm:hidden">
                {steps.map((step, index) => {
                    const isComplete = step.complete;
                    const isCurrent = index === currentStep;
                    const isUpcoming = !isComplete && !isCurrent;

                    return (
                        <li key={index} className="flex items-start gap-3">
                            {/* Step indicator column */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300',
                                        isComplete &&
                                            'border-emerald-500 bg-emerald-500 text-white',
                                        isCurrent &&
                                            'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
                                        isUpcoming &&
                                            'border-muted-foreground/30 bg-muted text-muted-foreground',
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="h-4 w-4" strokeWidth={3} />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Vertical connector */}
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            'mt-1 h-6 w-0.5 rounded-full transition-all duration-500',
                                            isComplete
                                                ? 'bg-emerald-500'
                                                : 'bg-muted-foreground/20',
                                        )}
                                    />
                                )}
                            </div>

                            {/* Step content */}
                            <div className="pb-2">
                                <p
                                    className={cn(
                                        'text-sm font-medium leading-none transition-colors',
                                        isComplete && 'text-emerald-600 dark:text-emerald-400',
                                        isCurrent && 'text-blue-600 dark:text-blue-400',
                                        isUpcoming && 'text-muted-foreground',
                                    )}
                                >
                                    {step.label}
                                </p>
                                {step.description && (
                                    <p className="mt-1 text-xs leading-tight text-muted-foreground">
                                        {step.description}
                                    </p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
