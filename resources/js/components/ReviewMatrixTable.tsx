/**
 * ReviewMatrixTable Component
 *
 * Menampilkan tabel matriks perbandingan review multi-reviewer untuk sebuah proposal.
 * Setiap baris merepresentasikan satu reviewer assignment dengan status, score,
 * rekomendasi, komentar, dan tombol perpanjang due date.
 *
 * MOCK LOKAL - hapus setelah model resmi ReviewDecision & ReviewerAssignment di-merge.
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router, usePage } from '@inertiajs/react';
import { CalendarDays, CheckCircle, Clock, Edit2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface ReviewerAssignmentRow {
    id: number;
    reviewer_name: string | null;
    due_date: string | null;
    status: 'assigned' | 'in_progress' | 'completed' | string;
    score: number | null;
    recommendation: string | null;
    comment: string | null;
}

interface Props {
    assignments: ReviewerAssignmentRow[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: React.ReactNode }> = {
    assigned: {
        label: 'Ditugaskan',
        variant: 'secondary',
        icon: <Clock className="h-3 w-3" />,
    },
    in_progress: {
        label: 'Sedang Review',
        variant: 'default',
        icon: <Edit2 className="h-3 w-3" />,
    },
    completed: {
        label: 'Selesai',
        variant: 'outline',
        icon: <CheckCircle className="h-3 w-3" />,
    },
};

const recommendationConfig: Record<string, { label: string; color: string }> = {
    accepted: { label: 'Diterima', color: 'text-green-600' },
    revision: { label: 'Revisi', color: 'text-yellow-600' },
    rejected: { label: 'Ditolak', color: 'text-red-600' },
};

export function ReviewMatrixTable({ assignments }: Props) {
    const [extendDialogOpen, setExtendDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<ReviewerAssignmentRow | null>(null);
    const [newDueDate, setNewDueDate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const openExtendDialog = (assignment: ReviewerAssignmentRow) => {
        setSelectedAssignment(assignment);
        setNewDueDate(assignment.due_date ?? '');
        setExtendDialogOpen(true);
    };

    const handleExtendDue = () => {
        if (!selectedAssignment || !newDueDate) return;

        setSubmitting(true);
        router.post(
            route('review.assignment.extend-due', { reviewerAssignment: selectedAssignment.id }),
            { due_date: newDueDate },
            {
                onFinish: () => {
                    setSubmitting(false);
                    setExtendDialogOpen(false);
                },
                preserveScroll: true,
            },
        );
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status] ?? { label: status, variant: 'secondary' as const, icon: null };
        return (
            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const getScoreColor = (score: number | null): string => {
        if (score === null) return 'text-muted-foreground';
        if (score >= 80) return 'text-green-600 font-bold';
        if (score >= 60) return 'text-yellow-600 font-bold';
        return 'text-red-600 font-bold';
    };

    if (assignments.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                <XCircle className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Belum ada reviewer yang ditugaskan untuk proposal ini.</p>
            </div>
        );
    }

    return (
        <>
            <div className="rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">Reviewer</TableHead>
                            <TableHead className="font-semibold">
                                <div className="flex items-center gap-1">
                                    <CalendarDays className="h-4 w-4" />
                                    Due Date
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold">Status</TableHead>
                            <TableHead className="font-semibold text-center">Skor</TableHead>
                            <TableHead className="font-semibold">Rekomendasi</TableHead>
                            <TableHead className="font-semibold">Komentar</TableHead>
                            <TableHead className="font-semibold text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignments.map((assignment) => {
                            const recommendationCfg = assignment.recommendation
                                ? (recommendationConfig[assignment.recommendation] ?? {
                                      label: assignment.recommendation,
                                      color: 'text-foreground',
                                  })
                                : null;

                            return (
                                <TableRow key={assignment.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">
                                        {assignment.reviewer_name ?? (
                                            <span className="italic text-muted-foreground">Tidak diketahui</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {assignment.due_date ? (
                                            <span className="text-sm">
                                                {new Date(assignment.due_date).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        ) : (
                                            <span className="italic text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                                    <TableCell className="text-center">
                                        <span className={getScoreColor(assignment.score)}>
                                            {assignment.score !== null ? assignment.score : '—'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {recommendationCfg ? (
                                            <span className={`text-sm font-medium ${recommendationCfg.color}`}>
                                                {recommendationCfg.label}
                                            </span>
                                        ) : (
                                            <span className="italic text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[220px]">
                                        {assignment.comment ? (
                                            <p className="text-sm text-muted-foreground truncate" title={assignment.comment}>
                                                {assignment.comment}
                                            </p>
                                        ) : (
                                            <span className="italic text-muted-foreground text-sm">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 text-xs"
                                            onClick={() => openExtendDialog(assignment)}
                                        >
                                            <CalendarDays className="h-3 w-3" />
                                            Perpanjang
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog Perpanjang Due Date */}
            <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Perpanjang Due Date</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Reviewer</p>
                            <p className="font-semibold">{selectedAssignment?.reviewer_name}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-due-date">Tanggal Baru</Label>
                            <Input
                                id="new-due-date"
                                type="date"
                                value={newDueDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setNewDueDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExtendDialogOpen(false)} disabled={submitting}>
                            Batal
                        </Button>
                        <Button onClick={handleExtendDue} disabled={submitting || !newDueDate}>
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
