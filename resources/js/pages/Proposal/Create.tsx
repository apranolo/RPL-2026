/**
 * Proposal/Create — Dosen
 *
 * @description
 * Formulir pengajuan proposal penelitian baru bagi Dosen.
 *
 * @features
 * - Input judul, deskripsi/abstrak proposal
 * - Pilihan skema penelitian (ResearchSchema)
 * - Unggah dokumen proposal (PDF/DOC/DOCX max 10MB, wajib jika Submit, opsional jika Draf)
 * - Tombol opsi: "Simpan sebagai Draf" (Draft) dan "Kirim Proposal" (Submit)
 * - Penanganan validasi error realtime via useForm Inertia
 *
 * @route GET /proposal/create
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
import { ArrowLeft, Save, Send } from 'lucide-react';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Proposal Penelitian', href: route('proposal.index') },
    { title: 'Ajukan Proposal', href: route('proposal.create') },
];

interface SchemaOption {
    id: number;
    name: string;
    description?: string;
    max_funding?: number;
}

interface CreateProps {
    schemas: SchemaOption[];
}

export default function Create({ schemas }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        research_schema_id: '',
        file_dokumen_proposal: null as File | null,
        action: 'submit',
    });

    const handleSubmit = (actionType: 'draft' | 'submit') => {
        if (actionType === 'submit') {
            if (!confirm('Apakah Anda yakin ingin mengajukan proposal ini secara resmi?')) {
                return;
            }
        }

        // Post form data with selected action
        post(route('proposal.store'), {
            data: {
                ...data,
                action: actionType,
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ajukan Proposal Penelitian Baru" />

            <div className="container mx-auto max-w-3xl p-4 sm:p-6 space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('proposal.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Formulir Pengajuan Proposal</h1>
                        <p className="text-sm text-muted-foreground">
                            Lengkapi data di bawah ini. Anda dapat menyimpan sebagai draf atau langsung mengirimkan proposal.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Proposal</CardTitle>
                        <CardDescription>
                            Isi judul, deskripsi, dan pilih skema penelitian yang sesuai.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            {/* Judul Proposal */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Proposal <span className="text-destructive">*</span></Label>
                                <Input
                                    id="title"
                                    placeholder="Masukkan judul proposal penelitian..."
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title}</p>
                                )}
                            </div>

                            {/* Skema Penelitian */}
                            <div className="space-y-2">
                                <Label htmlFor="research_schema_id">Skema Penelitian <span className="text-destructive">*</span></Label>
                                <Select
                                    value={data.research_schema_id}
                                    onValueChange={(val) => setData('research_schema_id', val)}
                                >
                                    <SelectTrigger className={errors.research_schema_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Pilih Skema Penelitian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schemas && schemas.length > 0 ? (
                                            schemas.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>
                                                Tidak ada skema aktif
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.research_schema_id && (
                                    <p className="text-sm text-destructive">{errors.research_schema_id}</p>
                                )}
                            </div>

                            {/* Deskripsi Proposal */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi / Ringkasan <span className="text-destructive">*</span></Label>
                                <Textarea
                                    id="description"
                                    rows={5}
                                    placeholder="Tuliskan gambaran umum, latar belakang, dan tujuan penelitian..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="file_dokumen_proposal">
                                    Dokumen Proposal (PDF/DOCX, Maks. 10MB)
                                    <span className="text-xs text-muted-foreground ml-1 font-normal">
                                        (Wajib jika langsung Kirim Proposal, opsional untuk Draf)
                                    </span>
                                </Label>
                                <div className="flex items-center space-x-3">
                                    <Input
                                        id="file_dokumen_proposal"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setData('file_dokumen_proposal', e.target.files?.[0] || null)}
                                        className={errors.file_dokumen_proposal ? 'border-destructive' : ''}
                                    />
                                </div>
                                {errors.file_dokumen_proposal && (
                                    <p className="text-sm text-destructive">{errors.file_dokumen_proposal}</p>
                                )}
                            </div>

                            {/* Action Buttons: Draf vs Kirim */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t">
                                <Link href={route('proposal.index')}>
                                    <Button type="button" variant="ghost" className="w-full sm:w-auto">
                                        Batal
                                    </Button>
                                </Link>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={processing}
                                    onClick={() => handleSubmit('draft')}
                                    className="w-full sm:w-auto"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan sebagai Draf
                                </Button>

                                <Button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleSubmit('submit')}
                                    className="w-full sm:w-auto"
                                >
                                    <Send className="mr-2 h-4 w-4" />
                                    Kirim Proposal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
