/**
 * InboxTab Component
 *
 * @description Navigasi tab dengan counter badge untuk inbox Editor.
 *              Menampilkan tab list (Unassigned, Active, Awaiting) dengan jumlah naskah per tab.
 */
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TabItem {
    key: string;
    label: string;
    count: number;
    icon?: React.ReactNode;
}

interface InboxTabProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (tab: string) => void;
}

export default function InboxTab({ tabs, activeTab, onChange }: InboxTabProps) {
    return (
        <div className="flex gap-1 rounded-lg border bg-muted/40 p-1">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    className={cn(
                        'relative flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all',
                        'hover:bg-background/60',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        activeTab === tab.key
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground',
                    )}
                >
                    {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
                    <span>{tab.label}</span>
                    <Badge
                        variant={activeTab === tab.key ? 'default' : 'secondary'}
                        className={cn(
                            'ml-1 min-w-[20px] justify-center px-1.5 py-0 text-xs',
                            activeTab === tab.key ? '' : 'bg-muted text-muted-foreground',
                        )}
                    >
                        {tab.count}
                    </Badge>
                </button>
            ))}
        </div>
    );
}
