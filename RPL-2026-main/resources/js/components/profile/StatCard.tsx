import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    color?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

const colorVariants = {
    blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        accent: 'bg-blue-500',
    },
    green: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        icon: 'text-green-600 dark:text-green-400',
        accent: 'bg-green-500',
    },
    amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/20',
        icon: 'text-amber-600 dark:text-amber-400',
        accent: 'bg-amber-500',
    },
    red: {
        bg: 'bg-red-100 dark:bg-red-900/20',
        icon: 'text-red-600 dark:text-red-400',
        accent: 'bg-red-500',
    },
    purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400',
        accent: 'bg-purple-500',
    },
};

export default function StatCard({ icon: Icon, label, value, color = 'blue', trend }: StatCardProps) {
    const colors = colorVariants[color];

    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                        <h3 className="mt-2 text-3xl font-bold">{value}</h3>
                        {trend && (
                            <p
                                className={cn(
                                    'mt-1 text-xs',
                                    trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                                )}
                            >
                                {trend.isPositive ? '+' : ''}
                                {trend.value}% from last month
                            </p>
                        )}
                    </div>
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-full', colors.bg)}>
                        <Icon className={cn('h-6 w-6', colors.icon)} />
                    </div>
                </div>
                <div className={cn('absolute bottom-0 left-0 h-1 w-full', colors.accent)} style={{ opacity: 0.3 }} />
            </CardContent>
        </Card>
    );
}
