/**
 * Proposal/Edit — Dosen
 *
 * @description
 * Formulir pengubahan proposal penelitian bagi Dosen.
 *
 * @features
 * - Mengubah judul, deskripsi, dan skema penelitian
 * - Opsi unggah berkas proposal baru
 * - Tombol opsi: "Simpan sebagai Draf" (Draft) dan "Kirim Proposal" (Submit)
 * - Penanganan validasi error realtime via useForm Inertia
 *
 * @route GET /proposal/{proposal}/edit
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

interface SchemaOption {
    id: number;
    name: string;
    description?: string;
    max_funding?: number;
}

interface ProposalData {
    id: number;
    title?: string;
    judul?: string;
    description?: string;
    deskripsi?: string;
    research_schema_id?: number;
    file_dokumen_proposal?: string | null;
    status_proposal?: string;
}

interface EditProps {
    proposal: ProposalData;
    schemas?: SchemaOption[];
}

export default function Edit({ proposal, schemas = [] }: EditProps) {
    const { data, setData, post, transform, processing, errors } = useForm({
        title: proposal?.title ?? proposal?.judul ?? '',
        description: proposal?.description ?? proposal?.deskripsi ?? '',
        research_schema_id: proposal?.research_schema_id ? String(proposal.research_schema_id) : '',
        file_dokumen_proposal: null as File | null,
        action: proposal?.status_proposal === 'Draft' ? 'draft' : 'submit',
        _method: 'PUT',
    });

    if (!proposal) {
        return <div className="p-6">Data proposal tidak ditemukan.</div>;
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proposal', href: route('proposal.index') },
        { title: 'Edit Proposal', href: '#' },
    ];

    const handleSubmit = (actionType: 'draft' | 'submit') => {
        if (actionType === 'submit') {
            if (!confirm('Apakah Anda yakin ingin mengirim proposal ini? Proposal yang sudah dikirim tidak dapat diubah kembali oleh Dosen.')) {
                return;
            }
        }

        transform((formData) => ({
            ...formData,
            action: actionType,
        }));
        post(route('proposal.update', proposal.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Proposal - ${data.title}`} />

            <div className="container mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('proposal.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Proposal Penelitian</h1>
                        <p className="text-sm text-muted-foreground">Perbarui rincian proposal Anda sebelum diajukan secara resmi.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Perbarui Informasi Proposal</CardTitle>
                        <CardDescription>
                            Anda dapat memperbarui judul, deskripsi, skema penelitian, atau mengunggah ulang berkas dokumen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                            {/* Judul Proposal */}
                            <div className="space-y-2">
                                <Label htmlFor="title">
                                    Judul Proposal <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className={errors.title ? 'border-destructive' : ''}
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            {/* Skema Penelitian */}
                            {schemas.length > 0 && (
                                <div className="space-y-2">
                                    <Label htmlFor="research_schema_id">Skema Penelitian</Label>
                                    <Select value={data.research_schema_id} onValueChange={(val) => setData('research_schema_id', val)}>
                                        <SelectTrigger className={errors.research_schema_id ? 'border-destructive' : ''}>
                                            <SelectValue placeholder="Pilih Skema Penelitian" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schemas.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.research_schema_id && <p className="text-sm text-destructive">{errors.research_schema_id}</p>}
                                </div>
                            )}

                            {/* Deskripsi */}
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Deskripsi / Ringkasan <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    rows={5}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            {/* Berkas Dokumen Proposal */}
                            <div className="space-y-2">
                                <Label htmlFor="file_dokumen_proposal">Unggah Berkas Baru (PDF/DOCX, Maks. 10MB)</Label>
                                <Input
                                    id="file_dokumen_proposal"
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => setData('file_dokumen_proposal', e.target.files?.[0] || null)}
                                    className={errors.file_dokumen_proposal ? 'border-destructive' : ''}
                                />
                                {proposal.file_dokumen_proposal && !data.file_dokumen_proposal && (
                                    <p className="text-xs text-muted-foreground">
                                        Berkas saat ini sudah terunggah. Biarkan kosong jika tidak ingin mengubah berkas.
                                    </p>
                                )}
                                {errors.file_dokumen_proposal && <p className="text-sm text-destructive">{errors.file_dokumen_proposal}</p>}
                            </div>

                            {/* Action Buttons: Draf vs Kirim */}
                            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-end">
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

                                <Button type="button" disabled={processing} onClick={() => handleSubmit('submit')} className="w-full sm:w-auto">
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
