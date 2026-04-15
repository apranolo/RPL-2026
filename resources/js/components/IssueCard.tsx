import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AssessmentIssue } from '@/types';
import { AlertCircle, AlertTriangle, Edit, Info, Trash2 } from 'lucide-react';

interface IssueCardProps {
    issue: AssessmentIssue;
    readOnly?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

const categoryConfig = {
    editorial: {
        label: 'Editorial',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    technical: {
        label: 'Technical',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    },
    content_quality: {
        label: 'Content Quality',
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    management: {
        label: 'Management',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    },
};

const priorityConfig = {
    high: {
        label: 'High',
        icon: AlertCircle,
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
    medium: {
        label: 'Medium',
        icon: AlertTriangle,
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    },
    low: {
        label: 'Low',
        icon: Info,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    },
};

export default function IssueCard({ issue, readOnly = false, onEdit, onDelete }: IssueCardProps) {
    const category = categoryConfig[issue.category];
    const priority = priorityConfig[issue.priority];
    const PriorityIcon = priority.icon;

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        {/* Title */}
                        <div className="flex items-start gap-2">
                            <PriorityIcon
                                className={cn(
                                    'mt-0.5 h-5 w-5 flex-shrink-0',
                                    priority.color.includes('red')
                                        ? 'text-red-600'
                                        : priority.color.includes('yellow')
                                          ? 'text-yellow-600'
                                          : 'text-gray-600',
                                )}
                            />
                            <h4 className="text-base leading-tight font-semibold">{issue.title}</h4>
                        </div>

                        {/* Description */}
                        <p className="pl-7 text-sm leading-relaxed text-muted-foreground">{issue.description}</p>

                        {/* Badges */}
                        <div className="flex items-center gap-2 pl-7">
                            <Badge variant="outline" className={cn('text-xs', category.color)}>
                                {category.label}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', priority.color)}>
                                {priority.label} Priority
                            </Badge>
                        </div>
                    </div>

                    {/* Actions */}
                    {!readOnly && (
                        <div className="flex flex-shrink-0 items-center gap-1">
                            {onEdit && (
                                <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                            )}
                            {onDelete && (
                                <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
