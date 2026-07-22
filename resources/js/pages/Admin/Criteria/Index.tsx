/**
 * CriteriaIndex Component
 *
 * @description
 * Dashboard list page for managing Kriteria Penilaian (Assessment Criteria).
 * Displays a paginated list of evaluation indicators with rich search/filtering,
 * status toggling, and quick actions (view, edit, delete).
 *
 * @route GET /admin/criteria
 *
 * @features
 * - List all criteria with hierarchical relations
 * - Multi-criteria filter (Sub-category, Status, Answer type, Search query)
 * - Beautiful design with status indicators, weight badges, and icons
 * - Pagination control
 * - Delete confirmation modal
 *
 * @author JurnalMU Team
 */
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ClipboardList, Edit, Filter, Layers, MoreVertical, Paperclip, Plus, RefreshCw, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SubCategory {
    id: number;
    name: string;
    category_id: number;
    category_name: string;
    template_name: string;
}

interface Criterion {
    id: number;
    code: string;
    question: string;
    description?: string;
    weight: string | number;
    answer_type: 'boolean' | 'scale' | 'text';
    answer_type_label: string;
    requires_attachment: boolean;
    sort_order: number;
    is_active: boolean;
    sub_category?: {
        id: number;
        name: string;
        category?: {
            id: number;
            name: string;
            template?: {
                id: number;
                name: string;
            };
        };
    } | null;
}

interface Props {
    criteria: PaginatedData<Criterion>;
    subCategories: SubCategory[];
    filters: {
        sub_category_id?: string;
        category_id?: string;
        is_active?: string;
        answer_type?: string;
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kriteria Penilaian',
        href: '/admin/criteria',
    },
];

