import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertWarningProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
}

export default function AlertWarning({ message = 'Terlambat > 14 hari', className, ...props }: AlertWarningProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400 select-none",
                className
            )}
            role="alert"
            {...props}
        >
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{message}</span>
        </div>
    );
}
