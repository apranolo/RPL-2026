/**
 * Admin/Proposal/Show — Detail Proposal & Manajemen Reviewer
 *
 * @description
 * Halaman detail proposal penelitian untuk Admin Kampus dan Super Admin.
 * Menampilkan informasi lengkap proposal, dokumen pendukung, riwayat verifikasi,
 * serta manajemen penunjukan reviewer (Tunjuk, Ubah/Reassign, dan Hapus Penunjukan).
 *
 * @features
 * - Visual header dengan badge status dan aksi langsung
 * - Detail informasi pengusul, skema penelitian, deskripsi, & dokumen
 * - Manajemen reviewer: Tunjuk Reviewer, Ubah (Reassign) Reviewer, & Hapus Penunjukan
 * - Verifikasi administrasi (Setujui / Tolak proposal Submitted)
 * - Desain responsif berbasis Shadcn UI & Tailwind CSS v4
 *
 * @route GET /admin/proposals/{proposal}
 */
import AssignModal from '@/components/AssignModal';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    GraduationCap,
    Mail,
    RefreshCw,
    UserCheck,
    UserX,
    X,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ProposalUser {
    id: number;
    name: string;
    email: string;
    university?: string;
}

interface ResearchSchema {
    id: number;
    name: string;
    min_budget?: number;
    max_budget?: number;
}

interface Reviewer {
    id: number;
    name: string;
    email: string;
}

interface Review {
    id: number;
    proposal_id: number;
    reviewer_id: number;
    reviewed_at: string | null;
    score: number | null;
    feedback: string | null;
    reviewer: Reviewer | null;
}

interface Document {
    id: number;
    file_name: string;
    file_path: string;
}

interface ProposalDetail {
    id: number;
    title: string;
    description: string;
    status_proposal: string;
    rejection_reason: string | null;
    file_dokumen_proposal: string | null;
    created_at: string;
    updated_at: string;
    user: ProposalUser | null;
    research_schema: ResearchSchema | null;
    documents?: Document[];
    reviews: Review[];
}

interface AvailableReviewer {
    id: number;
    name: string;
    email: string;
}

