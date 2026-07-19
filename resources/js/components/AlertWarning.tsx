import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import * as React from 'react';

interface AlertWarningProps extends React.HTMLAttributes<HTMLDivElement> {
    message?: string;
}

export default function AlertWarning({ message = 'Terlambat > 14 hari', className, ...props }: AlertWarningProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 select-none dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400',
                className,
            )}
            role="alert"
            {...props}
        >
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{message}</span>
        </div>
    );
}
