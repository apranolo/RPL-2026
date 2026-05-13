import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EvaluationSubCategory } from '@/types/assessment';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    categoryId: string; // Parent Category ID
    subCategory?: EvaluationSubCategory;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function SubCategoryFormModal({ categoryId, subCategory, trigger, open, onOpenChange, mode = 'create' }: Props) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        category_id: categoryId,
        code: subCategory?.code || '',
        name: subCategory?.name || '',
        description: subCategory?.description || '',
        display_order: subCategory?.display_order ?? 1,
    });

    useEffect(() => {
        if (subCategory) {
            setData({
                category_id: categoryId,
                code: subCategory.code || '',
                name: subCategory.name,
                description: subCategory.description || '',
                display_order: subCategory.display_order ?? 1,
            });
        }
    }, [subCategory, categoryId, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && subCategory) {
            put(route('admin.sub-categories.update', subCategory.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Sub-category updated successfully');
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to update sub-category. Please check the form.');
                },
            });
        } else {
            post(route('admin.sub-categories.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Sub-category created successfully');
                    reset();
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to create sub-category. Please check the form.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Sub-Category' : 'Add Sub-Category'}</DialogTitle>
                    <DialogDescription>Sub-categories group indicators under a category.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. A.1" required />
                        {errors.code && <span className="text-sm text-red-500">{errors.code}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Efektivitas Pengelolaan"
                            required
                        />
                        {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Optional description"
                        />
                        {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="display_order">Display Order</Label>
                        <Input
                            id="display_order"
                            type="number"
                            min="1"
                            value={data.display_order}
                            onChange={(e) => setData('display_order', parseInt(e.target.value) || 1)}
                            required
                        />
                        {errors.display_order && <span className="text-sm text-red-500">{errors.display_order}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEdit ? 'Update Sub-Category' : 'Add Sub-Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
