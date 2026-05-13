import CategoryFormModal from '@/components/Admin/Templates/CategoryFormModal';
import EssayQuestionFormModal from '@/components/Admin/Templates/EssayQuestionFormModal';
import IndicatorFormModal from '@/components/Admin/Templates/IndicatorFormModal';
import SubCategoryFormModal from '@/components/Admin/Templates/SubCategoryFormModal';
import { CategoryItem, EssayItem, IndicatorItem, SortableItem, SubCategoryItem } from '@/components/Admin/Templates/TreeItems';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { AccreditationTemplate, EssayQuestion, EvaluationCategory, EvaluationIndicator, EvaluationSubCategory } from '@/types/assessment';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Layers3, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface TreeItem {
    id: string; // "category-1"
    type: 'category' | 'sub_category' | 'indicator' | 'essay';
    data: EvaluationCategory | EvaluationSubCategory | EvaluationIndicator | EssayQuestion;
    children?: TreeItem[];
}

interface Props {
    template: AccreditationTemplate;
    structuredTree: TreeItem[];
}

export default function TemplateTree({ template, structuredTree }: Props) {
    const [treeData, setTreeData] = useState<TreeItem[]>(structuredTree);
    const [counts, setCounts] = useState({
        categoryCount: 0,
        subCategoryCount: 0,
        indicatorCount: 0,
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        route?: string;
        itemName?: string;
    }>({ open: false });

    // Modal States
    const [categoryModal, setCategoryModal] = useState<{
        open: boolean;
        item?: EvaluationCategory;
    }>({ open: false });
    const [subModal, setSubModal] = useState<{
        open: boolean;
        catId?: string;
        item?: EvaluationSubCategory;
    }>({ open: false });
    const [indicatorModal, setIndModal] = useState<{
        open: boolean;
        subId?: string;
        item?: EvaluationIndicator;
    }>({ open: false });
    const [essayModal, setEssayModal] = useState<{
        open: boolean;
        catId?: string;
        item?: EssayQuestion;
    }>({ open: false });

    // Type guards
    const isCategory = (data: TreeItem['data']): data is EvaluationCategory => 'template_id' in data;
    const isSubCategory = (data: TreeItem['data']): data is EvaluationSubCategory => 'category_id' in data && 'indicators' in data;
    const isIndicator = (data: TreeItem['data']): data is EvaluationIndicator => 'answer_type' in data;
    const isEssayQuestion = (data: TreeItem['data']): data is EssayQuestion => 'question' in data && 'guidance' in data;

    const updateCounts = useCallback((data: TreeItem[]) => {
        let categoryCount = 0;
        let subCategoryCount = 0;
        let indicatorCount = 0;

        data.forEach((cat) => {
            categoryCount++;
            cat.children?.forEach((child) => {
                if (child.type === 'sub_category') {
                    subCategoryCount++;
                    indicatorCount += child.children?.filter((c) => c.type === 'indicator').length || 0;
                }
            });
        });

        setCounts({ categoryCount, subCategoryCount, indicatorCount });
    }, []);

    useEffect(() => {
        setTreeData(structuredTree);
        updateCounts(structuredTree);
    }, [structuredTree, updateCounts]);

    useEffect(() => {
        updateCounts(treeData);
    }, [treeData, updateCounts]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // --- Helpers ---
    const getItemsIds = (items: TreeItem[]) => items.map((i) => i.id);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        // Determine hierarchy level based on ID prefix without being affected by hyphens in the rest of the ID
        const activeId = String(active.id);
        const type = activeId.startsWith('category-')
            ? 'category'
            : activeId.startsWith('sub-')
              ? 'sub'
              : activeId.startsWith('indicator-')
                ? 'indicator'
                : activeId.startsWith('essay-')
                  ? 'essay'
                  : '';

        // Optimistic Update & API Call
        let newTree = [...treeData];
        let moved = false;
        let routeName = '';
        let itemsToReorder: number[] = [];

        if (type === 'category') {
            const oldIndex = treeData.findIndex((i) => i.id === active.id);
            const newIndex = treeData.findIndex((i) => i.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                newTree = arrayMove(treeData, oldIndex, newIndex);
                itemsToReorder = newTree.map((i) => i.data.id);
                routeName = 'admin.categories.reorder';
                moved = true;
            }
        } else if (type === 'sub') {
            // Find parent category of the sub-category
            for (const cat of newTree) {
                const subs = cat.children?.filter((c: TreeItem) => c.type === 'sub_category') || [];
                const oldIndex = subs.findIndex((i: TreeItem) => i.id === active.id);
                const newIndex = subs.findIndex((i: TreeItem) => i.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newSubs = arrayMove(subs, oldIndex, newIndex);
                    // Replace subs in children (keeping essays)
                    const essays = cat.children?.filter((c: TreeItem) => c.type === 'essay') || [];
                    cat.children = [...newSubs, ...essays]; // Rebuild children using only sub_category and essay items; additional child types under a category (if introduced) are not handled here.
                    itemsToReorder = newSubs.map((i: TreeItem) => i.data.id);
                    routeName = 'admin.sub-categories.reorder';
                    moved = true;
                    break;
                }
            }
        } else if (type === 'essay') {
            // Find parent category
            for (const cat of newTree) {
                const essays = cat.children?.filter((c: TreeItem) => c.type === 'essay') || [];
                const oldIndex = essays.findIndex((i: TreeItem) => i.id === active.id);
                const newIndex = essays.findIndex((i: TreeItem) => i.id === over.id);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newEssays = arrayMove(essays, oldIndex, newIndex);
                    const subs = cat.children?.filter((c: TreeItem) => c.type === 'sub_category') || [];
                    cat.children = [...subs, ...newEssays];
                    itemsToReorder = newEssays.map((i: TreeItem) => i.data.id);
                    routeName = 'admin.essays.reorder';
                    moved = true;
                    break;
                }
            }
        } else if (type === 'indicator') {
            // Deep search for sub-category
            for (const cat of newTree) {
                const subs = cat.children?.filter((c: TreeItem) => c.type === 'sub_category') || [];
                for (const sub of subs) {
                    const indicators = sub.children || [];
                    const oldIndex = indicators.findIndex((i: TreeItem) => i.id === active.id);
                    const newIndex = indicators.findIndex((i: TreeItem) => i.id === over.id);

                    if (oldIndex !== -1 && newIndex !== -1) {
                        const newInds = arrayMove(indicators, oldIndex, newIndex);
                        sub.children = newInds;
                        itemsToReorder = newInds.map((i: TreeItem) => i.data.id);
                        routeName = 'admin.indicators.reorder';
                        moved = true;
                        break;
                    }
                }
                if (moved) break;
            }
        }

        if (moved) {
            setTreeData(newTree); // Optimistic

            // API Call
            if (routeName) {
                router.post(
                    route(routeName),
                    {
                        items: itemsToReorder.map((id) => ({ id: id, sort_order: 0 })), // Backend infers order from array index; sort_order is a placeholder field
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => toast.success('Order updated'),
                        onError: () => {
                            toast.error('Failed to update order');
                            setTreeData(structuredTree); // Revert
                        },
                    },
                );
            }
        }
    };

    const handleDelete = (routeUrl: string, itemName: string) => {
        setDeleteDialog({ open: true, route: routeUrl, itemName });
    };

    const confirmDelete = () => {
        if (!deleteDialog.route) return;
        router.delete(deleteDialog.route, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Item deleted successfully');
                setDeleteDialog({ open: false });
            },
            onError: () => {
                toast.error('Failed to delete item');
            },
        });
    };

    const breadcrumbs = [
        { title: 'Templates', href: route('admin.templates.index') },
        { title: template.name, href: route('admin.templates.show', template.id) },
        { title: 'Structure', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Structure - ${template.name}`} />

            <div className="flex h-full flex-col space-y-4 p-4 pb-20 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Template Structure</h2>
                        <p className="text-sm text-muted-foreground">
                            Drag and drop to reorder. Configure categories, sub-categories, and indicators.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => router.visit(route('admin.templates.index'))}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => setCategoryModal({ open: true })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    </div>
                </div>

                {/* Summary Counts */}
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                    <CardContent className="flex items-center gap-6 p-4">
                        <div className="flex items-center gap-2">
                            <Layers3 className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-foreground">Structure Summary:</span>
                        </div>
                        <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:gap-4">
                            <div>
                                <span className="font-semibold" style={{ color: 'var(--chart-1)' }}>
                                    {counts.categoryCount}
                                </span>
                                <span className="ml-1 text-muted-foreground">Unsur</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <div>
                                <span className="font-semibold" style={{ color: 'var(--chart-2)' }}>
                                    {counts.subCategoryCount}
                                </span>
                                <span className="ml-1 text-muted-foreground">Sub Unsur</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <div>
                                <span className="font-semibold" style={{ color: 'var(--chart-5)' }}>
                                    {counts.indicatorCount}
                                </span>
                                <span className="ml-1 text-muted-foreground">Indikator</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                    <SortableContext items={getItemsIds(treeData)} strategy={verticalListSortingStrategy}>
                        {treeData.map((categoryNode) => {
                            const catData = isCategory(categoryNode.data) ? categoryNode.data : null;
                            if (!catData) return null;

                            const subCategories = categoryNode.children?.filter((x: TreeItem) => x.type === 'sub_category') || [];
                            const essayQuestions = categoryNode.children?.filter((x: TreeItem) => x.type === 'essay') || [];

                            return (
                                <SortableItem key={categoryNode.id} id={categoryNode.id} className="flex flex-row items-start">
                                    <CategoryItem
                                        category={catData}
                                        onEdit={() => setCategoryModal({ open: true, item: catData })}
                                        onDelete={() => handleDelete(route('admin.categories.destroy', catData.id), catData.name)}
                                        onAddSubCategory={() => setSubModal({ open: true, catId: String(catData.id) })}
                                        onAddEssay={() => setEssayModal({ open: true, catId: String(catData.id) })}
                                    >
                                        <div className="ml-1 border-l-2 border-dashed border-gray-200 pl-4">
                                            {/* Sub Categories Context */}
                                            <SortableContext items={getItemsIds(subCategories)} strategy={verticalListSortingStrategy}>
                                                {subCategories.map((subNode: TreeItem) => {
                                                    const subData = isSubCategory(subNode.data) ? subNode.data : null;
                                                    if (!subData) return null;
                                                    return (
                                                        <SortableItem key={subNode.id} id={subNode.id} className="mb-2 flex flex-row items-start">
                                                            <SubCategoryItem
                                                                subCategory={subData}
                                                                onEdit={() => setSubModal({ open: true, catId: String(catData.id), item: subData })}
                                                                onDelete={() =>
                                                                    handleDelete(route('admin.sub-categories.destroy', subData.id), subData.name)
                                                                }
                                                                onAddIndicator={() => setIndModal({ open: true, subId: String(subData.id) })}
                                                            >
                                                                {/* Indicators Context */}
                                                                <SortableContext
                                                                    items={getItemsIds(subNode.children || [])}
                                                                    strategy={verticalListSortingStrategy}
                                                                >
                                                                    <div className="grid gap-2">
                                                                        {subNode.children?.map((indNode: TreeItem) => {
                                                                            const indData = isIndicator(indNode.data) ? indNode.data : null;
                                                                            if (!indData) return null;
                                                                            return (
                                                                                <SortableItem
                                                                                    key={indNode.id}
                                                                                    id={indNode.id}
                                                                                    className="flex flex-row items-center"
                                                                                >
                                                                                    <IndicatorItem
                                                                                        indicator={indData}
                                                                                        onEdit={() =>
                                                                                            setIndModal({
                                                                                                open: true,
                                                                                                subId: String(subData.id),
                                                                                                item: indData,
                                                                                            })
                                                                                        }
                                                                                        onDelete={() =>
                                                                                            handleDelete(
                                                                                                route('admin.indicators.destroy', indData.id),
                                                                                                indData.question,
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </SortableItem>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </SortableContext>
                                                                {(!subNode.children || subNode.children.length === 0) && (
                                                                    <div className="py-2 text-xs text-muted-foreground italic">
                                                                        No indicators yet.
                                                                    </div>
                                                                )}
                                                            </SubCategoryItem>
                                                        </SortableItem>
                                                    );
                                                })}
                                            </SortableContext>

                                            {/* Essays Context */}
                                            <SortableContext items={getItemsIds(essayQuestions)} strategy={verticalListSortingStrategy}>
                                                {essayQuestions.length > 0 && (
                                                    <div className="mt-4 mb-2 text-sm font-semibold text-blue-800">Essay Questions</div>
                                                )}
                                                {essayQuestions.map((essayNode: TreeItem) => {
                                                    const essayData = isEssayQuestion(essayNode.data) ? essayNode.data : null;
                                                    if (!essayData) return null;
                                                    return (
                                                        <SortableItem key={essayNode.id} id={essayNode.id} className="flex flex-row items-start">
                                                            <EssayItem
                                                                essay={essayData}
                                                                onEdit={() =>
                                                                    setEssayModal({ open: true, catId: String(catData.id), item: essayData })
                                                                }
                                                                onDelete={() =>
                                                                    handleDelete(route('admin.essays.destroy', essayData.id), essayData.question)
                                                                }
                                                            />
                                                        </SortableItem>
                                                    );
                                                })}
                                            </SortableContext>
                                        </div>
                                    </CategoryItem>
                                </SortableItem>
                            );
                        })}
                    </SortableContext>
                </DndContext>

                {treeData.length === 0 && (
                    <div className="rounded-lg border-2 border-dashed py-12 text-center">
                        <p className="mb-4 text-muted-foreground">No categories defined yet.</p>
                        <Button onClick={() => setCategoryModal({ open: true })}>Add First Category</Button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CategoryFormModal
                open={categoryModal.open}
                onOpenChange={(v) => setCategoryModal({ ...categoryModal, open: v })}
                mode={categoryModal.item ? 'edit' : 'create'}
                category={categoryModal.item}
                templateId={String(template.id)}
            />
            {subModal.catId && (
                <SubCategoryFormModal
                    open={subModal.open}
                    onOpenChange={(v) => setSubModal({ ...subModal, open: v })}
                    mode={subModal.item ? 'edit' : 'create'}
                    subCategory={subModal.item}
                    categoryId={subModal.catId}
                />
            )}
            {indicatorModal.subId && (
                <IndicatorFormModal
                    open={indicatorModal.open}
                    onOpenChange={(v) => setIndModal({ ...indicatorModal, open: v })}
                    mode={indicatorModal.item ? 'edit' : 'create'}
                    indicator={indicatorModal.item}
                    subCategoryId={indicatorModal.subId}
                />
            )}
            {essayModal.catId && (
                <EssayQuestionFormModal
                    open={essayModal.open}
                    onOpenChange={(v) => setEssayModal({ ...essayModal, open: v })}
                    mode={essayModal.item ? 'edit' : 'create'}
                    essay={essayModal.item}
                    categoryId={essayModal.catId}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(v) => setDeleteDialog({ ...deleteDialog, open: v })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteDialog.itemName}"</span>? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
