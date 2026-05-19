import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface InboxTabProps {
    counts: {
        unassigned: number;
        active: number;
        awaiting_decision: number;
        archived: number;
    };
    activeTab: string;
}

export function InboxTab({ counts, activeTab }: InboxTabProps) {
    const tabs = [
        { id: 'unassigned', label: 'Unassigned', count: counts.unassigned },
        { id: 'active', label: 'Active', count: counts.active },
        { id: 'awaiting_decision', label: 'Awaiting Decision', count: counts.awaiting_decision },
        { id: 'archived', label: 'Archived', count: counts.archived },
    ];

    return (
        <div className="flex space-x-1 rounded-xl bg-muted p-1">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <Link
                        key={tab.id}
                        href={route('user.editorial.desk.inbox', { tab: tab.id })}
                        className={cn(
                            'flex items-center justify-center space-x-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all',
                            isActive 
                                ? 'bg-background text-foreground shadow-sm' 
                                : 'text-muted-foreground hover:bg-muted-foreground/10'
                        )}
                    >
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                            <Badge variant={isActive ? 'default' : 'secondary'} className="ml-2 px-1.5 min-w-[20px] justify-center">
                                {tab.count}
                            </Badge>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
