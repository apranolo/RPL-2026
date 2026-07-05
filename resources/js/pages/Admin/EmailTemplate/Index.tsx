import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Email Template',
        href: '/admin/email-templates',
    },
];

export default function Index({ emailTemplates }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Template" />

            <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Email Template Management</h1>
                        <p className="text-sm text-muted-foreground">Kelola template email sistem.</p>
                    </div>

                    <Button>Tambah Template</Button>
                </div>

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
                                            <Button variant="outline" size="sm">
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
        </AppLayout>
    );
}
