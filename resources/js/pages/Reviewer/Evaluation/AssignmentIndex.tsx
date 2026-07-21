import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, Calendar, ArrowRight } from 'lucide-react';

interface Journal {
    id: number;
    name: string;
}

interface Pembinaan {
    id: number;
    name: string;
}

interface Registration {
    id: number;
    status: string;
    review_status?: string;
    journal: Journal;
    pembinaan: Pembinaan;
}

interface Assignment {
    id: number;
    status: string;
    assigned_at: string;
    registration: Registration;
}

interface Props {
    assignments: {
        data: Assignment[];
        current_page: number;
        last_page: number;
    };
}

export default function EvaluationIndex({ assignments }: Props) {
    const getStatusBadgeVariant = (status?: string) => {
        switch (status) {
            case 'review_selesai':
                return 'default';
            case 'sedang_direview':
                return 'secondary';
            case 'ditolak':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'menunggu_reviewer':
                return 'Menunggu Reviewer';
            case 'sedang_direview':
                return 'Sedang Direview';
            case 'review_selesai':
                return 'Review Selesai';
            case 'ditolak':
                return 'Ditolak / Perbaikan';
            default:
                return status || '-';
        }
    };

    return (
        <AppLayout>
            <Head title="Daftar Evaluasi" />
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight">Daftar Proposal yang Perlu Dievaluasi</h1>
                    <p className="text-sm text-muted-foreground">
                        Berikut adalah daftar registrasi jurnal dalam program pembinaan (Monev) yang ditugaskan kepada Anda.
                    </p>
                </div>

                {assignments.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-muted/40">
                        <ClipboardList className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium">Tidak ada proposal yang perlu dievaluasi.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {assignments.data.map((assignment) => (
                            <div key={assignment.id} className="group relative flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h2 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                                {assignment.registration?.journal?.name ?? '-'}
                                            </h2>
                                            <p className="text-sm text-muted-foreground font-medium">
                                                Program: {assignment.registration?.pembinaan?.name ?? '-'}
                                            </p>
                                        </div>
                                        <Badge variant={getStatusBadgeVariant(assignment.registration?.review_status)}>
                                            {getStatusLabel(assignment.registration?.review_status)}
                                        </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground border-t pt-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>
                                                Ditugaskan: {new Date(assignment.assigned_at).toLocaleDateString('id-ID')}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Badge variant={assignment.status === 'completed' ? 'outline' : 'secondary'} className="text-[10px] px-2 py-0.5">
                                                Tugas: {assignment.status === 'completed' ? 'Selesai' : 'Aktif'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end">
                                    <Link href={route('reviewer.evaluations.note', assignment.id)} className="w-full sm:w-auto">
                                        <Button className="w-full sm:w-auto flex items-center gap-2 group-hover:translate-x-0.5 transition-transform" variant="default" size="sm">
                                            Evaluasi
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