interface Props {
    proposal: ProposalDetail;
    availableReviewers: AvailableReviewer[];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; bg: string }> = {
        Draft: { label: 'Draft', variant: 'secondary', bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
        Submitted: { label: 'Menunggu Review', variant: 'outline', bg: 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400' },
        Administrasi_Valid: { label: 'Valid Administrasi', variant: 'default', bg: 'bg-emerald-600 text-white dark:bg-emerald-700' },
        Ditolak: { label: 'Ditolak', variant: 'destructive', bg: 'bg-red-600 text-white dark:bg-red-700' },
    };
    const { label, bg } = config[status] ?? { label: status, bg: 'bg-slate-200 text-slate-800' };
    return <Badge className={`px-2.5 py-1 text-xs font-semibold ${bg}`}>{label}</Badge>;
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({ proposalId, proposalTitle, onClose }: { proposalId: number; proposalTitle: string; onClose: () => void }) {
    const { data, setData, post, processing, errors, reset } = useForm({ rejection_reason: '' });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.proposals.reject', { proposal: proposalId }), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
                <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Tolak Proposal</h2>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Anda akan menolak proposal: <span className="font-medium text-foreground">{proposalTitle}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="ml-auto rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="rejection_reason" className="mb-1.5 block text-sm font-medium text-foreground">
                            Alasan Penolakan <span className="text-destructive">*</span>
                        </label>
                        <textarea
                            id="rejection_reason"
                            ref={textareaRef}
                            rows={4}
                            value={data.rejection_reason}
                            onChange={(e) => setData('rejection_reason', e.target.value)}
                            placeholder="Tuliskan alasan penolakan secara spesifik..."
                            className={`w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none ${
                                errors.rejection_reason ? 'border-destructive' : 'border-border'
                            }`}
                        />
                        {errors.rejection_reason && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                {errors.rejection_reason}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-muted-foreground">{data.rejection_reason.length}/500 karakter</p>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Batal
                        </Button>
                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing ? 'Memproses...' : 'Konfirmasi Penolakan'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ShowProposal({ proposal, availableReviewers }: Props) {
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proposal Penelitian', href: '/admin/proposals' },
        { title: proposal.title, href: `/admin/proposals/${proposal.id}` },
    ];

    useEffect(() => {
        if (flash?.success) setFlashMessage({ type: 'success', text: flash.success });
        else if (flash?.error) setFlashMessage({ type: 'error', text: flash.error });
        else setFlashMessage(null);
        const timer = setTimeout(() => setFlashMessage(null), 4000);
        return () => clearTimeout(timer);
    }, [flash]);

    const handleApprove = () => {
        if (!confirm(`Setujui proposal "${proposal.title}" (Validasi Administrasi)?`)) return;
        router.post(route('admin.proposals.approve', { proposal: proposal.id }));
    };

    const handleConfirmAssign = () => {
        setShowAssignModal(false);
        router.get('/admin/reviewer/assign', { proposal_id: proposal.id });
    };

    const handleUnassign = (reviewId: number, reviewerName: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus penunjukan reviewer ${reviewerName}?`)) {
            router.delete(route('admin.assign.unassign', { id: reviewId }), {
                preserveScroll: true,
            });
        }
    };

    const hasReviewers = proposal.reviews && proposal.reviews.length > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Proposal — ${proposal.title}`} />

            {/* Flash Message */}
            {flashMessage && (
                <div
                    className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-xl ${
                        flashMessage.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'border-destructive/30 bg-destructive/10 text-destructive'
                    }`}
                >
                    {flashMessage.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    {flashMessage.text}
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <RejectModal proposalId={proposal.id} proposalTitle={proposal.title} onClose={() => setShowRejectModal(false)} />
            )}

            {/* Assign Modal */}
            <AssignModal
                open={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onConfirm={handleConfirmAssign}
                proposalTitle={proposal.title}
            />

            <div className="flex flex-col gap-6 p-6">
                {/* Navigation & Actions Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href={route('admin.proposals.index')}
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Proposal
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                        {proposal.status_proposal === 'Submitted' && (
                            <>
                                <Button onClick={handleApprove} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Validasi Administrasi
                                </Button>
                                <Button onClick={() => setShowRejectModal(true)} variant="destructive" className="gap-1.5">
                                    <XCircle className="h-4 w-4" />
                                    Tolak Proposal
                                </Button>
                            </>
                        )}

                        {proposal.status_proposal === 'Administrasi_Valid' && (
                            <Button
                                onClick={() => setShowAssignModal(true)}
                                variant="outline"
                                className={`gap-1.5 ${
                                    hasReviewers
                                        ? 'border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950'
                                        : 'border-primary text-primary hover:bg-primary/10'
                                }`}
                            >
                                {hasReviewers ? (
                                    <>
                                        <RefreshCw className="h-4 w-4" />
                                        Ubah / Reassign Reviewer
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="h-4 w-4" />
                                        Tunjuk Reviewer
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Proposal Overview Banner */}
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <StatusBadge status={proposal.status_proposal} />
                                    {proposal.research_schema && (
                                        <Badge variant="outline" className="gap-1 border-primary/20 text-primary">
                                            <GraduationCap className="h-3 w-3" />
                                            {proposal.research_schema.name}
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl leading-snug">
                                    {proposal.title}
                                </h1>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Content Layout Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Main Column (2 cols) */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Proposal Detail Card */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Deskripsi & Ringkasan Proposal</CardTitle>
                                <CardDescription>Ringkasan Latar Belakang dan Tujuan Penelitian</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Deskripsi / Abstrak
                                    </h4>
                                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                        {proposal.description || 'Tidak ada deskripsi yang dilampirkan.'}
                                    </div>
                                </div>

                                {proposal.rejection_reason && (
                                    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                                        <h4 className="flex items-center gap-1.5 font-semibold text-red-800 dark:text-red-200 mb-1">
                                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                                            Alasan Penolakan Proposal
                                        </h4>
                                        <p>{proposal.rejection_reason}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Proposal Documents Card */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Dokumen Lampiran</CardTitle>
                                <CardDescription>Berkas proposal dan lampiran pendukung</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {proposal.file_dokumen_proposal ? (
                                    <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Dokumen Proposal Penelitian</p>
                                                <p className="text-xs text-muted-foreground">{proposal.file_dokumen_proposal}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={`/storage/${proposal.file_dokumen_proposal}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button size="sm" variant="outline" className="gap-1.5">
                                                <Download className="h-3.5 w-3.5" />
                                                Unduh PDF
                                            </Button>
                                        </a>
                                    </div>
                                ) : (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
                                        Belum ada dokumen proposal yang diunggah.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Sidebar Column (1 col) */}
                    <div className="space-y-6">
                        {/* Author Info Card */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold">Informasi Pengusul</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                {proposal.user ? (
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-10 w-10 border border-border">
                                            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                                {proposal.user.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <p className="font-semibold text-foreground leading-none">{proposal.user.name}</p>
                                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Mail className="h-3 w-3 shrink-0" />
                                                {proposal.user.email}
                                            </p>
                                            {proposal.user.university && (
                                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Building2 className="h-3 w-3 shrink-0" />
                                                    {proposal.user.university}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">Data pengusul tidak tersedia.</p>
                                )}

                                <div className="border-t border-border pt-3 space-y-2 text-xs text-muted-foreground">
                                    <div className="flex justify-between">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> Tanggal Pengajuan:
                                        </span>
                                        <span className="font-medium text-foreground">{proposal.created_at}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> Update Terakhir:
                                        </span>
                                        <span className="font-medium text-foreground">{proposal.updated_at}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviewer Assignment Card */}
                        <Card className="border-border bg-card shadow-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <UserCheck className="h-4 w-4 text-primary" />
                                        Reviewer Ditugaskan
                                    </CardTitle>
                                    {hasReviewers ? (
                                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                            Sudah Ditunjuk
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                            Belum Ditunjuk
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hasReviewers ? (
                                    <div className="space-y-3">
                                        {proposal.reviews.map((rev) => (
                                            <div
                                                key={rev.id}
                                                className="flex flex-col gap-2 rounded-lg border border-border bg-muted/20 p-3"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-2.5">
                                                        <Avatar className="h-8 w-8 border border-border">
                                                            <AvatarFallback className="bg-emerald-500/10 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                                                {rev.reviewer?.name?.substring(0, 2).toUpperCase() ?? 'RV'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">{rev.reviewer?.name ?? 'Reviewer'}</p>
                                                            <p className="text-xs text-muted-foreground">{rev.reviewer?.email ?? '-'}</p>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleUnassign(rev.id, rev.reviewer?.name ?? 'Reviewer')}
                                                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        title="Hapus Penunjukan Reviewer"
                                                    >
                                                        <UserX className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {rev.score !== null && (
                                                    <div className="mt-1 flex items-center justify-between text-xs border-t border-border pt-2">
                                                        <span className="text-muted-foreground">Skor Penilaian:</span>
                                                        <span className="font-semibold text-foreground">{rev.score} / 100</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {proposal.status_proposal === 'Administrasi_Valid' && (
                                            <Button
                                                onClick={() => setShowAssignModal(true)}
                                                variant="outline"
                                                className="w-full gap-1.5 text-xs"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                                Ganti / Reassign Reviewer
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3 py-2 text-center">
                                        <UserX className="mx-auto h-8 w-8 text-amber-500/60" />
                                        <p className="text-xs text-muted-foreground">
                                            Proposal ini belum ditugaskan kepada reviewer mana pun.
                                        </p>
                                        {proposal.status_proposal === 'Administrasi_Valid' && (
                                            <Button
                                                onClick={() => setShowAssignModal(true)}
                                                size="sm"
                                                className="w-full gap-1.5"
                                            >
                                                <UserCheck className="h-4 w-4" />
                                                Tunjuk Reviewer Sekarang
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
