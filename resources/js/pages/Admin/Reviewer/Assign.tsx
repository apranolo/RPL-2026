/**
 * ReviewerAssign Component
 *
 * @description
 * Halaman antarmuka untuk Admin (Super Admin & Admin Kampus) melakukan penunjukan (assignment) reviewer
 * ke proposal penelitian berstatus Administrasi Valid / Submitted.
 *
 * @filepath /resources/js/pages/Admin/Reviewer/Assign.tsx
 */

import AssignModal from '@/components/AssignModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ClipboardList, FileText, UserCheck, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Proposal {
    id: number;
    title: string;
}

interface Reviewer {
    id: number;
    name: string;
}

interface Props {
    proposals: Proposal[];
    reviewers: Reviewer[];
    selectedProposalId?: string | number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Proposal Penelitian',
        href: '/admin/proposals',
    },
    {
        title: 'Penunjukan Reviewer',
        href: '#',
    },
];

export default function AssignReviewer({ proposals = [], reviewers = [], selectedProposalId }: Props) {
    const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialProposalId = selectedProposalId ? String(selectedProposalId) : (queryParams?.get('proposal_id') || '');

    const { data, setData, post, processing, errors } = useForm({
        proposal_id: initialProposalId,
        reviewer_id: '',
    });

    const [openModal, setOpenModal] = useState(false);

    const selectedProposal = proposals.find((p) => String(p.id) === String(data.proposal_id));
    const selectedReviewer = reviewers.find((r) => String(r.id) === String(data.reviewer_id));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!data.proposal_id || !data.reviewer_id) return;
        setOpenModal(true);
    };

    const confirmAssign = () => {
        post(route('admin.assign.store'), {
            onSuccess: () => {
                setOpenModal(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penunjukan Reviewer — Admin" />

            <div className="flex flex-col gap-6 p-6">
                <div className="mx-auto w-full max-w-2xl space-y-6">
                    {/* Back Link & Header */}
                    <div className="space-y-3">
                        <Button variant="ghost" size="sm" className="h-auto gap-2 p-0 text-muted-foreground hover:text-foreground" asChild>
                            <Link href="/admin/proposals">
                                <ArrowLeft className="h-4 w-4" />
                                Kembali ke Proposal
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">Penunjukan Reviewer</h1>
                                <p className="mt-0.5 text-sm text-muted-foreground">
                                    Tugaskan reviewer berpengalaman untuk meninjau dan menilai proposal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Card */}
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Form Penunjukan Reviewer</CardTitle>
                            <CardDescription>
                                Pilih proposal yang siap direview dan tentukan reviewer yang sesuai.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submit} className="space-y-6">
                                {/* Proposal Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="proposal_id" className="flex items-center gap-2 text-sm font-medium">
                                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                                        Pilih Proposal <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.proposal_id} onValueChange={(val) => setData('proposal_id', val)}>
                                        <SelectTrigger id="proposal_id" className={`w-full ${errors.proposal_id ? 'border-destructive' : ''}`}>
                                            <SelectValue placeholder="-- Pilih Proposal --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {proposals.length === 0 ? (
                                                <div className="p-3 text-center text-sm text-muted-foreground">
                                                    Tidak ada proposal valid yang perlu ditunjuk
                                                </div>
                                            ) : (
                                                proposals.map((proposal) => (
                                                    <SelectItem key={proposal.id} value={String(proposal.id)}>
                                                        {proposal.title}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.proposal_id && (
                                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            {errors.proposal_id}
                                        </p>
                                    )}
                                </div>

                                {/* Reviewer Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="reviewer_id" className="flex items-center gap-2 text-sm font-medium">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        Pilih Reviewer <span className="text-destructive">*</span>
                                    </Label>
                                    <Select value={data.reviewer_id} onValueChange={(val) => setData('reviewer_id', val)}>
                                        <SelectTrigger id="reviewer_id" className={`w-full ${errors.reviewer_id ? 'border-destructive' : ''}`}>
                                            <SelectValue placeholder="-- Pilih Reviewer --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {reviewers.length === 0 ? (
                                                <div className="p-3 text-center text-sm text-muted-foreground">
                                                    Belum ada reviewer terdaftar
                                                </div>
                                            ) : (
                                                reviewers.map((reviewer) => (
                                                    <SelectItem key={reviewer.id} value={String(reviewer.id)}>
                                                        {reviewer.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.reviewer_id && (
                                        <p className="flex items-center gap-1.5 text-xs text-destructive">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            {errors.reviewer_id}
                                        </p>
                                    )}
                                </div>

                                {/* Summary Box if selected */}
                                {(selectedProposal || selectedReviewer) && (
                                    <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                                        <div className="flex items-center gap-2 font-medium text-primary">
                                            <FileText className="h-4 w-4" />
                                            Ringkasan Penunjukan
                                        </div>
                                        {selectedProposal && (
                                            <p className="text-muted-foreground">
                                                <span className="font-medium text-foreground">Proposal:</span> {selectedProposal.title}
                                            </p>
                                        )}
                                        {selectedReviewer && (
                                            <p className="text-muted-foreground">
                                                <span className="font-medium text-foreground">Reviewer:</span> {selectedReviewer.name}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                                    <Button type="button" variant="outline" asChild>
                                        <Link href="/admin/proposals">Batal</Link>
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={processing || !data.proposal_id || !data.reviewer_id}
                                        className="gap-2"
                                    >
                                        <UserCheck className="h-4 w-4" />
                                        {processing ? 'Menyimpan...' : 'Tugaskan Reviewer'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <AssignModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onConfirm={confirmAssign}
                loading={processing}
                proposalTitle={selectedProposal?.title}
            />
        </AppLayout>
    );
}
