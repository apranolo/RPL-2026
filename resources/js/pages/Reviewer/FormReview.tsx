/**
 * Form Penilaian Proposal (Reviewer)
 *
 * @description Form rubrik interaktif untuk reviewer mengisi penilaian proposal penelitian.
 *              Menampilkan detail proposal, rubrik skor per-kriteria (skala 1–5) dengan
 *              kalkulasi total skor agregat secara real-time, rekomendasi, dan komentar.
 * @route POST /reviewer/assessment → reviewer.assessment.store
 * @route PUT  /reviewer/assessment/{id} → reviewer.assessment.update
 * @features Penilaian rubrik per-kriteria, kalkulasi agregat real-time, rekomendasi, komentar reviewer
 */

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ClipboardCheck, FileText, Save, Star } from 'lucide-react';
import { type FormEventHandler, useCallback, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ProposalData = {
    id: number;
    title: string;
    abstract: string;
};

type KomponenPenilaian = {
    kriteria: string;
    bobot: number;
    skor: number;
};

type ExistingReview = {
    id: number;
    komponen_penilaian: KomponenPenilaian[];
    score: number;
    comments: string;
    recommendation: 'accepted' | 'revision' | 'rejected';
};

type Props = {
    proposal: ProposalData;
    existingReview?: ExistingReview;
};

/* ------------------------------------------------------------------ */
/*  Default Rubric Criteria                                            */
/* ------------------------------------------------------------------ */

const DEFAULT_KRITERIA: Omit<KomponenPenilaian, 'skor'>[] = [
    { kriteria: 'Orisinalitas & Kebaruan', bobot: 20 },
    { kriteria: 'Tinjauan Pustaka', bobot: 15 },
    { kriteria: 'Metodologi Penelitian', bobot: 25 },
    { kriteria: 'Luaran & Dampak', bobot: 20 },
    { kriteria: 'Kelayakan Anggaran', bobot: 20 },
];

const SKOR_LABELS: Record<number, string> = {
    1: 'Sangat Kurang',
    2: 'Kurang',
    3: 'Cukup',
    4: 'Baik',
    5: 'Sangat Baik',
};

/* ------------------------------------------------------------------ */
/*  Helper: Build initial komponen_penilaian                           */
/* ------------------------------------------------------------------ */

function buildInitialKomponen(existing?: KomponenPenilaian[]): KomponenPenilaian[] {
    if (existing && existing.length > 0) {
        return existing;
    }
    return DEFAULT_KRITERIA.map((k) => ({ ...k, skor: 0 }));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Reviewer', href: route('reviewer.assignments.index') },
    { title: 'Form Penilaian', href: '#' },
];

export default function FormReview({ proposal, existingReview }: Props) {
    const { data, setData, post, put, processing, errors } = useForm<{
        proposal_id: number;
        komponen_penilaian: KomponenPenilaian[];
        score: number;
        comments: string;
        recommendation: 'accepted' | 'revision' | 'rejected' | '';
    }>({
        proposal_id: proposal.id,
        komponen_penilaian: buildInitialKomponen(existingReview?.komponen_penilaian),
        score: existingReview?.score ?? 0,
        comments: existingReview?.comments ?? '',
        recommendation: existingReview?.recommendation ?? '',
    });

    /* ---------- Aggregate score calculation (real-time) ---------- */

    const aggregateScore = useMemo(() => {
        const komponen = data.komponen_penilaian;
        const totalBobot = komponen.reduce((sum, k) => sum + k.bobot, 0);
        if (totalBobot === 0) return 0;

        const weightedSum = komponen.reduce((sum, k) => {
            if (k.skor === 0) return sum;
            // Normalize skor 1-5 → 0-100, then apply weight
            return sum + ((k.skor / 5) * 100 * k.bobot) / totalBobot;
        }, 0);

        return Math.round(weightedSum * 100) / 100;
    }, [data.komponen_penilaian]);

    const allCriteriaFilled = useMemo(() => {
        return data.komponen_penilaian.every((k) => k.skor > 0);
    }, [data.komponen_penilaian]);

    /* ---------- Handlers ---------- */

    const handleSkorChange = useCallback(
        (index: number, skor: number) => {
            const updated = [...data.komponen_penilaian];
            updated[index] = { ...updated[index], skor };
            setData('komponen_penilaian', updated);

            // Auto-update aggregate score
            const totalBobot = updated.reduce((sum, k) => sum + k.bobot, 0);
            const weightedSum = updated.reduce((sum, k) => {
                if (k.skor === 0) return sum;
                return sum + ((k.skor / 5) * 100 * k.bobot) / totalBobot;
            }, 0);
            setData('score', Math.round(weightedSum * 100) / 100);
        },
        [data.komponen_penilaian, setData],
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Ensure score is synced with aggregate before submit
        setData('score', aggregateScore);

        if (existingReview) {
            put(route('reviewer.assessment.update', existingReview.id));
        } else {
            post(route('reviewer.assessment.store'));
        }
    };

    /* ---------- Score color helper ---------- */

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        if (score >= 40) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    /* ---------- Render ---------- */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Form Penilaian Proposal" />

            <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold">Form Penilaian Proposal</h1>
                    <p className="text-muted-foreground">
                        {existingReview ? 'Perbarui penilaian proposal di bawah ini.' : 'Isi rubrik penilaian proposal secara lengkap.'}
                    </p>
                </div>

                {/* Proposal Detail Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start gap-3">
                            <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div>
                                <CardTitle>Detail Proposal</CardTitle>
                                <CardDescription>Informasi proposal yang akan dinilai</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium">Judul:</span>
                                <p className="text-sm text-muted-foreground">{proposal.title}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium">Abstrak:</span>
                                <p className="text-sm leading-relaxed text-muted-foreground">{proposal.abstract}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assessment Form */}
                <form onSubmit={submit} className="space-y-6">
                    {/* Rubric Scoring Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <ClipboardCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                                <div>
                                    <CardTitle>Rubrik Penilaian</CardTitle>
                                    <CardDescription>Berikan skor 1–5 untuk setiap kriteria penilaian</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-5">
                                {data.komponen_penilaian.map((komponen, index) => (
                                    <div key={komponen.kriteria} className="rounded-lg border p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <Label className="text-base font-semibold">{komponen.kriteria}</Label>
                                            <span className="text-xs text-muted-foreground">Bobot: {komponen.bobot}%</span>
                                        </div>

                                        {/* Score Buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 3, 4, 5].map((skor) => (
                                                <button
                                                    key={skor}
                                                    type="button"
                                                    onClick={() => handleSkorChange(index, skor)}
                                                    className={`inline-flex min-w-[120px] items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                                                        komponen.skor === skor
                                                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                            : 'border-input bg-background hover:bg-accent hover:text-accent-foreground'
                                                    }`}
                                                >
                                                    <Star className={`h-4 w-4 ${komponen.skor === skor ? 'fill-current' : ''}`} />
                                                    <span>
                                                        {skor} – {SKOR_LABELS[skor]}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>

                                        {errors[`komponen_penilaian.${index}.skor` as keyof typeof errors] && (
                                            <InputError
                                                message={errors[`komponen_penilaian.${index}.skor` as keyof typeof errors]}
                                                className="mt-2"
                                            />
                                        )}
                                    </div>
                                ))}

                                {errors.komponen_penilaian && <InputError message={errors.komponen_penilaian} />}
                            </div>

                            {/* Aggregate Score Display */}
                            <div className="mt-6 rounded-lg border-2 border-dashed p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Total Skor Agregat</p>
                                        <p className="text-xs text-muted-foreground">Dihitung otomatis dari rubrik di atas</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-3xl font-bold tabular-nums ${getScoreColor(aggregateScore)}`}>
                                            {aggregateScore.toFixed(2)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">dari 100</p>
                                    </div>
                                </div>
                                {!allCriteriaFilled && (
                                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                        ⚠ Semua kriteria harus diisi untuk mendapatkan skor final yang akurat.
                                    </p>
                                )}
                            </div>
                            {errors.score && <InputError message={errors.score} className="mt-2" />}
                        </CardContent>
                    </Card>

                    {/* Recommendation & Comments Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rekomendasi & Komentar</CardTitle>
                            <CardDescription>Tentukan rekomendasi dan berikan catatan untuk proposal ini</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Recommendation Select */}
                            <div className="space-y-2">
                                <Label htmlFor="recommendation">Rekomendasi</Label>
                                <Select
                                    value={data.recommendation}
                                    onValueChange={(value) => setData('recommendation', value as 'accepted' | 'revision' | 'rejected')}
                                >
                                    <SelectTrigger id="recommendation">
                                        <SelectValue placeholder="Pilih Rekomendasi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="accepted">✅ Diterima</SelectItem>
                                        <SelectItem value="revision">🔄 Revisi</SelectItem>
                                        <SelectItem value="rejected">❌ Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.recommendation} />
                            </div>

                            {/* Comments Textarea */}
                            <div className="space-y-2">
                                <Label htmlFor="comments">
                                    Komentar / Catatan Reviewer
                                    {(data.recommendation === 'revision' || data.recommendation === 'rejected') && (
                                        <span className="ml-1 text-red-500">*</span>
                                    )}
                                </Label>
                                <Textarea
                                    id="comments"
                                    rows={5}
                                    value={data.comments}
                                    onChange={(e) => setData('comments', e.target.value)}
                                    placeholder={
                                        data.recommendation === 'revision' || data.recommendation === 'rejected'
                                            ? 'Wajib diisi untuk rekomendasi Revisi/Ditolak...'
                                            : 'Tambahkan catatan atau komentar (opsional)...'
                                    }
                                />
                                <InputError message={errors.comments} />
                                {(data.recommendation === 'revision' || data.recommendation === 'rejected') && (
                                    <p className="text-xs text-muted-foreground">
                                        Komentar wajib diisi ketika rekomendasi adalah Revisi atau Ditolak.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing || !allCriteriaFilled} size="lg">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Menyimpan...' : existingReview ? 'Perbarui Penilaian' : 'Simpan Penilaian'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
