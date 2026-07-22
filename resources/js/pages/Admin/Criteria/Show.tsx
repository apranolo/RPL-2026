import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Paperclip } from 'lucide-react';

interface Criterion {
    id: number;
    code: string;
    question: string;
    description?: string;
    weight: number;
    answer_type: 'boolean' | 'scale' | 'text';
    answer_type_label: string;
    requires_attachment: boolean;
    sort_order?: number;
    is_active: boolean;
    sub_category?: {
        id: number;
        name: string;
        category?: {
            id: number;
            name: string;
            template?: {
                id: number;
                name: string;
            };
        };
    };
    created_at?: string;
    updated_at?: string;
}

interface Props {
    criterion: Criterion;
}

export default function CriteriaShow({ criterion }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Kriteria Penilaian',
            href: '/admin/criteria',
        },
        {
            title: `Detail Kriteria - ${criterion.code}`,
            href: `/admin/criteria/${criterion.id}`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Kriteria - ${criterion.code}`} />

            <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
                {/* Header Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Detail Kriteria</h1>
                        <p className="mt-1 text-muted-foreground">Detail parameter kriteria penilaian rubrik proposal.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin/criteria">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <Link href={`/admin/criteria/${criterion.id}/edit`}>
                            <Button size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Kriteria
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="border-border bg-card/60 shadow-md backdrop-blur-sm">
                    <CardHeader className="border-b border-border bg-muted/20 pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <span className="mb-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {criterion.code}
                                </span>
                                <CardTitle className="text-xl">{criterion.question}</CardTitle>
                                {criterion.description && (
                                    <CardDescription className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                                        {criterion.description}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        {/* Detail Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Bobot Nilai</h4>
                                    <p className="mt-1 text-lg font-bold text-foreground">{criterion.weight}%</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Tipe Jawaban</h4>
                                    <p className="mt-1 text-foreground capitalize">{criterion.answer_type_label}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Wajib Lampiran Dokumen</h4>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Paperclip
                                            className={`h-4 w-4 ${criterion.requires_attachment ? 'text-primary' : 'text-muted-foreground'}`}
                                        />
                                        <p className="text-foreground">
                                            {criterion.requires_attachment ? 'Ya, wajib mengunggah bukti lampiran' : 'Tidak wajib'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Hierarki Kriteria</h4>
                                    <div className="mt-1 space-y-1 text-sm">
                                        {criterion.sub_category ? (
                                            <>
                                                <p className="font-medium text-foreground">
                                                    Sub-Kategori:{' '}
                                                    <span className="font-normal text-muted-foreground">{criterion.sub_category.name}</span>
                                                </p>
                                                {criterion.sub_category.category && (
                                                    <p className="font-medium text-foreground">
                                                        Kategori:{' '}
                                                        <span className="font-normal text-muted-foreground">
                                                            {criterion.sub_category.category.name}
                                                        </span>
                                                    </p>
                                                )}
                                                {criterion.sub_category.category?.template && (
                                                    <p className="font-medium text-foreground">
                                                        Template Rubrik:{' '}
                                                        <span className="font-normal text-muted-foreground">
                                                            {criterion.sub_category.category.template.name}
                                                        </span>
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground">Tidak terikat ke sub-kategori manapun</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Status Keaktifan</h4>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span
                                            className={`h-2 w-2 rounded-full ${criterion.is_active ? 'animate-pulse bg-green-500' : 'bg-gray-400'}`}
                                        />
                                        <p className="font-medium text-foreground">{criterion.is_active ? 'Aktif' : 'Non-aktif'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Urutan</h4>
                                    <p className="mt-1 font-mono text-foreground">{criterion.sort_order ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