export default function CriteriaIndex({ criteria, subCategories, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [subCategoryId, setSubCategoryId] = useState(filters.sub_category_id || 'all');
    const [isActive, setIsActive] = useState(filters.is_active || 'all');
    const [answerType, setAnswerType] = useState(filters.answer_type || 'all');
    const [isLoading, setIsLoading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState<Criterion | null>(null);

    // Group sub-categories by template > category
    const groupedSubCategories = subCategories.reduce(
        (acc, sub) => {
            const groupKey = `${sub.template_name} › ${sub.category_name}`;
            if (!acc[groupKey]) {
                acc[groupKey] = [];
            }
            acc[groupKey].push(sub);
            return acc;
        },
        {} as Record<string, SubCategory[]>,
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        setIsLoading(true);
        router.get(
            route('admin.criteria.index'),
            {
                ...(search && { search }),
                ...(subCategoryId !== 'all' && { sub_category_id: subCategoryId }),
                ...(isActive !== 'all' && { is_active: isActive }),
                ...(answerType !== 'all' && { answer_type: answerType }),
            },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setSubCategoryId('all');
        setIsActive('all');
        setAnswerType('all');
        setIsLoading(true);
        router.get(
            route('admin.criteria.index'),
            {},
            {
                preserveState: false,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleDelete = (criterion: Criterion) => {
        setDeleteDialog(criterion);
    };

    const confirmDelete = () => {
        if (!deleteDialog) return;
        router.delete(route('admin.criteria.destroy', deleteDialog.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Kriteria Penilaian berhasil dihapus');
                setDeleteDialog(null);
            },
            onError: (err) => {
                toast.error(err.error || 'Gagal menghapus kriteria penilaian');
                setDeleteDialog(null);
            },
        });
    };

    // Helper to decode HTML entities for pagination labels
    const decodeHtml = (html: string) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kriteria Penilaian" />

            <div className="flex h-full flex-col space-y-6 p-4 md:p-6">
                {/* Title & Add Button */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <ClipboardList className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Kriteria Penilaian</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">Kelola parameter rubrik kriteria penilaian untuk evaluasi proposal jurnal</p>
                    </div>
                    <Button asChild className="gap-2 self-start shadow-md transition-all duration-300 hover:shadow-lg sm:self-auto">
                        <Link href={route('admin.criteria.create')}>
                            <Plus className="h-4 w-4" /> Tambah Kriteria
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="border border-border/50 bg-card/40 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <form onSubmit={handleSearch} className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <SlidersHorizontal className="mr-1 h-4 w-4 text-muted-foreground" />
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Filter Pencarian</span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                                {/* Search */}
                                <div className="relative lg:col-span-2">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Cari kode, pertanyaan, deskripsi..."
                                        className="bg-background/50 pl-8 transition-all duration-200 focus:bg-background"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Sub Category */}
                                <div>
                                    <Select value={subCategoryId} onValueChange={setSubCategoryId}>
                                        <SelectTrigger className="bg-background/50 transition-all duration-200 focus:bg-background">
                                            <SelectValue placeholder="Semua Sub-Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Sub-Kategori</SelectItem>
                                            {Object.entries(groupedSubCategories).map(([groupName, subs]) => (
                                                <SelectGroup key={groupName}>
                                                    <SelectLabel className="rounded-sm bg-accent/40 px-2 py-1.5 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                                        {groupName}
                                                    </SelectLabel>
                                                    {subs.map((sub) => (
                                                        <SelectItem key={sub.id} value={sub.id.toString()}>
                                                            {sub.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Status */}
                                <div>
                                    <Select value={isActive} onValueChange={setIsActive}>
                                        <SelectTrigger className="bg-background/50 transition-all duration-200 focus:bg-background">
                                            <SelectValue placeholder="Semua Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="active">Aktif</SelectItem>
                                            <SelectItem value="inactive">Nonaktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Answer Type */}
                                <div>
                                    <Select value={answerType} onValueChange={setAnswerType}>
                                        <SelectTrigger className="bg-background/50 transition-all duration-200 focus:bg-background">
                                            <SelectValue placeholder="Tipe Jawaban" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Tipe</SelectItem>
                                            <SelectItem value="boolean">Ya / Tidak</SelectItem>
                                            <SelectItem value="scale">Skala 1-5</SelectItem>
                                            <SelectItem value="text">Teks Bebas</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-col justify-end gap-2 border-t border-border/30 pt-2 sm:flex-row">
                                {(search || subCategoryId !== 'all' || isActive !== 'all' || answerType !== 'all') && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        disabled={isLoading}
                                        className="h-9 gap-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                        Reset Filter
                                    </Button>
                                )}
                                <Button type="submit" disabled={isLoading} size="sm" className="h-9 gap-1.5 px-4">
                                    <Filter className="h-3.5 w-3.5" />
                                    {isLoading ? 'Memuat...' : 'Terapkan Filter'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table list */}
                <div className="overflow-hidden rounded-lg border border-border/50 bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[100px] font-semibold text-foreground/80">Kode</TableHead>
                                <TableHead className="min-w-[280px] font-semibold text-foreground/80">Pertanyaan & Detail</TableHead>
                                <TableHead className="w-[180px] font-semibold text-foreground/80">Klasifikasi</TableHead>
                                <TableHead className="w-[110px] text-center font-semibold text-foreground/80">Bobot</TableHead>
                                <TableHead className="w-[140px] font-semibold text-foreground/80">Tipe Jawaban</TableHead>
                                <TableHead className="w-[130px] text-center font-semibold text-foreground/80">Dok. Lampiran</TableHead>
                                <TableHead className="w-[110px] text-center font-semibold text-foreground/80">Status</TableHead>
                                <TableHead className="w-[80px] text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {criteria.data.length > 0 ? (
                                criteria.data.map((item) => (
                                    <TableRow key={item.id} className="group transition-colors hover:bg-muted/20">
                                        {/* Code */}
                                        <TableCell className="pt-4 align-top font-semibold">
                                            <Badge
                                                variant="outline"
                                                className="border-primary/20 bg-background py-1 font-mono text-primary shadow-sm"
                                            >
                                                {item.code}
                                            </Badge>
                                        </TableCell>

                                        {/* Question & Description */}
                                        <TableCell className="pt-4 align-top">
                                            <div className="space-y-1">
                                                <p className="leading-relaxed font-medium text-foreground">{item.question}</p>
                                                {item.description && (
                                                    <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Classification */}
                                        <TableCell className="pt-4 align-top text-xs">
                                            {item.sub_category ? (
                                                <div className="space-y-1 text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Layers className="h-3 w-3 text-primary/60" />
                                                        <span
                                                            className="max-w-[150px] truncate font-medium text-foreground/75"
                                                            title={item.sub_category.name}
                                                        >
                                                            {item.sub_category.name}
                                                        </span>
                                                    </div>
                                                    {item.sub_category.category && (
                                                        <div className="pl-4 text-[10px] opacity-75">
                                                            {item.sub_category.category.template?.name} &bull; {item.sub_category.category.name}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground italic">Legacy (Flat)</span>
                                            )}
                                        </TableCell>

                                        {/* Weight */}
                                        <TableCell className="pt-4 text-center align-top font-bold">
                                            <Badge
                                                variant="secondary"
                                                className="border-purple-100 bg-purple-50 px-2.5 py-0.5 font-mono text-purple-700 hover:bg-purple-50"
                                            >
                                                {Number(item.weight).toFixed(2)}
                                            </Badge>
                                        </TableCell>

                                        {/* Answer Type */}
                                        <TableCell className="pt-4 align-top">
                                            {item.answer_type === 'boolean' && (
                                                <Badge
                                                    className="border-indigo-200 bg-indigo-50 text-indigo-700 shadow-sm hover:bg-indigo-50"
                                                    variant="outline"
                                                >
                                                    Ya / Tidak
                                                </Badge>
                                            )}
                                            {item.answer_type === 'scale' && (
                                                <Badge
                                                    className="border-purple-200 bg-purple-50 text-purple-700 shadow-sm hover:bg-purple-50"
                                                    variant="outline"
                                                >
                                                    Skala 1-5
                                                </Badge>
                                            )}
                                            {item.answer_type === 'text' && (
                                                <Badge
                                                    className="border-amber-200 bg-amber-50 text-amber-700 shadow-sm hover:bg-amber-50"
                                                    variant="outline"
                                                >
                                                    Teks Bebas
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Attachment */}
                                        <TableCell className="pt-4 text-center align-top">
                                            {item.requires_attachment ? (
                                                <div className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                                                    <Paperclip className="h-3 w-3" />
                                                    Wajib
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Tidak</span>
                                            )}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="pt-4 text-center align-top">
                                            {item.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="pt-3 text-right align-top">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-60 transition-opacity group-hover:opacity-100 hover:bg-muted/80"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[140px] border-border/50 shadow-md">
                                                    <DropdownMenuLabel className="text-[11px] text-muted-foreground">Opsi Aksi</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={route('admin.criteria.edit', item.id)}
                                                            className="flex cursor-pointer items-center gap-2"
                                                        >
                                                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex cursor-pointer items-center gap-2 text-destructive focus:bg-destructive/10"
                                                        onClick={() => handleDelete(item)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        Hapus
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-48 bg-muted/5 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-muted-foreground">
                                                <ClipboardList className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">Kriteria tidak ditemukan</p>
                                                <p className="text-xs text-muted-foreground">Coba ubah kueri pencarian atau buat kriteria baru</p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild className="mt-1">
                                                <Link href={route('admin.criteria.create')}>
                                                    <Plus className="mr-1 h-3.5 w-3.5" /> Tambah Kriteria
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {criteria.links && criteria.links.length > 3 && (
                    <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row">
                        <span className="text-xs text-muted-foreground">
                            Menampilkan <span className="font-semibold text-foreground">{criteria.from || 0}</span> sampai{' '}
                            <span className="font-semibold text-foreground">{criteria.to || 0}</span> dari{' '}
                            <span className="font-semibold text-foreground">{criteria.total || 0}</span> kriteria
                        </span>
                        <Pagination className="mx-0 w-auto">
                            <PaginationContent>
                                {criteria.links.map((link, i: number) => {
                                    if (!link.url && !link.label) return null;

                                    const label = decodeHtml(link.label);

                                    // Render custom buttons for Prev and Next to make layout cleaner
                                    const isPrev = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');

                                    let linkText = label;
                                    if (isPrev) linkText = 'Sebelumnya';
                                    if (isNext) linkText = 'Berikutnya';

                                    return (
                                        <PaginationItem key={`${link.label}-${i}`}>
                                            {link.url ? (
                                                <PaginationLink href={link.url} isActive={link.active} className="h-8 min-w-[32px] text-xs">
                                                    {linkText}
                                                </PaginationLink>
                                            ) : (
                                                <span className="px-3 py-1.5 text-xs text-muted-foreground/60 select-none">{linkText}</span>
                                            )}
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kriteria Penilaian</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kriteria penilaian <strong className="text-foreground">"{deleteDialog?.code}"</strong>?
                            <br />
                            <br />
                            Tindakan ini tidak dapat dibatalkan. Kriteria ini tidak akan dapat digunakan lagi di rubrik baru.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus Kriteria
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
