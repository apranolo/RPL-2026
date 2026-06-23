import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Award, Download, Edit3, FileText, FileUp, Info, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface FormReviewProps {
    assignment: {
        id: number;
        reviewer_id: number;
        registration_id: number;
        status: string;
        registration: {
            id: number;
            pembinaan: {
                id: number;
                name: string;
                description: string;
                category: string;
            };
            journal: {
                id: number;
                title: string;
                issn?: string;
                e_issn?: string;
                scientific_field?: {
                    name: string;
                };
                university?: {
                    name: string;
                };
            };
            attachments: Array<{
                id: number;
                file_name: string;
                file_size: number;
            }>;
        };
    };
    existingReview?: {
        id: number;
        score: number | string;
        feedback: string;
        recommendation?: string;
    } | null;
}

export default function FormReview({ assignment, existingReview }: FormReviewProps) {
    const isEditMode = !!existingReview;

    const { data, setData, post, put, processing, errors } = useForm({
        score: existingReview?.score ? String(existingReview.score) : '',
        feedback: existingReview?.feedback || '',
        recommendation: existingReview?.recommendation || '',
    });

    const [scoreLabel, setScoreLabel] = useState<string>('');

    // Update rating label based on score
    useEffect(() => {
        const numScore = parseFloat(data.score);
        if (isNaN(numScore) || data.score === '') {
            setScoreLabel('');
            return;
        }

        if (numScore >= 90) {
            setScoreLabel('Excellent');
        } else if (numScore >= 80) {
            setScoreLabel('Very Good');
        } else if (numScore >= 70) {
            setScoreLabel('Good');
        } else if (numScore >= 60) {
            setScoreLabel('Satisfactory');
        } else {
            setScoreLabel('Needs Improvement');
        }
    }, [data.score]);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Assignments',
            href: route('reviewer.assignments.index'),
        },
        {
            title: 'Detail Proposal',
            href: route('reviewer.assignments.show', assignment.id),
        },
        {
            title: isEditMode ? 'Edit Penilaian' : 'Beri Penilaian',
            href: '#',
        },
    ];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode) {
            put(route('reviewer.assignments.update-assessment', assignment.id));
        } else {
            post(route('reviewer.assignments.store-assessment', assignment.id));
        }
    };

    // Helper to format file size
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditMode ? 'Edit Penilaian Proposal' : 'Penilaian Proposal'} />

            <div className="container mx-auto max-w-7xl px-4 py-6">
                {/* Header Action */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('reviewer.assignments.show', assignment.id)}
                            className="inline-flex items-center justify-center rounded-lg border bg-background p-2 transition-colors hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {isEditMode ? 'Edit Penilaian Proposal' : 'Form Penilaian Proposal'}
                            </h1>
                            <p className="text-sm text-muted-foreground">Silakan periksa proposal dan isi penilaian evaluasi di bawah ini.</p>
                        </div>
                    </div>
                    <Badge variant={isEditMode ? 'default' : 'secondary'} className="px-3 py-1 text-xs">
                        {isEditMode ? 'Mode Edit' : 'Review Baru'}
                    </Badge>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Proposal Details & Attachments */}
                    <div className="space-y-6 lg:col-span-5">
                        {/* Detail Card */}
                        <Card className="overflow-hidden border border-border/60 shadow-sm">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Info className="h-4.5 w-4.5 text-primary" />
                                    Informasi Proposal & Jurnal
                                </CardTitle>
                                <CardDescription>Detail pendaftaran pembinaan dari institusi pengusul</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6 text-sm">
                                <div>
                                    <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Program Pembinaan
                                    </span>
                                    <p className="mt-0.5 text-sm font-semibold text-foreground">{assignment.registration?.pembinaan?.name}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Kategori:{' '}
                                        {assignment.registration?.pembinaan?.category === 'akreditasi'
                                            ? 'Pendampingan Akreditasi'
                                            : 'Pendampingan Indeksasi'}
                                    </p>
                                </div>

                                <Separator className="my-2" />

                                <div>
                                    <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">Nama Jurnal</span>
                                    <p className="mt-0.5 text-sm font-semibold text-foreground">{assignment.registration?.journal?.title}</p>
                                    <p className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        {assignment.registration?.journal?.issn && <span>ISSN: {assignment.registration?.journal?.issn}</span>}
                                        {assignment.registration?.journal?.e_issn && <span>E-ISSN: {assignment.registration?.journal?.e_issn}</span>}
                                    </p>
                                </div>

                                <Separator className="my-2" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Perguruan Tinggi
                                        </span>
                                        <p className="mt-0.5 font-medium text-foreground">
                                            {assignment.registration?.journal?.university?.name || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Bidang Keilmuan
                                        </span>
                                        <p className="mt-0.5 font-medium text-foreground">
                                            {assignment.registration?.journal?.scientific_field?.name || '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attachments Card */}
                        <Card className="border border-border/60 shadow-sm">
                            <CardHeader className="bg-muted/30">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <FileText className="h-4.5 w-4.5 text-primary" />
                                    Dokumen Pendukung
                                </CardTitle>
                                <CardDescription>Unduh dokumen proposal untuk dipelajari</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {assignment.registration?.attachments && assignment.registration.attachments.length > 0 ? (
                                    <div className="space-y-3">
                                        {assignment.registration.attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-muted/40"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden pr-2">
                                                    <div className="rounded bg-primary/10 p-2 text-primary">
                                                        <FileUp className="h-4.5 w-4.5" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p
                                                            className="max-w-[200px] truncate text-xs font-medium text-foreground"
                                                            title={attachment.file_name}
                                                        >
                                                            {attachment.file_name}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground">{formatBytes(attachment.file_size)}</p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={route('reviewer.assignments.attachments.download', {
                                                        assignment: assignment.id,
                                                        attachment: attachment.id,
                                                    })}
                                                    className="inline-flex items-center justify-center rounded-md border p-2 text-primary transition-colors hover:bg-muted"
                                                    title="Unduh file"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground/60" />
                                        <span>Tidak ada dokumen lampiran yang tersedia.</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Assessment Form */}
                    <div className="lg:col-span-7">
                        <form onSubmit={submit}>
                            <Card className="border border-border/60 shadow-sm">
                                <CardHeader className="bg-muted/30">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Award className="h-4.5 w-4.5 text-primary" />
                                        Evaluasi Penilaian
                                    </CardTitle>
                                    <CardDescription>Berikan nilai dan tanggapan formal terhadap proposal pembinaan</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6">
                                    {/* Score Input */}
                                    <div className="space-y-2">
                                        <div className="flex items-baseline justify-between">
                                            <Label htmlFor="score" className="text-sm font-semibold">
                                                Nilai Proposal (0 - 100) <span className="text-destructive">*</span>
                                            </Label>
                                            {scoreLabel && (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        scoreLabel === 'Excellent' || scoreLabel === 'Very Good'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : scoreLabel === 'Good'
                                                              ? 'bg-blue-500/10 text-blue-600'
                                                              : scoreLabel === 'Satisfactory'
                                                                ? 'bg-yellow-500/10 text-yellow-600'
                                                                : 'bg-destructive/10 text-destructive'
                                                    }`}
                                                >
                                                    Kategori: {scoreLabel}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input
                                                id="score"
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                placeholder="Contoh: 85.50"
                                                value={data.score}
                                                onChange={(e) => setData('score', e.target.value)}
                                                className={`pr-10 ${errors.score ? 'border-destructive' : ''}`}
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">
                                                / 100
                                            </div>
                                        </div>
                                        {errors.score ? (
                                            <p className="flex items-center gap-1 text-xs text-destructive">
                                                <AlertCircle className="h-3 w-3" /> {errors.score}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-muted-foreground">
                                                Nilai berupa angka desimal skala 100 (misalnya 75.00 atau 88.50).
                                            </p>
                                        )}
                                    </div>

                                    {/* Feedback Textarea */}
                                    <div className="space-y-2">
                                        <Label htmlFor="feedback" className="text-sm font-semibold">
                                            Feedback / Catatan Evaluasi <span className="text-destructive">*</span>
                                        </Label>
                                        <Textarea
                                            id="feedback"
                                            placeholder="Tuliskan ulasan terperinci mengenai kelayakan proposal, kesiapan tim pengusul, dan masukan substansial lainnya..."
                                            rows={8}
                                            value={data.feedback}
                                            onChange={(e) => setData('feedback', e.target.value)}
                                            className={errors.feedback ? 'border-destructive' : ''}
                                        />
                                        {errors.feedback ? (
                                            <p className="flex items-center gap-1 text-xs text-destructive">
                                                <AlertCircle className="h-3 w-3" /> {errors.feedback}
                                            </p>
                                        ) : (
                                            <p className="flex justify-between text-[11px] text-muted-foreground">
                                                <span>Minimum 10 karakter. Maksimum 2000 karakter.</span>
                                                <span>{data.feedback.length} karakter</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Recommendation Textarea */}
                                    <div className="space-y-2">
                                        <Label htmlFor="recommendation" className="text-sm font-semibold">
                                            Rekomendasi (Opsional)
                                        </Label>
                                        <Textarea
                                            id="recommendation"
                                            placeholder="Tuliskan rekomendasi langkah perbaikan taktis atau teknis tindak lanjut untuk jurnal ini..."
                                            rows={4}
                                            value={data.recommendation}
                                            onChange={(e) => setData('recommendation', e.target.value)}
                                            className={errors.recommendation ? 'border-destructive' : ''}
                                        />
                                        {errors.recommendation ? (
                                            <p className="flex items-center gap-1 text-xs text-destructive">
                                                <AlertCircle className="h-3 w-3" /> {errors.recommendation}
                                            </p>
                                        ) : (
                                            <p className="flex justify-between text-[11px] text-muted-foreground">
                                                <span>Maksimum 1000 karakter.</span>
                                                <span>{data.recommendation.length} karakter</span>
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between gap-3 border-t bg-muted/20 py-4">
                                    <Button type="button" variant="outline" asChild disabled={processing}>
                                        <Link href={route('reviewer.assignments.show', assignment.id)}>Batal</Link>
                                    </Button>
                                    <Button type="submit" disabled={processing} className="gap-2">
                                        {isEditMode ? (
                                            <>
                                                <Edit3 className="h-4 w-4" />
                                                Perbarui Penilaian
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Simpan Penilaian
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
