import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EvaluationCategory } from '@/types/assessment';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    templateId: string;
    category?: EvaluationCategory;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function CategoryFormModal({ templateId, category, trigger, open, onOpenChange, mode = 'create' }: Props) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        template_id: templateId,
        code: category?.code || '',
        name: category?.name || '',
        description: category?.description || '',
        weight: category?.weight ?? 0,
        display_order: category?.display_order ?? 1,
    });

    useEffect(() => {
        if (category) {
            setData({
                template_id: templateId,
                code: category.code || '',
                name: category.name,
                description: category.description || '',
                weight: category.weight ?? 0,
                display_order: category.display_order ?? 1,
            });
        }
    }, [category, templateId, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && category) {
            put(route('admin.categories.update', category.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Category updated successfully');
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to update category. Please check the form.');
                },
            });
        } else {
            post(route('admin.categories.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Category created successfully');
                    reset();
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to create category. Please check the form.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    <DialogDescription>{isEdit ? 'Update the category name.' : 'Add a new Top-Level Category for this template.'}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. A" required />
                        {errors.code && <span className="text-sm text-red-500">{errors.code}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Manajemen Editorial"
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="weight">Weight (%)</Label>
                            <Input
                                id="weight"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={data.weight}
                                onChange={(e) => setData('weight', parseFloat(e.target.value) || 0)}
                                required
                            />
                            {errors.weight && <span className="text-sm text-red-500">{errors.weight}</span>}
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
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEdit ? 'Update Category' : 'Add Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
