import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { EssayQuestion, EvaluationCategory, EvaluationIndicator, EvaluationSubCategory } from '@/types/assessment';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, GripVertical, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import React from 'react';

// --- Sortable Wrapper ---
interface SortableItemProps {
    id: string;
    children: React.ReactNode;
    className?: string;
}

export function SortableItem({ id, children, className }: SortableItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={className}>
            <div {...attributes} {...listeners} className="mt-1 mr-2 cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div className="flex-1">{children}</div>
        </div>
    );
}

// --- Category Item ---
interface CategoryItemProps {
    category: EvaluationCategory;
    onEdit: () => void;
    onDelete: () => void;
    onAddSubCategory: () => void;
    onAddEssay: () => void;
    children?: React.ReactNode;
}

export function CategoryItem({ category, onEdit, onDelete, onAddSubCategory, onAddEssay, children }: CategoryItemProps) {
    return (
        <Card className="mb-4 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                        {category.code}
                    </Badge>
                    <CardTitle className="text-base font-semibold">{category.name}</CardTitle>
                    {category.weight && (
                        <Badge variant="outline" className="ml-2">
                            Weight: {category.weight}%
                        </Badge>
                    )}
                    <Badge
                        variant={category.is_active ? 'default' : 'outline'}
                        className={!category.is_active ? 'border-muted bg-muted text-muted-foreground' : ''}
                    >
                        {category.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={onAddSubCategory} title="Add Sub-Category">
                        <Plus className="mr-1 h-4 w-4" /> Sub
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onAddEssay} title="Add Essay Question">
                        <Plus className="mr-1 h-4 w-4" /> Essay
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <div className="space-y-4 pl-2">{children}</div>
            </CardContent>
        </Card>
    );
}

// --- SubCategory Item ---
interface SubCategoryItemProps {
    subCategory: EvaluationSubCategory;
    onEdit: () => void;
    onDelete: () => void;
    onAddIndicator: () => void;
    children?: React.ReactNode;
}

export function SubCategoryItem({ subCategory, onEdit, onDelete, onAddIndicator, children }: SubCategoryItemProps) {
    return (
        <div className="mb-3 rounded-md border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between bg-muted/10 p-3">
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                        {subCategory.code}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">{subCategory.name}</span>
                    <Badge
                        variant={subCategory.is_active ? 'default' : 'outline'}
                        className={!subCategory.is_active ? 'border-muted bg-muted text-muted-foreground' : ''}
                    >
                        {subCategory.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onAddIndicator}>
                        <Plus className="mr-1 h-3 w-3" /> Indicator
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onEdit}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="space-y-2 p-3 pt-1 pl-6">{children}</div>
        </div>
    );
}

// --- Indicator Item ---
interface IndicatorItemProps {
    indicator: EvaluationIndicator;
    onEdit: () => void;
    onDelete: () => void;
}

export function IndicatorItem({ indicator, onEdit, onDelete }: IndicatorItemProps) {
    const getAnswerTypeBadgeClass = (type: string) => {
        switch (type) {
            case 'boolean':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'scale':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'text':
                return 'bg-purple-100 text-purple-700 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="group flex items-center justify-between rounded border bg-background p-2 text-sm shadow-sm transition-colors hover:border-primary/50">
            <div className="mr-2 flex-1">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 px-1 py-0 font-mono text-[10px]">
                        {indicator.code}
                    </Badge>
                    <span className="truncate font-medium">{indicator.question}</span>
                    <Badge
                        variant={indicator.is_active ? 'default' : 'outline'}
                        className={`h-5 px-1 py-0 text-[10px] ${!indicator.is_active ? 'border-muted bg-muted text-muted-foreground' : ''}`}
                    >
                        {indicator.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className={cn('h-4 px-1 py-0 text-[10px]', getAnswerTypeBadgeClass(indicator.answer_type))}>
                        {indicator.answer_type}
                    </Badge>
                    <span>Weight: {indicator.weight}</span>
                    {indicator.description && <span className="max-w-[200px] truncate">{indicator.description}</span>}
                </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
                    <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={onDelete}>
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}

// --- Essay Item ---
interface EssayItemProps {
    essay: EssayQuestion;
    onEdit: () => void;
    onDelete: () => void;
}

export function EssayItem({ essay, onEdit, onDelete }: EssayItemProps) {
    return (
        <div className="group mb-2 flex items-center justify-between rounded border border-dashed border-blue-200 bg-blue-50/30 p-2 text-sm shadow-sm">
            <div className="mr-2 flex-1">
                <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline" className="border-blue-200 text-[10px] text-blue-600">
                        Essay
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">{essay.code}</span>
                    <Badge
                        variant={essay.is_active ? 'default' : 'outline'}
                        className={`h-5 px-1 py-0 text-[10px] ${!essay.is_active ? 'border-muted bg-muted text-muted-foreground' : ''}`}
                    >
                        {essay.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                </div>
                <div className="line-clamp-2 font-medium">{essay.question}</div>
            </div>
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
                    <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600" onClick={onDelete}>
                    <Trash2 className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
