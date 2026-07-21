/**
 * CriteriaShow Component
 *
 * @description
 * Detail page for displaying a single Kriteria Penilaian (Assessment Criterion).
 * Super Admin can view full properties, hierarchy, status, and input preview.
 *
 * @route GET /admin/criteria/{criterion}
 *
 * @author JurnalMU Team
 */
import { AnswerTypePreview } from '@/components/DynamicInput';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ClipboardList, Edit, Paperclip } from 'lucide-react';

interface Props {
    criterion: {
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
        } | null;
        created_at?: string;
        updated_at?: string;
    };
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
            title: criterion.code,
            href: `/admin/criteria/${criterion.id}`,
        },
    ];

    const subCat = criterion.sub_category;
    const templateName = subCat?.category?.template?.name || '-';
    const categoryName = subCat?.category?.name || '-';
    const subCategoryName = subCat?.name || '-';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Kriteria ${criterion.code}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Actions Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" size="sm" className="h-auto w-fit gap-2 p-0" asChild>
                        <Link href={route('admin.criteria.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar
                        </Link>
                    </Button>
                    <Link href={route('admin.criteria.edit', criterion.id)}>
                        <Button className="gap-2">
                            <Edit className="h-4 w-4" />
                            Ubah Kriteria
                        </Button>
                    </Link>
                </div>

                {/* Main Card */}
                <Card>
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 border-b pb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Kriteria {criterion.code}</h1>
                                {criterion.is_active ? (
                                    <Badge className="border border-green-500/20 bg-green-500/10 text-green-600">Aktif</Badge>
                                ) : (
                                    <Badge variant="secondary">Non-Aktif</Badge>
                                )}
                            </div>
                            <CardDescription>Detail data kriteria penilaian evaluasi instrumen</CardDescription>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <ClipboardList className="h-6 w-6 text-primary" />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 divide-y pt-6">
                        {/* 1. Klasifikasi */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Klasifikasi Hierarki</h3>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Template</p>
                                    <p className="mt-0.5 text-sm font-semibold text-foreground">{templateName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Kategori</p>
                                    <p className="mt-0.5 text-sm font-semibold text-foreground">{categoryName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Sub-Kategori</p>
                                    <p className="mt-0.5 text-sm font-semibold text-foreground">{subCategoryName}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Detail Data */}
                        <div className="space-y-4 pt-6">
                            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Detail Kriteria</h3>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-muted-foreground">Pertanyaan</p>
                                    <p className="mt-1 text-base leading-relaxed font-medium whitespace-pre-wrap text-foreground">
                                        {criterion.question}
                                    </p>
                                </div>
                                {criterion.description && (
                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-muted-foreground">Deskripsi / Panduan Pengisian</p>
                                        <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-foreground">{criterion.description}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground">Bobot Penilaian</p>
                                    <p className="mt-0.5 font-mono text-xl font-bold text-foreground">{Number(criterion.weight).toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Urutan Tampil</p>
                                    <p className="mt-1 font-mono text-sm text-foreground">{criterion.sort_order ?? 'Otomatis'}</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. Aturan Evaluasi */}
                        <div className="space-y-4 pt-6">
                            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Konfigurasi Pengisian & Lampiran</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">Tipe Jawaban</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Badge variant="secondary" className="text-xs font-semibold capitalize">
                                            {criterion.answer_type_label}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Wajib Unggah Lampiran</p>
                                    <div className="mt-1">
                                        {criterion.requires_attachment ? (
                                            <Badge
                                                variant="outline"
                                                className="gap-1.5 border-amber-500/20 bg-amber-500/10 py-0.5 text-xs text-amber-600"
                                            >
                                                <Paperclip className="h-3 w-3" /> Wajib Unggah
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="py-0.5 text-xs text-muted-foreground">
                                                Tidak Wajib
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Form Input Preview:</p>
                                <AnswerTypePreview answerType={criterion.answer_type} />
                            </div>
                        </div>

                        {/* 4. metadata */}
                        <div className="space-y-2 pt-6 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                                <span>Dibuat pada:</span>
                                <span>{criterion.created_at || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Terakhir diperbarui:</span>
                                <span>{criterion.updated_at || '-'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
