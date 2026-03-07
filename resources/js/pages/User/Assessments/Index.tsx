/**
 * Assessments Index Page
 *
 * @description User's assessment listing page - displays all self-assessments
 * @features List view, filter by status, search, pagination, create new
 * @route GET /user/assessments
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, Edit, Eye, FileText, Plus, Trash2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Journal {
    id: number;
    title: string;
    issn: string;
}

interface User {
    id: number;
    name: string;
}

interface Assessment {
    id: number;
    journal: Journal;
    user: User;
    assessment_date: string;
    period: string | null;
    status: 'draft' | 'submitted' | 'reviewed';
    status_label: string;
    status_color: string;
    total_score: number;
    max_score: number;
    percentage: number;
    grade: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedAssessments {
    data: Assessment[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    assessments: PaginatedAssessments;
    filters: {
        status?: string;
        search?: string;
    };
}

export default function AssessmentsIndex({ assessments, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    // Apply filters
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('user.assessments.index'),
                { search, status },
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [search, status]);

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus assessment ini?')) {
            router.delete(route('user.assessments.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (assessment: Assessment) => {
        const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
            gray: 'secondary',
            yellow: 'default',
            green: 'outline',
        };

        return <Badge variant={variants[assessment.status_color] || 'default'}>{assessment.status_label}</Badge>;
    };

    const getGradeBadge = (percentage: number) => {
        if (percentage >= 90) return <Badge className="bg-green-500">A</Badge>;
        if (percentage >= 80) return <Badge className="bg-blue-500">B</Badge>;
        if (percentage >= 70) return <Badge className="bg-yellow-500">C</Badge>;
        if (percentage >= 60) return <Badge className="bg-orange-500">D</Badge>;
        return <Badge variant="destructive">E</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Self-Assessment" />

            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Self-Assessment</h1>
                        <p className="mt-2 text-muted-foreground">Kelola penilaian mandiri untuk jurnal Anda</p>
                    </div>
                    <Link href={route('user.assessments.create')}>
                        <Button size="lg" className="shadow-sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Assessment Baru
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row">
                    <div className="flex-1">
                        <Input placeholder="Cari jurnal..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
                    </div>
                    <Select value={status || 'all'} onValueChange={(value) => setStatus(value === 'all' ? '' : value)}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="submitted">Submitted</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="mb-6 overflow-hidden rounded-lg border bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Jurnal</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Periode</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Skor</TableHead>
                                <TableHead className="text-right">Grade</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assessments.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-16 text-center">
                                        <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                                        <p className="mb-2 text-lg font-medium text-muted-foreground">Belum ada assessment</p>
                                        <p className="text-sm text-muted-foreground">Buat assessment pertama Anda untuk memulai!</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assessments.data.map((assessment) => (
                                    <TableRow key={assessment.id}>
                                        <TableCell className="font-medium">
                                            <div>
                                                <div className="font-semibold">{assessment.journal.title}</div>
                                                <div className="text-sm text-muted-foreground">ISSN: {assessment.journal.issn}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(assessment.assessment_date).toLocaleDateString('id-ID')}
                                            </div>
                                        </TableCell>
                                        <TableCell>{assessment.period || '-'}</TableCell>
                                        <TableCell>{getStatusBadge(assessment)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-semibold">{Number(assessment.total_score).toFixed(2)}</span>
                                                <span className="text-muted-foreground">/ {Number(assessment.max_score).toFixed(2)}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">({Number(assessment.percentage).toFixed(1)}%)</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {assessment.status !== 'draft' && getGradeBadge(assessment.percentage)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('user.assessments.show', assessment.id)}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                {assessment.status === 'draft' && (
                                                    <>
                                                        <Link href={route('user.assessments.edit', assessment.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(assessment.id)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {assessments.last_page > 1 && (
                    <div className="mb-6 flex justify-center gap-2">
                        {assessments.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 gap-6 rounded-lg border bg-card p-6 shadow-sm md:grid-cols-3">
                    <div className="p-4 text-center">
                        <div className="mb-1 text-3xl font-bold text-primary">{assessments.total}</div>
                        <div className="text-sm font-medium text-muted-foreground">Total Assessment</div>
                    </div>
                    <div className="border-r border-l p-4 text-center">
                        <div className="mb-1 text-3xl font-bold text-yellow-600">{assessments.data.filter((a) => a.status === 'draft').length}</div>
                        <div className="text-sm font-medium text-muted-foreground">Draft</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="mb-1 text-3xl font-bold text-green-600">
                            {assessments.data.filter((a) => a.status === 'submitted').length}
                        </div>
                        <div className="text-sm font-medium text-muted-foreground">Submitted</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
