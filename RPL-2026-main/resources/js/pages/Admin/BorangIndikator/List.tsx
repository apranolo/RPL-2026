import CategoryFormModal from '@/components/Admin/Templates/CategoryFormModal';
import IndicatorFormModal from '@/components/Admin/Templates/IndicatorFormModal';
import SubCategoryFormModal from '@/components/Admin/Templates/SubCategoryFormModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { AccreditationTemplate, EvaluationCategory, EvaluationIndicator, EvaluationSubCategory, PaginatedResponse } from '@/types/assessment';
import { Head, router } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, ChevronLeft, ChevronRight, Edit, FileText, FolderTree, Layers, MoreHorizontal, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CategoryWithRelations extends EvaluationCategory {
    sub_categories_count?: number;
    indicators_count?: number;
    can_be_deleted?: boolean;
    template?: AccreditationTemplate;
    updated_at?: string;
}

interface SubCategoryWithRelations extends EvaluationSubCategory {
    indicators_count?: number;
    can_be_deleted?: boolean;
    updated_at?: string;
}

interface IndicatorWithRelations extends EvaluationIndicator {
    can_be_deleted?: boolean;
    updated_at?: string;
}

interface Props {
    categories?: PaginatedResponse<CategoryWithRelations>;
    templates?: AccreditationTemplate[];
    filters?: {
        search?: string;
        type?: string;
        template_id?: string;
        is_active?: string;
        sort?: string;
    };
}

/**
 * Borang Indikator List View (Super Admin)
 *
 * @description Unified list view displaying Categories, Sub-Categories, and Indicators with expandable rows
 * @route GET /admin/borang-indikator/list
 * @features Expandable hierarchy, cascading filters, inline CRUD, add new at each level, edge case handling
 */
