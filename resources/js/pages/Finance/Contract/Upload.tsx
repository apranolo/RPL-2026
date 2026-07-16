import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEvent } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { ArrowLeft, Upload as UploadIcon } from 'lucide-react';
import { Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Keuangan',
        href: '/keuangan/dashboard',
    },
    {
        title: 'Kontrak',
        href: '/keuangan/contracts',
    },
    {
        title: 'Unggah Arsip',
        href: '/keuangan/contracts/upload',
    },
];

interface Props {
    contractId: number;
}

export default function Upload({ contractId }: Props) {
    const { flash } = usePage().props as any;
    const form = useForm({
        contract_id: contractId,
        document: null as File | null,
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(route('keuangan.contracts.documents.store'), {
            forceFormData: true,
            onSuccess: () => {
                form.reset('document');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Unggah Arsip Kontrak" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground">Unggah Arsip Kontrak</h1>
                        <p className="text-sm text-muted-foreground">Unggah file PDF kontrak yang telah ditandatangani untuk keperluan arsip.</p>
                    </div>
                    <Link href="/keuangan/dashboard">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Form Unggah Dokumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="document">File PDF Kontrak</Label>
                                <Input
                                    id="document"
                                    type="file"
                                    accept="application/pdf"
                                    onChange={(event) => {
                                        const file = event.target.files?.[0] ?? null;
                                        form.setData('document', file);
                                    }}
                                />
                                {form.errors.document && (
                                    <p className="text-sm text-destructive">{form.errors.document}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Hanya file PDF, maksimal 5MB.</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button type="submit" disabled={form.processing} className="gap-2">
                                    <UploadIcon className="h-4 w-4" />
                                    Unggah Arsip
                                </Button>
                                <span className="text-sm text-muted-foreground">Pastikan dokumen sudah ditandatangani terlebih dahulu.</span>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
