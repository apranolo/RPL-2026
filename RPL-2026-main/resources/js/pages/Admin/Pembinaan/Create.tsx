/**
 * PembinaanCreate Component
 *
 * @description
 * Form page for creating new Pembinaan (Coaching/Training) programs.
 * Super Admin can create programs with registration and assessment periods,
 * optional quota, and link to accreditation templates.
 *
 * @route GET /admin/pembinaan/create
 * @route POST /admin/pembinaan
 *
 * @features
 * - Create new pembinaan program
 * - Category selection (Akreditasi/Indeksasi)
 * - Optional AccreditationTemplate selection
 * - Date pickers for registration and assessment periods
 * - Optional quota limit
 * - Form validation
 *
 * @author JurnalMU Team
 */
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Pembinaan',
        href: '/admin/pembinaan',
    },
    {
        title: 'Create',
        href: '/admin/pembinaan/create',
    },
];

interface AccreditationTemplate {
    id: number;
    name: string;
    type: string;
}

interface Props {
    templates: AccreditationTemplate[];
}

export default function PembinaanCreate({ templates }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        category: '' as 'akreditasi' | 'indeksasi' | '',
        accreditation_template_id: '' as string,
        registration_start: '',
        registration_end: '',
        assessment_start: '',
        assessment_end: '',
        quota: '' as string,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.pembinaan.store'), {
            onSuccess: () => {
                toast.success('Pembinaan program created successfully');
            },
            onError: () => {
                toast.error('Failed to create program. Please check the form for errors.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Pembinaan Program" />

            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="space-y-3">
                    <Button variant="ghost" size="sm" className="h-auto gap-2 p-0" asChild>
                        <Link href={route('admin.pembinaan.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to List
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Create Pembinaan Program</h1>
                        <p className="mt-2 text-base text-muted-foreground">Set up a new coaching or training program</p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Program Information</CardTitle>
                        <CardDescription>Fill in the details for the new pembinaan program</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information */}
                            <div className="space-y-6 border-b pb-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Basic Information</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Program name, category, and optional template</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Program Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Pembinaan Akreditasi SINTA 1-3"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Program description and objectives..."
                                        rows={4}
                                        className={errors.description ? 'border-destructive' : ''}
                                    />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">
                                            Category <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={data.category}
                                            onValueChange={(value: 'akreditasi' | 'indeksasi') => setData('category', value)}
                                        >
                                            <SelectTrigger id="category" className={errors.category ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="akreditasi">Akreditasi</SelectItem>
                                                <SelectItem value="indeksasi">Indeksasi</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="template">Accreditation Template</Label>
                                        <Select
                                            value={data.accreditation_template_id}
                                            onValueChange={(value) => setData('accreditation_template_id', value)}
                                            disabled={!data.category}
                                        >
                                            <SelectTrigger id="template">
                                                <SelectValue placeholder={data.category ? 'Select template' : 'Select category first'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {templates
                                                    .filter((template) => template.type === data.category)
                                                    .map((template) => (
                                                        <SelectItem key={template.id} value={template.id.toString()}>
                                                            {template.name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.accreditation_template_id && (
                                            <p className="text-sm text-destructive">{errors.accreditation_template_id}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Registration Period */}
                            <div className="space-y-6 border-b pb-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Registration Period</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Set when journals can register for this program</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="registration_start">
                                            Start Date <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="registration_start"
                                            type="datetime-local"
                                            value={data.registration_start}
                                            onChange={(e) => setData('registration_start', e.target.value)}
                                            className={errors.registration_start ? 'border-destructive' : ''}
                                        />
                                        {errors.registration_start && <p className="text-sm text-destructive">{errors.registration_start}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="registration_end">
                                            End Date <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="registration_end"
                                            type="datetime-local"
                                            value={data.registration_end}
                                            onChange={(e) => setData('registration_end', e.target.value)}
                                            className={errors.registration_end ? 'border-destructive' : ''}
                                        />
                                        {errors.registration_end && <p className="text-sm text-destructive">{errors.registration_end}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Assessment Period */}
                            <div className="space-y-6 border-b pb-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Assessment Period</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Set when the assessment will be conducted</p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="assessment_start">
                                            Start Date <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="assessment_start"
                                            type="datetime-local"
                                            value={data.assessment_start}
                                            onChange={(e) => setData('assessment_start', e.target.value)}
                                            className={errors.assessment_start ? 'border-destructive' : ''}
                                        />
                                        {errors.assessment_start && <p className="text-sm text-destructive">{errors.assessment_start}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="assessment_end">
                                            End Date <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="assessment_end"
                                            type="datetime-local"
                                            value={data.assessment_end}
                                            onChange={(e) => setData('assessment_end', e.target.value)}
                                            className={errors.assessment_end ? 'border-destructive' : ''}
                                        />
                                        {errors.assessment_end && <p className="text-sm text-destructive">{errors.assessment_end}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Quota */}
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold">Participant Settings</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Configure registration quota and limits</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="quota">Quota (Optional)</Label>
                                    <Input
                                        id="quota"
                                        type="number"
                                        min="1"
                                        value={data.quota}
                                        onChange={(e) => setData('quota', e.target.value)}
                                        placeholder="Leave empty for unlimited"
                                        className={errors.quota ? 'border-destructive' : ''}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Maximum number of journals that can register. Leave empty for unlimited registrations.
                                    </p>
                                    {errors.quota && <p className="text-sm text-destructive">{errors.quota}</p>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 border-t pt-6">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('admin.pembinaan.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Program'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
