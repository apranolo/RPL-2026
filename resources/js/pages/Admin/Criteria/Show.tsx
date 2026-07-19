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
            }
        }
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

            <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Detail Kriteria</h1>
                        <p className="text-muted-foreground mt-1">Detail parameter kriteria penilaian rubrik proposal.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin/criteria">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <Link href={`/admin/criteria/${criterion.id}/edit`}>
                            <Button size="sm">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Kriteria
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="border-border bg-card/60 backdrop-blur-sm shadow-md">
                    <CardHeader className="border-b border-border bg-muted/20 pb-4">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
                                    {criterion.code}
                                </span>
                                <CardTitle className="text-xl">{criterion.question}</CardTitle>
                                {criterion.description && (
                                    <CardDescription className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                                        {criterion.description}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Detail Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bobot Nilai</h4>
                                    <p className="text-lg font-bold text-foreground mt-1">{criterion.weight}%</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipe Jawaban</h4>
                                    <p className="text-foreground mt-1 capitalize">{criterion.answer_type_label}</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Wajib Lampiran Dokumen</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Paperclip className={`w-4 h-4 ${criterion.requires_attachment ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <p className="text-foreground">{criterion.requires_attachment ? 'Ya, wajib mengunggah bukti lampiran' : 'Tidak wajib'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hierarki Kriteria</h4>
                                    <div className="mt-1 text-sm space-y-1">
                                        {criterion.sub_category ? (
                                            <>
                                                <p className="text-foreground font-medium">Sub-Kategori: <span className="font-normal text-muted-foreground">{criterion.sub_category.name}</span></p>
                                                {criterion.sub_category.category && (
                                                    <p className="text-foreground font-medium">Kategori: <span className="font-normal text-muted-foreground">{criterion.sub_category.category.name}</span></p>
                                                )}
                                                {criterion.sub_category.category?.template && (
                                                    <p className="text-foreground font-medium">Template Rubrik: <span className="font-normal text-muted-foreground">{criterion.sub_category.category.template.name}</span></p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground">Tidak terikat ke sub-kategori manapun</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status Keaktifan</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`w-2 h-2 rounded-full ${criterion.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        <p className="text-foreground font-medium">{criterion.is_active ? 'Aktif' : 'Non-aktif'}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Urutan</h4>
                                    <p className="text-foreground mt-1 font-mono">{criterion.sort_order ?? 0}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