export default function BorangIndikatorList(props: Props) {
    // Safe defaults with null checks - handle undefined/null props
    const categoriesProp = props?.categories;
    const templatesProp = props?.templates;
    const filtersProp = props?.filters;

    const categories = categoriesProp ?? {
        data: [],
        links: [],
        current_page: 1,
        from: 0,
        last_page: 1,
        path: '',
        per_page: 50,
        to: 0,
        total: 0,
    };
    const templates = templatesProp ?? [];
    const filters = filtersProp ?? {};

    const [search, setSearch] = useState(filters?.search ?? '');
    const [typeFilter, setTypeFilter] = useState(filters?.type ?? '');
    const [templateFilter, setTemplateFilter] = useState(filters?.template_id ?? '');
    const [statusFilter, setStatusFilter] = useState(filters?.is_active ?? '');
    // const [sortFilter, setSortFilter] = useState(filters?.sort ?? 'display_order_asc');
    const [isLoading, setIsLoading] = useState(false);

    // Modal states
    const [categoryModal, setCategoryModal] = useState<{ open: boolean; category?: CategoryWithRelations; mode: 'create' | 'edit' }>({
        open: false,
        mode: 'create',
    });
    const [subCategoryModal, setSubCategoryModal] = useState<{
        open: boolean;
        categoryId?: string;
        subCategory?: SubCategoryWithRelations;
        mode: 'create' | 'edit';
    }>({
        open: false,
        mode: 'create',
    });
    const [indicatorModal, setIndicatorModal] = useState<{
        open: boolean;
        subCategoryId?: string;
        indicator?: IndicatorWithRelations;
        mode: 'create' | 'edit';
    }>({
        open: false,
        mode: 'create',
    });

    // Delete dialogs
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type?: 'category' | 'subcategory' | 'indicator';
        item?: CategoryWithRelations | SubCategoryWithRelations | IndicatorWithRelations;
        childrenCount?: { subCategories?: number; indicators?: number };
    }>({ open: false });

    // Expanded state for collapsibles
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
    const [expandedSubCategories, setExpandedSubCategories] = useState<Set<number>>(new Set());

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        setIsLoading(true);
        router.get(
            route('admin.borang-indikator.list'),
            {
                ...(search && { search }),
                ...(typeFilter && { type: typeFilter }),
                ...(templateFilter && { template_id: templateFilter }),
                ...(statusFilter && { is_active: statusFilter }),
                // ...(sortFilter && { sort: sortFilter }),
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setTypeFilter('');
        setTemplateFilter('');
        setStatusFilter('');
        // setSortFilter('display_order_asc');
        setIsLoading(true);
        router.get(route('admin.borang-indikator.list'), {}, { preserveState: true, onFinish: () => setIsLoading(false) });
    };

    const handleTypeFilterChange = (value: string) => {
        setTypeFilter(value);
        setTemplateFilter(''); // Reset template when type changes
    };

    const filteredTemplates = typeFilter ? templates.filter((t) => t.type === typeFilter) : templates;

    const hasActiveFilters = search || typeFilter || templateFilter || statusFilter; // || sortFilter !== 'display_order_asc';

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(categoryId)) {
                next.delete(categoryId);
            } else {
                next.add(categoryId);
            }
            return next;
        });
    };

    const toggleSubCategory = (subCategoryId: number) => {
        setExpandedSubCategories((prev) => {
            const next = new Set(prev);
            if (next.has(subCategoryId)) {
                next.delete(subCategoryId);
            } else {
                next.add(subCategoryId);
            }
            return next;
        });
    };

    const handleDelete = () => {
        if (!deleteDialog.item || !deleteDialog.type) return;

        const routeMap = {
            category: 'admin.categories.destroy',
            subcategory: 'admin.sub-categories.destroy',
            indicator: 'admin.indicators.destroy',
        };

        router.delete(route(routeMap[deleteDialog.type], deleteDialog.item.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `${deleteDialog.type === 'category' ? 'Category' : deleteDialog.type === 'subcategory' ? 'Sub-Category' : 'Indicator'} deleted successfully`,
                );
                setDeleteDialog({ open: false });
            },
            onError: (errors) => {
                console.error('Delete errors:', errors);
                toast.error('Failed to delete. Please try again.');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Borang Indikator', href: route('admin.borang-indikator.index') },
                { title: 'List View', href: route('admin.borang-indikator.list') },
            ]}
        >
            <Head title="Borang Indikator - List View" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">List View - Borang Indikator</h2>
                        <p className="text-sm text-muted-foreground">
                            View and manage Categories, Sub-Categories, and Indicators in a hierarchical list
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {templateFilter && (
                            <Button onClick={() => setCategoryModal({ open: true, mode: 'create' })}>
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Unsur
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="rounded-lg border bg-card p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search code or name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Type Filter */}
                            <Select value={typeFilter || 'all'} onValueChange={handleTypeFilterChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="akreditasi">Akreditasi</SelectItem>
                                    <SelectItem value="indeksasi">Indeksasi</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Template Filter */}
                            <Select value={templateFilter || 'all'} onValueChange={setTemplateFilter} disabled={!typeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Template" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Templates</SelectItem>
                                    {filteredTemplates.map((template) => (
                                        <SelectItem key={template.id} value={template.id.toString()}>
                                            {template.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={statusFilter || 'all'} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="1">Active</SelectItem>
                                    <SelectItem value="0">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Sort Filter - COMMENTED FOR DEBUGGING */}
                            {/* <Select value={sortFilter} onValueChange={setSortFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="display_order_asc">Order (Asc)</SelectItem>
                                    <SelectItem value="display_order_desc">Order (Desc)</SelectItem>
                                    <SelectItem value="weight_desc">Weight (High to Low)</SelectItem>
                                    <SelectItem value="weight_asc">Weight (Low to High)</SelectItem>
                                </SelectContent>
                            </Select> */}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Filtering...' : 'Apply Filters'}
                            </Button>
                            {hasActiveFilters && (
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Content */}
                {!templateFilter ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <FolderTree className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">Select a Template</h3>
                        <p className="text-sm text-muted-foreground">
                            Please select a type and template from the filters above to view the hierarchical structure.
                        </p>
                    </div>
                ) : categories.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                        <h3 className="mb-2 text-lg font-semibold">No Data Found</h3>
                        <p className="mb-4 text-sm text-muted-foreground">No categories found for the selected filters.</p>
                        {hasActiveFilters && (
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* List */}
                        <div className="rounded-lg border bg-card">
                            {categories.data.map((category) => (
                                <div key={category.id} className="border-b last:border-b-0">
                                    {/* Category Row */}
                                    <Collapsible open={expandedCategories.has(category.id)} onOpenChange={() => toggleCategory(category.id)}>
                                        <div className="flex items-center gap-2 p-4 hover:bg-muted/50">
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <ChevronRight
                                                        className={cn(
                                                            'h-4 w-4 transition-transform',
                                                            expandedCategories.has(category.id) && 'rotate-90',
                                                        )}
                                                    />
                                                </Button>
                                            </CollapsibleTrigger>
                                            <Layers className="h-5 w-5 text-blue-500" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-medium">{category.code}</span>
                                                    <span className="font-semibold">{category.name}</span>
                                                    {!category.is_active && <Badge variant="secondary">Inactive</Badge>}
                                                    <Badge variant="outline" className="ml-auto">
                                                        Weight: {category.weight}%
                                                    </Badge>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge variant="secondary">
                                                                    {category.sub_categories_count || 0} Sub-Unsur • {category.indicators_count || 0}{' '}
                                                                    Indikator
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="text-xs">
                                                                    Last updated:{' '}
                                                                    {category.updated_at
                                                                        ? formatDistanceToNow(new Date(category.updated_at), {
                                                                              addSuffix: true,
                                                                              locale: id,
                                                                          })
                                                                        : 'N/A'}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                                {category.description && <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setCategoryModal({ open: true, category, mode: 'edit' })}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setDeleteDialog({
                                                                open: true,
                                                                type: 'category',
                                                                item: category,
                                                                childrenCount: {
                                                                    subCategories: category.sub_categories_count,
                                                                    indicators: category.indicators_count,
                                                                },
                                                            })
                                                        }
                                                        disabled={!category.can_be_deleted}
                                                        className="text-destructive focus:text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                        {!category.can_be_deleted && <span className="ml-2 text-xs">(Used in assessments)</span>}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Sub-Categories */}
                                        <CollapsibleContent>
                                            <div className="border-l-2 border-blue-200 pl-8">
                                                {category.sub_categories && category.sub_categories.length > 0 ? (
                                                    category.sub_categories.map((subCategory) => (
                                                        <div key={subCategory.id} className="border-t">
                                                            <Collapsible
                                                                open={expandedSubCategories.has(subCategory.id)}
                                                                onOpenChange={() => toggleSubCategory(subCategory.id)}
                                                            >
                                                                <div className="flex items-center gap-2 p-4 hover:bg-muted/50">
                                                                    <CollapsibleTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                            <ChevronRight
                                                                                className={cn(
                                                                                    'h-4 w-4 transition-transform',
                                                                                    expandedSubCategories.has(subCategory.id) && 'rotate-90',
                                                                                )}
                                                                            />
                                                                        </Button>
                                                                    </CollapsibleTrigger>
                                                                    <FolderTree className="h-4 w-4 text-green-500" />
                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-mono text-sm font-medium">{subCategory.code}</span>
                                                                            <span className="text-sm font-semibold">{subCategory.name}</span>
                                                                            {!subCategory.is_active && <Badge variant="secondary">Inactive</Badge>}
                                                                            <Badge variant="outline" className="ml-auto text-xs">
                                                                                {subCategory.indicators?.length || 0} Indikator
                                                                            </Badge>
                                                                        </div>
                                                                        {subCategory.description && (
                                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                                {subCategory.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="sm">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    setSubCategoryModal({
                                                                                        open: true,
                                                                                        categoryId: category.id.toString(),
                                                                                        subCategory,
                                                                                        mode: 'edit',
                                                                                    })
                                                                                }
                                                                            >
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                Edit
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() =>
                                                                                    setDeleteDialog({
                                                                                        open: true,
                                                                                        type: 'subcategory',
                                                                                        item: subCategory,
                                                                                        childrenCount: { indicators: subCategory.indicators?.length },
                                                                                    })
                                                                                }
                                                                                disabled={!(subCategory as SubCategoryWithRelations).can_be_deleted}
                                                                                className="text-destructive focus:text-destructive"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete
                                                                                {!(subCategory as SubCategoryWithRelations).can_be_deleted && (
                                                                                    <span className="ml-2 text-xs">(Used in assessments)</span>
                                                                                )}
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>

                                                                {/* Indicators */}
                                                                <CollapsibleContent>
                                                                    <div className="border-l-2 border-green-200 pl-8">
                                                                        {subCategory.indicators && subCategory.indicators.length > 0 ? (
                                                                            subCategory.indicators.map((indicator) => (
                                                                                <div
                                                                                    key={indicator.id}
                                                                                    className="flex items-start gap-2 border-t p-4 hover:bg-muted/50"
                                                                                >
                                                                                    <FileText className="mt-1 h-4 w-4 text-purple-500" />
                                                                                    <div className="flex-1">
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="font-mono text-xs font-medium">
                                                                                                {indicator.code}
                                                                                            </span>
                                                                                            {!indicator.is_active && (
                                                                                                <Badge variant="secondary">Inactive</Badge>
                                                                                            )}
                                                                                            <Badge variant="outline" className="text-xs">
                                                                                                {indicator.answer_type}
                                                                                            </Badge>
                                                                                            <Badge variant="outline" className="ml-auto text-xs">
                                                                                                Weight: {indicator.weight}%
                                                                                            </Badge>
                                                                                        </div>
                                                                                        <p className="mt-1 text-sm">{indicator.question}</p>
                                                                                        {indicator.description && (
                                                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                                                {indicator.description}
                                                                                            </p>
                                                                                        )}
                                                                                    </div>
                                                                                    <DropdownMenu>
                                                                                        <DropdownMenuTrigger asChild>
                                                                                            <Button variant="ghost" size="sm">
                                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                                            </Button>
                                                                                        </DropdownMenuTrigger>
                                                                                        <DropdownMenuContent align="end">
                                                                                            <DropdownMenuItem
                                                                                                onClick={() =>
                                                                                                    setIndicatorModal({
                                                                                                        open: true,
                                                                                                        subCategoryId: subCategory.id.toString(),
                                                                                                        indicator,
                                                                                                        mode: 'edit',
                                                                                                    })
                                                                                                }
                                                                                            >
                                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                                Edit
                                                                                            </DropdownMenuItem>
                                                                                            <DropdownMenuItem
                                                                                                onClick={() =>
                                                                                                    setDeleteDialog({
                                                                                                        open: true,
                                                                                                        type: 'indicator',
                                                                                                        item: indicator,
                                                                                                    })
                                                                                                }
                                                                                                disabled={
                                                                                                    !(indicator as IndicatorWithRelations)
                                                                                                        .can_be_deleted
                                                                                                }
                                                                                                className="text-destructive focus:text-destructive"
                                                                                            >
                                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                                Delete
                                                                                                {!(indicator as IndicatorWithRelations)
                                                                                                    .can_be_deleted && (
                                                                                                    <span className="ml-2 text-xs">
                                                                                                        (Used in assessments)
                                                                                                    </span>
                                                                                                )}
                                                                                            </DropdownMenuItem>
                                                                                        </DropdownMenuContent>
                                                                                    </DropdownMenu>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                                No indicators found
                                                                            </div>
                                                                        )}
                                                                        <div className="border-t p-2">
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="w-full"
                                                                                onClick={() =>
                                                                                    setIndicatorModal({
                                                                                        open: true,
                                                                                        subCategoryId: subCategory.id.toString(),
                                                                                        mode: 'create',
                                                                                    })
                                                                                }
                                                                            >
                                                                                <Plus className="mr-2 h-4 w-4" />
                                                                                Add Indicator
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">No sub-categories found</div>
                                                )}
                                                <div className="border-t p-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() =>
                                                            setSubCategoryModal({ open: true, categoryId: category.id.toString(), mode: 'create' })
                                                        }
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        Add Sub-Category
                                                    </Button>
                                                </div>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {categories.last_page > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing {categories.from} to {categories.to} of {categories.total} results
                                </p>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(categories.links[0].url || '#')}
                                                disabled={categories.current_page === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                        </PaginationItem>
                                        {categories.links.slice(1, -1).map((link, index) => (
                                            <PaginationItem key={index}>
                                                <PaginationLink isActive={link.active} onClick={() => link.url && router.get(link.url)}>
                                                    {link.label}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(categories.links[categories.links.length - 1].url || '#')}
                                                disabled={categories.current_page === categories.last_page}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {categoryModal.open && (
                <CategoryFormModal
                    templateId={templateFilter}
                    category={categoryModal.category}
                    open={categoryModal.open}
                    onOpenChange={(open) => setCategoryModal({ ...categoryModal, open })}
                    mode={categoryModal.mode}
                />
            )}

            {subCategoryModal.open && subCategoryModal.categoryId && (
                <SubCategoryFormModal
                    categoryId={subCategoryModal.categoryId}
                    subCategory={subCategoryModal.subCategory}
                    open={subCategoryModal.open}
                    onOpenChange={(open) => setSubCategoryModal({ ...subCategoryModal, open })}
                    mode={subCategoryModal.mode}
                />
            )}

            {indicatorModal.open && indicatorModal.subCategoryId && (
                <IndicatorFormModal
                    subCategoryId={indicatorModal.subCategoryId}
                    indicator={indicatorModal.indicator}
                    open={indicatorModal.open}
                    onOpenChange={(open) => setIndicatorModal({ ...indicatorModal, open })}
                    mode={indicatorModal.mode}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                            Confirm Delete
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteDialog.type === 'category' && deleteDialog.childrenCount ? (
                                <>
                                    <p className="font-semibold">This action will delete the category and all its children:</p>
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                                        <li>{deleteDialog.childrenCount.subCategories || 0} Sub-Categories</li>
                                        <li>{deleteDialog.childrenCount.indicators || 0} Indicators</li>
                                    </ul>
                                    <p className="mt-2 text-destructive">This action cannot be undone.</p>
                                </>
                            ) : deleteDialog.type === 'subcategory' && deleteDialog.childrenCount ? (
                                <>
                                    <p className="font-semibold">This action will delete the sub-category and all its indicators:</p>
                                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                                        <li>{deleteDialog.childrenCount.indicators || 0} Indicators</li>
                                    </ul>
                                    <p className="mt-2 text-destructive">This action cannot be undone.</p>
                                </>
                            ) : (
                                <>Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.</>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
