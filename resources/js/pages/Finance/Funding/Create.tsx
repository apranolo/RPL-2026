/**
 * @file Create.tsx
 * @description Halaman pembuatan termin pencairan dana kontrak finansial.
 * Menyediakan form penginputan termin, visualisasi progress alokasi & serapan,
 * serta daftar termin yang sudah diterbitkan.
 */

import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatRp } from '@/utils/currency';
import { ArrowLeft, Plus, Wallet, TrendingDown, CheckCircle2 } from 'lucide-react';

interface Proposal {
    id: number;
    judul_penelitian?: string;
    title?: string;
}

interface FundingTermin {
    id: number;
    funding_number: string;
    termin_number: number;
    percentage: number;
    amount: number;
    status: string;
    status_pencairan: string;
    funding_date: string | null;
    due_date: string | null;
    description: string | null;
}

interface Contract {
    id: number;
    contract_number: string;
    nomor_kontrak: string;
    title: string;
    total_pendanaan_disetujui: number;
    status: string;
    status_kontrak: string;
    proposal?: Proposal;
}

interface Sisa {
    total_pendanaan: number;
    total_dialokasikan: number;
    total_cair: number;
    sisa_dana: number;
    sisa_persentase: number;
}

interface Props {
    contract: Contract;
    termins: FundingTermin[];
    sisa: Sisa;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kontrak', href: '/finance/contracts' },
    { title: 'Tambah Termin', href: '#' },
];

function getStatusStyle(status: string): string {
    switch (status) {
        case 'Sudah_Cair':
            return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400';
        case 'Proses_Transfer':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400';
        case 'Belum_Cair':
        default:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case 'Sudah_Cair':
            return 'Sudah Cair';
        case 'Proses_Transfer':
            return 'Proses Transfer';
        case 'Belum_Cair':
        default:
            return 'Belum Cair';
    }
}

export default function Create({ contract, termins, sisa }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id_contract: contract.id,
        percentage: '',
        description: '',
        funding_date: '',
        due_date: '',
        notes: '',
    });

    const calculatedAmount = data.percentage
        ? ((parseFloat(data.percentage) || 0) / 100) * contract.total_pendanaan_disetujui
        : 0;

    const totalPercentageAfter = (100 - sisa.sisa_persentase) + (parseFloat(data.percentage) || 0);
    const isOverLimit = totalPercentageAfter > 100;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.funding.store-termin'), {
            onSuccess: () => {
                toast.success('Termin pencairan berhasil ditambahkan.');
                reset('percentage', 'description', 'funding_date', 'due_date', 'notes');
            },
            onError: () => {
                toast.error('Gagal menambahkan termin. Periksa kembali data Anda.');
            },
        });
    };

    const serapanPercentage = sisa.total_pendanaan > 0
        ? Math.round((sisa.total_cair / sisa.total_pendanaan) * 100)
        : 0;

    const alokasiPercentage = 100 - sisa.sisa_persentase;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tambah Termin — ${contract.nomor_kontrak}`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <a
                        href={route('finance.contracts.index')}
                        className="inline-flex items-center justify-center rounded-lg border border-sidebar-border/70 bg-white p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground dark:border-sidebar-border dark:bg-neutral-950"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </a>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Tambah Termin Pencairan
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kontrak: {contract.nomor_kontrak} — {contract.title || contract.proposal?.judul_penelitian || contract.proposal?.title || '-'}
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Pendanaan</p>
                                <p className="text-lg font-bold text-foreground">{formatRp(sisa.total_pendanaan)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sudah Cair</p>
                                <p className="text-lg font-bold text-foreground">{formatRp(sisa.total_cair)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                <TrendingDown className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sisa Dana</p>
                                <p className="text-lg font-bold text-foreground">{formatRp(sisa.sisa_dana)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Bars */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardContent className="space-y-4 p-5">
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">Alokasi Termin</span>
                                <span className="font-semibold text-foreground">{alokasiPercentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={alokasiPercentage} className="h-2.5" />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Sisa persentase yang dapat dialokasikan: <strong>{sisa.sisa_persentase}%</strong>
                            </p>
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">Serapan Finansial</span>
                                <span className="font-semibold text-foreground">{serapanPercentage}%</span>
                            </div>
                            <Progress value={serapanPercentage} className="h-2.5" />
                        </div>
                    </CardContent>
                </Card>

                {/* Existing Termins Table */}
                {termins.length > 0 && (
                    <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold">Termin yang Sudah Ada</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6">No. Termin</TableHead>
                                        <TableHead>Persentase</TableHead>
                                        <TableHead>Nominal</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {termins.map((termin) => (
                                        <TableRow key={termin.id}>
                                            <TableCell className="pl-6 font-medium">{termin.termin_number}</TableCell>
                                            <TableCell>{termin.percentage}%</TableCell>
                                            <TableCell>{formatRp(termin.amount)}</TableCell>
                                            <TableCell>{termin.funding_date || '-'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusStyle(termin.status_pencairan)}>
                                                    {getStatusLabel(termin.status_pencairan)}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Create Form */}
                <Card className="border-sidebar-border/70 dark:border-sidebar-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold">
                            <Plus className="h-5 w-5" />
                            Tambah Termin Baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input type="hidden" name="id_contract" value={contract.id} />

                            {/* Percentage & Calculated Amount */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="percentage">
                                        Persentase Pencairan <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="percentage"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={sisa.sisa_persentase}
                                            value={data.percentage}
                                            onChange={(e) => setData('percentage', e.target.value)}
                                            placeholder="Contoh: 30"
                                            className={`pr-8 ${errors.percentage ? 'border-destructive' : ''}`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                                    </div>
                                    {errors.percentage && (
                                        <p className="text-sm text-destructive">{errors.percentage}</p>
                                    )}
                                    {isOverLimit && !errors.percentage && (
                                        <p className="text-sm text-destructive">
                                            Melebihi batas! Maksimal sisa: {sisa.sisa_persentase}%
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Nominal Otomatis (Kalkulasi)</Label>
                                    <div className="flex h-9 items-center rounded-md border border-input bg-muted/50 px-3 text-sm font-semibold text-foreground dark:bg-neutral-900">
                                        {data.percentage ? formatRp(calculatedAmount) : 'Rp 0'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Dihitung otomatis: {data.percentage || '0'}% x {formatRp(sisa.total_pendanaan)}
                                    </p>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="funding_date">Tanggal Pencairan</Label>
                                    <Input
                                        id="funding_date"
                                        type="date"
                                        value={data.funding_date}
                                        onChange={(e) => setData('funding_date', e.target.value)}
                                        className={errors.funding_date ? 'border-destructive' : ''}
                                    />
                                    {errors.funding_date && (
                                        <p className="text-sm text-destructive">{errors.funding_date}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="due_date">Tanggal Jatuh Tempo</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        className={errors.due_date ? 'border-destructive' : ''}
                                    />
                                    {errors.due_date && (
                                        <p className="text-sm text-destructive">{errors.due_date}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi Termin</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Contoh: Pencairan Tahap 1 — Awal Penelitian"
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan (Opsional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Tambahkan catatan terkait termin ini..."
                                    rows={3}
                                    className={errors.notes ? 'border-destructive' : ''}
                                />
                                {errors.notes && (
                                    <p className="text-sm text-destructive">{errors.notes}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-3 border-t border-sidebar-border/70 pt-5 dark:border-sidebar-border">
                                <a href={route('finance.contracts.index')}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </a>
                                <Button
                                    type="submit"
                                    disabled={processing || isOverLimit || !data.percentage}
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Termin'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
