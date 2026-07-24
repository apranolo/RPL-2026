/**
 * ProgressCreate Component
 *
 * @description
 * Form for creating a new progress report (laporan kemajuan) for the authenticated user (Dosen).
 * Supports proposal selection, report type, progress percentage, and file attachment upload.
 *
 * @route GET /user/progress/create
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
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { type FormEvent } from 'react';

interface Proposal {
    id: number;
    title: string;
}

interface Props {
    proposals: Proposal[];
}

type ProgressReportForm = {
    proposal_id: string;
    title: string;
    content: string;
    report_type: string;
    report_date: string;
    progress_percentage: string;
    report_period: string;
    attachment: File | null;
    status: string;
};

export default function ProgressCreate({ proposals }: Props) {
    const { data, setData, post, processing, errors, transform } = useForm<ProgressReportForm>({
        proposal_id: '',
        title: '',
        content: '',
        report_type: '',
        report_date: '',
        progress_percentage: '0',
        report_period: '',
        attachment: null,
        status: 'draft',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Laporan Kemajuan', href: route('user.progress.index') },
        { title: 'Buat Laporan', href: route('user.progress.create') },
    ];

    const submit = (e: FormEvent, status: 'draft' | 'submitted') => {
        e.preventDefault();
        transform((formData) => ({ ...formData, status }));
        post(route('user.progress.store'), { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Laporan Kemajuan" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('user.progress.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Buat Laporan Kemajuan</h1>
                        <p className="text-muted-foreground">Laporkan progres penelitian Anda</p>
                    </div>
                </div>

                <Card className="max-w-3xl">
                    <CardHeader>
                        <CardTitle>Formulir Laporan</CardTitle>
                        <CardDescription>Lengkapi data laporan kemajuan penelitian di bawah ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={(e) => submit(e, 'submitted')} className="flex flex-col gap-6">
                            {/* Proposal */}
                            <div className="grid gap-2">
                                <Label htmlFor="proposal_id">Proposal Penelitian</Label>
                                <Select value={data.proposal_id} onValueChange={(value) => setData('proposal_id', value)}>
                                    <SelectTrigger id="proposal_id">
                                        <SelectValue placeholder="Pilih proposal" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {proposals.map((proposal) => (
                                            <SelectItem key={proposal.id} value={String(proposal.id)}>
                                                {proposal.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.proposal_id && <p className="text-sm text-destructive">{errors.proposal_id}</p>}
                            </div>

                            {/* Jenis Laporan */}
                            <div className="grid gap-2">
                                <Label htmlFor="report_type">Jenis Laporan</Label>
                                <Select value={data.report_type} onValueChange={(value) => setData('report_type', value)}>
                                    <SelectTrigger id="report_type">
                                        <SelectValue placeholder="Pilih jenis laporan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="logbook">Logbook</SelectItem>
                                        <SelectItem value="laporan_kemajuan">Laporan Kemajuan</SelectItem>
                                        <SelectItem value="laporan_akhir">Laporan Akhir</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.report_type && <p className="text-sm text-destructive">{errors.report_type}</p>}
                            </div>

                            {/* Judul */}
                            <div className="grid gap-2">
                                <Label htmlFor="title">Judul Laporan</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Contoh: Laporan Kemajuan Bulan Juni"
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            {/* Deskripsi Kegiatan */}
                            <div className="grid gap-2">
                                <Label htmlFor="content">Deskripsi Kegiatan</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Jelaskan kegiatan penelitian yang telah dilakukan..."
                                    rows={5}
                                />
                                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {/* Tanggal Pelaporan */}
                                <div className="grid gap-2">
                                    <Label htmlFor="report_date">Tanggal Pelaporan</Label>
                                    <Input
                                        id="report_date"
                                        type="date"
                                        value={data.report_date}
                                        onChange={(e) => setData('report_date', e.target.value)}
                                    />
                                    {errors.report_date && <p className="text-sm text-destructive">{errors.report_date}</p>}
                                </div>

                                {/* Periode */}
                                <div className="grid gap-2">
                                    <Label htmlFor="report_period">Periode Pelaporan</Label>
                                    <Input
                                        id="report_period"
                                        value={data.report_period}
                                        onChange={(e) => setData('report_period', e.target.value)}
                                        placeholder="Contoh: Juni 2026"
                                    />
                                    {errors.report_period && <p className="text-sm text-destructive">{errors.report_period}</p>}
                                </div>
                            </div>

                            {/* Persentase Progres */}
                            <div className="grid gap-2">
                                <Label htmlFor="progress_percentage">Persentase Progres (%)</Label>
                                <Input
                                    id="progress_percentage"
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={data.progress_percentage}
                                    onChange={(e) => setData('progress_percentage', e.target.value)}
                                    className="w-32"
                                />
                                {errors.progress_percentage && <p className="text-sm text-destructive">{errors.progress_percentage}</p>}
                            </div>

                            {/* Lampiran */}
                            <div className="grid gap-2">
                                <Label htmlFor="attachment">Dokumen Lampiran</Label>
                                <Input
                                    id="attachment"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('attachment', e.target.files?.[0] ?? null)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Format: PDF/JPG/PNG, maksimal 5MB. Wajib untuk Laporan Kemajuan dan Laporan Akhir.
                                </p>
                                {errors.attachment && <p className="text-sm text-destructive">{errors.attachment}</p>}
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" disabled={processing} onClick={(e) => submit(e, 'draft')}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan Draft
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Laporan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
