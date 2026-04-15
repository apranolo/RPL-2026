import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EssayQuestion } from '@/types/assessment';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    categoryId: string; // Parent Category ID
    essay?: EssayQuestion;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function EssayQuestionFormModal({ categoryId, essay, trigger, open, onOpenChange, mode = 'create' }: Props) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        category_id: categoryId,
        code: essay?.code || '',
        question: essay?.question || '',
        guidance: essay?.guidance || '',
        max_words: essay?.max_words ?? 500,
        is_required: essay?.is_required ?? false,
        is_active: essay?.is_active ?? true,
        display_order: essay?.display_order ?? 1,
    });

    useEffect(() => {
        if (essay) {
            setData({
                category_id: categoryId,
                code: essay.code || '',
                question: essay.question,
                guidance: essay.guidance || '',
                max_words: essay.max_words ?? 500,
                is_required: essay.is_required ?? false,
                is_active: essay.is_active ?? true,
                display_order: essay.display_order ?? 1,
            });
        }
    }, [essay, categoryId, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && essay) {
            put(route('admin.essays.update', essay.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Essay question updated successfully');
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to update essay question. Please check the form.');
                },
            });
        } else {
            post(route('admin.essays.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Essay question created successfully');
                    reset();
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to create essay question. Please check the form.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Essay Question' : 'Add Essay Question'}</DialogTitle>
                    <DialogDescription>Add an essay/open-ended question to this category.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. ESS-01" required />
                        {errors.code && <span className="text-sm text-red-500">{errors.code}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                            id="question"
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                            placeholder="Enter the essay prompt..."
                            required
                            className="h-24"
                        />
                        {errors.question && <span className="text-sm text-red-500">{errors.question}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="guidance">Guidance/Guidelines</Label>
                        <Textarea
                            id="guidance"
                            value={data.guidance}
                            onChange={(e) => setData('guidance', e.target.value)}
                            placeholder="Optional checking guidelines..."
                        />
                        {errors.guidance && <span className="text-sm text-red-500">{errors.guidance}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="max_words">Max Words</Label>
                            <Input
                                id="max_words"
                                type="number"
                                min="1"
                                max="10000"
                                value={data.max_words}
                                onChange={(e) => setData('max_words', parseInt(e.target.value) || 500)}
                                required
                            />
                            {errors.max_words && <span className="text-sm text-red-500">{errors.max_words}</span>}
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

                    <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_required" checked={data.is_required} onCheckedChange={(checked) => setData('is_required', !!checked)} />
                            <Label htmlFor="is_required" className="text-sm font-normal">
                                Required
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                            <Label htmlFor="is_active" className="text-sm font-normal">
                                Active
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEdit ? 'Update Essay' : 'Add Essay'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
