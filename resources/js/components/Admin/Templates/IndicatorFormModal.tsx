import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EvaluationIndicator } from '@/types/assessment';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    subCategoryId: string;
    indicator?: EvaluationIndicator;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function IndicatorFormModal({ subCategoryId, indicator, trigger, open, onOpenChange, mode = 'create' }: Props) {
    const isEdit = mode === 'edit';

    // AnswerType was defined here previously but is unused — removed to satisfy ESLint

    // Match StoreIndicatorRequest validation fields exactly
    const { data, setData, post, put, processing, errors, reset } = useForm({
        sub_category_id: subCategoryId,
        code: indicator?.code || '',
        question: indicator?.question || '',
        description: indicator?.description || '',
        weight: indicator?.weight ?? 1,
        answer_type: indicator?.answer_type || 'boolean',
        requires_attachment: indicator?.requires_attachment ?? false,
        sort_order: indicator?.sort_order ?? 1,
        is_active: indicator?.is_active ?? true,
    });

    useEffect(() => {
        if (indicator) {
            setData({
                sub_category_id: subCategoryId,
                code: indicator.code || '',
                question: indicator.question || '',
                description: indicator.description || '',
                weight: indicator.weight ?? 1,
                answer_type: indicator.answer_type || 'boolean',
                requires_attachment: indicator.requires_attachment ?? false,
                sort_order: indicator.sort_order ?? 1,
                is_active: indicator.is_active ?? true,
            });
        }
    }, [indicator, subCategoryId, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && indicator) {
            put(route('admin.indicators.update', indicator.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Indicator updated successfully');
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to update indicator. Please check the form.');
                },
            });
        } else {
            post(route('admin.indicators.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Indicator created successfully');
                    reset();
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to create indicator. Please check the form.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Indicator' : 'Add Indicator'}</DialogTitle>
                    <DialogDescription>Define the assessment indicator and its evaluation criteria.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Code</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="e.g. A.1.1" required />
                        {errors.code && <span className="text-sm text-red-500">{errors.code}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="question">Question/Statement</Label>
                        <Textarea
                            id="question"
                            value={data.question}
                            onChange={(e) => setData('question', e.target.value)}
                            placeholder="e.g. Jurnal terbit tepat waktu sesuai jadwal yang ditetapkan"
                            required
                        />
                        {errors.question && <span className="text-sm text-red-500">{errors.question}</span>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description (Guidelines)</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Explain how to assess this indicator..."
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
                            <Label htmlFor="answer_type">Answer Type</Label>
                            <Select value={data.answer_type} onValueChange={(val: 'boolean' | 'scale' | 'text') => setData('answer_type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                                    <SelectItem value="scale">Scale (1-5)</SelectItem>
                                    <SelectItem value="text">Text (Essay)</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.answer_type && <span className="text-sm text-red-500">{errors.answer_type}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="sort_order">Sort Order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min="1"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 1)}
                                required
                            />
                            {errors.sort_order && <span className="text-sm text-red-500">{errors.sort_order}</span>}
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Checkbox
                                id="requires_attachment"
                                checked={data.requires_attachment}
                                onCheckedChange={(checked) => setData('requires_attachment', !!checked)}
                            />
                            <Label htmlFor="requires_attachment" className="text-sm font-normal">
                                Requires Attachment
                            </Label>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', !!checked)} />
                        <Label htmlFor="is_active" className="text-sm font-normal">
                            Active
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEdit ? 'Update Indicator' : 'Add Indicator'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
