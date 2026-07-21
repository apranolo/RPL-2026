/**
 * @file DeskReview.tsx
 * @description Halaman panel keputusan Desk Review untuk naskah ilmiah.
 *              Editor dapat menerima (Accept_For_Review) atau menolak (Desk_Reject)
 *              submission. Catatan penolakan wajib diisi jika submission ditolak.
 * @module Editorial/Desk
 * @author 2300018400
 */

import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

interface Journal {
    id: number;
    title: string;
    issn: string | null;
}

interface Author {
    id: number;
    name: string;
    email: string;
}

interface Submission {
    id: number;
    title: string;
    abstract: string | null;
    keywords: string | null;
    status: string;
    rejection_reason: string | null;
    reviewed_at: string | null;
    journal: Journal;
    author: Author;
    created_at: string;
}

interface Props {
    submission: Submission;
    editors: { id: number; name: string; email: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Editorial', href: '/editorial' },
    { title: 'Desk Review', href: '#' },
];

type DecisionValue = 'Accept_For_Review' | 'Desk_Reject' | '';

export default function DeskReview({ submission }: Props) {
    const [decision, setDecision] = useState<DecisionValue>('');

    const { data, setData, post, processing, errors } = useForm({
        decision: '' as DecisionValue,
        rejection_reason: '',
    });

    const handleDecisionChange = (value: 'Accept_For_Review' | 'Desk_Reject') => {
        setDecision(value);
        setData({
            decision: value,
            rejection_reason: value === 'Accept_For_Review' ? '' : data.rejection_reason,
        });
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('editorial.desk.desk-review', { submission: submission.id }));
    };

    const isAlreadyProcessed = submission.status !== 'pending';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Desk Review" />

            <div className="mx-auto max-w-2xl p-6">

                {/* Header */}
                <h1 className="mb-1 text-2xl font-bold text-foreground">
                    Desk Review
                </h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Tinjau submission dan berikan keputusan penerimaan atau penolakan.
                </p>

                {/* Info Submission */}
                <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Detail Submission
                    </h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Judul</span>
                            <span className="font-medium text-foreground">{submission.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Jurnal</span>
                            <span className="font-medium text-foreground">{submission.journal.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ISSN</span>
                            <span className="font-medium text-foreground">{submission.journal.issn ?? '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Penulis</span>
                            <span className="font-medium text-foreground">{submission.author.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Tanggal Submit</span>
                            <span className="font-medium text-foreground">{submission.created_at}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <StatusBadge status={submission.status} />
                        </div>
                    </div>
                </div>

                {/* Sudah diproses */}
                {isAlreadyProcessed && (
                    <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                        Submission ini sudah diproses dan tidak dapat diubah lagi.
                    </div>
                )}

                {/* Form Keputusan */}
                {!isAlreadyProcessed && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                                Keputusan <span className="text-destructive">*</span>
                            </label>
                            <div className="flex gap-3">
                                {/* Accept_For_Review */}
                                <button
                                    type="button"
                                    onClick={() => handleDecisionChange('Accept_For_Review')}
                                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                                        decision === 'Accept_For_Review'
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border bg-background text-foreground hover:bg-muted'
                                    }`}
                                >
                                    ✓ Terima untuk Review
                                </button>

                                {/* Desk_Reject */}
                                <button
                                    type="button"
                                    onClick={() => handleDecisionChange('Desk_Reject')}
                                    className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                                        decision === 'Desk_Reject'
                                            ? 'border-destructive bg-destructive/10 text-destructive'
                                            : 'border-border bg-background text-foreground hover:bg-muted'
                                    }`}
                                >
                                    ✕ Tolak Submission
                                </button>
                            </div>

                            {errors.decision && (
                                <p className="mt-1 text-sm text-destructive">{errors.decision}</p>
                            )}
                        </div>

                        {/* Catatan penolakan — wajib jika Desk_Reject */}
                        {decision === 'Desk_Reject' && (
                            <div>
                                <label
                                    htmlFor="rejection_reason"
                                    className="mb-1 block text-sm font-medium text-foreground"
                                >
                                    Catatan Penolakan <span className="text-destructive">*</span>
                                </label>
                                <textarea
                                    id="rejection_reason"
                                    rows={4}
                                    value={data.rejection_reason}
                                    onChange={(e) => setData('rejection_reason', e.target.value)}
                                    placeholder="Jelaskan alasan penolakan submission ini..."
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                                {errors.rejection_reason && (
                                    <p className="mt-1 text-sm text-destructive">{errors.rejection_reason}</p>
                                )}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={processing || !decision}
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Keputusan'}
                            </Button>
                        </div>
                    </form>
                )}

            </div>
        </AppLayout>
    );
}

/**
 * Komponen badge status submission.
 */
function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        pending: {
            label: 'Pending',
            className: 'bg-slate-100 text-slate-800 border border-slate-200',
        },
        Accept_For_Review: {
            label: 'Diterima',
            className: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        },
        Desk_Reject: {
            label: 'Ditolak',
            className: 'bg-rose-50 text-rose-800 border border-rose-200',
        },
    };

    const { label, className } = config[status] ?? {
        label: status,
        className: 'bg-muted text-muted-foreground border border-border',
    };

    return (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
            {label}
        </span>
    );
}
