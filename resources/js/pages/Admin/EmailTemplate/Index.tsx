/**
 * EmailTemplate Index Component
 *
 * @description
 * Halaman daftar manajemen template email sistem.
 * Super Admin dapat melihat dan mengedit semua template email yang tersedia.
 *
 * @features
 * - Tabel daftar template email
 * - Badge status aktif/nonaktif
 * - Badge event trigger
 * - Badge variabel template
 * - Modal edit template (subject, body, is_active)
 * - Form update terhubung ke PUT /admin/email-template/{id}
 * - Flash message sukses/gagal
 *
 * @route GET /admin/email-template
 * @route PUT /admin/email-template/{emailTemplate}
 *
 * @author JurnalMU Team
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface EmailTemplate {
    id: number;
    journal_id?: number | null;
    name: string;
    event_trigger: string;
    subject: string;
    body_content: string;
    variables: string[];
    description?: string;
    is_active: boolean;
}

interface Props {
    emailTemplates: EmailTemplate[];
}

interface PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Email Template',
        href: '/admin/email-template',
    },
];

export default function Index({ emailTemplates }: Props) {
    const { flash } = usePage<PageProps>().props;

    const [editOpen, setEditOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: '',
        event_trigger: '',
        subject: '',
        body: '',
        description: '',
        is_active: true as boolean,
    });

    // Flash message handling
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const openEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template);
        setData({
            name: template.name,
            event_trigger: template.event_trigger,
            subject: template.subject,
            body: template.body_content,
            description: template.description ?? '',
            is_active: template.is_active,
        });
        setEditOpen(true);
    };

    const closeEdit = () => {
        setEditOpen(false);
        setSelectedTemplate(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplate) return;

        put(route('email-template.update', selectedTemplate.id), {
            onSuccess: () => {
                closeEdit();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Template" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Email Template Management</h1>
                        <p className="text-sm text-muted-foreground">Kelola template email sistem.</p>
                    </div>
                </div>

                {/* Tabel */}
                <div className="rounded-lg border bg-background">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Trigger</TableHead>
                                <TableHead>Variables</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {emailTemplates.length > 0 ? (
                                emailTemplates.map((template) => (
                                    <TableRow key={template.id}>
                                        <TableCell className="font-medium">{template.name}</TableCell>

                                        <TableCell>
                                            <Badge variant="outline">{template.event_trigger}</Badge>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {template.variables?.length ? (
                                                    template.variables.map((variable) => (
                                                        <Badge key={variable} variant="secondary" className="bg-secondary">
                                                            {variable}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>{template.subject}</TableCell>

                                        <TableCell>
                                            <Badge variant={template.is_active ? 'default' : 'secondary'}>
                                                {template.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => openEdit(template)}>
                                                <Pencil className="mr-1 h-3 w-3" />
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center">
                                        Belum ada template email.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Modal Edit Template */}
            <Dialog
                open={editOpen}
                onOpenChange={(open) => {
                    if (!open) closeEdit();
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Email Template</DialogTitle>
                        <DialogDescription>Perbarui isi template email. Gunakan variabel yang tersedia di dalam body.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nama */}
                        <div className="space-y-1">
                            <Label htmlFor="et-name">Nama Template</Label>
                            <Input id="et-name" value={data.name} onChange={(e) => setData('name', e.target.value)} disabled={processing} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        {/* Event Trigger */}
                        <div className="space-y-1">
                            <Label htmlFor="et-trigger">Event Trigger</Label>
                            <Input
                                id="et-trigger"
                                value={data.event_trigger}
                                onChange={(e) => setData('event_trigger', e.target.value)}
                                disabled={processing}
                            />
                            {errors.event_trigger && <p className="text-sm text-destructive">{errors.event_trigger}</p>}
                        </div>

                        {/* Subject */}
                        <div className="space-y-1">
                            <Label htmlFor="et-subject">Subject Email</Label>
                            <Input id="et-subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} disabled={processing} />
                            {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                        </div>

                        {/* Body */}
                        <div className="space-y-1">
                            <Label htmlFor="et-body">Isi Email (Body)</Label>
                            {selectedTemplate?.variables?.length ? (
                                <p className="text-xs text-muted-foreground">
                                    Variabel tersedia:{' '}
                                    {selectedTemplate.variables.map((v) => (
                                        <code key={v} className="mr-1 rounded bg-muted px-1 py-0.5 text-xs">
                                            {`{{${v}}}`}
                                        </code>
                                    ))}
                                </p>
                            ) : null}
                            <Textarea
                                id="et-body"
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                rows={8}
                                disabled={processing}
                                className="font-mono text-sm"
                            />
                            {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
                        </div>

                        {/* Deskripsi */}
                        <div className="space-y-1">
                            <Label htmlFor="et-desc">Deskripsi (opsional)</Label>
                            <Input
                                id="et-desc"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                disabled={processing}
                            />
                            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                        </div>

                        {/* Status */}
                        <div className="space-y-1">
                            <Label htmlFor="et-status">Status</Label>
                            <Select
                                value={data.is_active ? 'true' : 'false'}
                                onValueChange={(val) => setData('is_active', val === 'true')}
                                disabled={processing}
                            >
                                <SelectTrigger id="et-status">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Aktif</SelectItem>
                                    <SelectItem value="false">Nonaktif</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.is_active && <p className="text-sm text-destructive">{errors.is_active}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeEdit} disabled={processing}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
