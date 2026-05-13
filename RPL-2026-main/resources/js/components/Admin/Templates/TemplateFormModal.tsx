import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AccreditationTemplate } from '@/types/assessment';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    template?: AccreditationTemplate;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    mode?: 'create' | 'edit';
}

export default function TemplateFormModal({ template, trigger, open, onOpenChange, mode = 'create' }: Props) {
    const isEdit = mode === 'edit';

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: template?.name || '',
        description: template?.description || '',
        version: template?.version || '',
        type: template?.type || 'akreditasi',
        effective_date: template?.effective_date || '',
        is_active: template?.is_active ?? true,
    });

    useEffect(() => {
        if (template) {
            setData({
                name: template.name,
                description: template.description || '',
                version: template.version || '',
                type: template.type,
                effective_date: template.effective_date || '',
                is_active: template.is_active,
            });
        }
    }, [template, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && template) {
            put(route('admin.templates.update', template.id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Template updated successfully');
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to update template. Please check the form.');
                },
            });
        } else {
            post(route('admin.templates.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Template created successfully');
                    reset();
                    onOpenChange?.(false);
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    toast.error('Failed to create template. Please check the form.');
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the details of the accreditation template.' : 'Add a new accreditation template to the system.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Akreditasi Jurnal Nasional 2024"
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
                            <Label htmlFor="version">Version</Label>
                            <Input id="version" value={data.version} onChange={(e) => setData('version', e.target.value)} placeholder="e.g. 1.0" />
                            {errors.version && <span className="text-sm text-red-500">{errors.version}</span>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <Select value={data.type} onValueChange={(val: 'akreditasi' | 'indeksasi') => setData('type', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="akreditasi">Akreditasi</SelectItem>
                                    <SelectItem value="indeksasi">Indeksasi</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <span className="text-sm text-red-500">{errors.type}</span>}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="effective_date">Effective Date</Label>
                        <Input
                            id="effective_date"
                            type="date"
                            value={data.effective_date}
                            onChange={(e) => setData('effective_date', e.target.value)}
                            required
                        />
                        {errors.effective_date && <span className="text-sm text-red-500">{errors.effective_date}</span>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEdit ? 'Update Template' : 'Create Template'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
