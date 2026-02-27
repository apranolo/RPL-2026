import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { ArrowLeftRight, ArrowRight, User } from 'lucide-react';

interface ActivityItemProps {
    activity: {
        id: number;
        type: 'received' | 'transferred';
        journal: {
            id: number;
            title: string;
        };
        from_user?: {
            id: number;
            name: string;
        } | null;
        to_user?: {
            id: number;
            name: string;
        } | null;
        reassigned_by?: {
            id: number;
            name: string;
        } | null;
        reason?: string | null;
        created_at: string;
    };
}

export default function ActivityItem({ activity }: ActivityItemProps) {
    const timeAgo = formatDistanceToNow(new Date(activity.created_at), {
        addSuffix: true,
        locale: idLocale,
    });

    const getActivityDescription = () => {
        if (activity.type === 'received') {
            return (
                <span>
                    Menerima jurnal <span className="font-semibold">{activity.journal.title}</span>
                    {activity.from_user && (
                        <>
                            {' '}
                            dari <span className="font-semibold">{activity.from_user.name}</span>
                        </>
                    )}
                </span>
            );
        } else {
            return (
                <span>
                    Mengalihkan jurnal <span className="font-semibold">{activity.journal.title}</span>
                    {activity.to_user && (
                        <>
                            {' '}
                            ke <span className="font-semibold">{activity.to_user.name}</span>
                        </>
                    )}
                </span>
            );
        }
    };

    return (
        <div className="flex gap-3 rounded-lg border border-sidebar-border/70 bg-card p-4 dark:border-sidebar-border">
            <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                    activity.type === 'received' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
                }`}
            >
                {activity.type === 'received' ? (
                    <ArrowRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                    <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                )}
            </div>
            <div className="flex-1 space-y-1">
                <p className="text-sm">{getActivityDescription()}</p>
                {activity.reason && <p className="text-xs text-muted-foreground">Alasan: {activity.reason}</p>}
                {activity.reassigned_by && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        Oleh {activity.reassigned_by.name}
                    </p>
                )}
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
        </div>
    );
}
