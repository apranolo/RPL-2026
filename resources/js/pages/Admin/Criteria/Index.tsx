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
import {
    ClipboardList,
    Edit,
    Filter,
    Layers,
    MoreVertical,
    Paperclip,
    Plus,
    RefreshCw,
    Search,
    SlidersHorizontal,
    Trash2,
} from 'lucide-react';
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
            }
        }
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
                        <p className="text-sm text-muted-foreground">
                            Kelola parameter rubrik kriteria penilaian untuk evaluasi proposal jurnal
                        </p>
                    </div>
                    <Button asChild className="gap-2 self-start sm:self-auto shadow-md hover:shadow-lg transition-all duration-300">
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
                                <SlidersHorizontal className="h-4 w-4 text-muted-foreground mr-1" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Filter Pencarian
                                </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                                {/* Search */}
                                <div className="relative lg:col-span-2">
                                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Cari kode, pertanyaan, deskripsi..."
                                        className="pl-8 bg-background/50 focus:bg-background transition-all duration-200"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Sub Category */}
                                <div>
                                    <Select value={subCategoryId} onValueChange={setSubCategoryId}>
                                        <SelectTrigger className="bg-background/50 focus:bg-background transition-all duration-200">
                                            <SelectValue placeholder="Semua Sub-Kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Sub-Kategori</SelectItem>
                                            {Object.entries(groupedSubCategories).map(([groupName, subs]) => (
                                                <SelectGroup key={groupName}>
                                                    <SelectLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-accent/40 px-2 py-1.5 rounded-sm">
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
                                        <SelectTrigger className="bg-background/50 focus:bg-background transition-all duration-200">
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
                                        <SelectTrigger className="bg-background/50 focus:bg-background transition-all duration-200">
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

                            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2 border-t border-border/30">
                                {(search || subCategoryId !== 'all' || isActive !== 'all' || answerType !== 'all') && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilters}
                                        disabled={isLoading}
                                        className="h-9 gap-1.5 hover:bg-accent text-muted-foreground hover:text-foreground"
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
                <div className="rounded-lg border border-border/50 bg-card overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[100px] font-semibold text-foreground/80">Kode</TableHead>
                                <TableHead className="min-w-[280px] font-semibold text-foreground/80">Pertanyaan & Detail</TableHead>
                                <TableHead className="w-[180px] font-semibold text-foreground/80">Klasifikasi</TableHead>
                                <TableHead className="w-[110px] font-semibold text-foreground/80 text-center">Bobot</TableHead>
                                <TableHead className="w-[140px] font-semibold text-foreground/80">Tipe Jawaban</TableHead>
                                <TableHead className="w-[130px] font-semibold text-foreground/80 text-center">Dok. Lampiran</TableHead>
                                <TableHead className="w-[110px] font-semibold text-foreground/80 text-center">Status</TableHead>
                                <TableHead className="w-[80px] text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {criteria.data.length > 0 ? (
                                criteria.data.map((item) => (
                                    <TableRow key={item.id} className="group hover:bg-muted/20 transition-colors">
                                        {/* Code */}
                                        <TableCell className="font-semibold align-top pt-4">
                                            <Badge variant="outline" className="font-mono bg-background shadow-sm py-1 border-primary/20 text-primary">
                                                {item.code}
                                            </Badge>
                                        </TableCell>

                                        {/* Question & Description */}
                                        <TableCell className="align-top pt-4">
                                            <div className="space-y-1">
                                                <p className="font-medium text-foreground leading-relaxed">
                                                    {item.question}
                                                </p>
                                                {item.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Classification */}
                                        <TableCell className="align-top pt-4 text-xs">
                                            {item.sub_category ? (
                                                <div className="space-y-1 text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Layers className="h-3 w-3 text-primary/60" />
                                                        <span className="font-medium text-foreground/75 truncate max-w-[150px]" title={item.sub_category.name}>
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
                                                <span className="text-muted-foreground italic text-[11px]">Legacy (Flat)</span>
                                            )}
                                        </TableCell>

                                        {/* Weight */}
                                        <TableCell className="align-top pt-4 text-center font-bold">
                                            <Badge variant="secondary" className="px-2.5 py-0.5 font-mono text-purple-700 bg-purple-50 border-purple-100 hover:bg-purple-50">
                                                {Number(item.weight).toFixed(2)}
                                            </Badge>
                                        </TableCell>

                                        {/* Answer Type */}
                                        <TableCell className="align-top pt-4">
                                            {item.answer_type === 'boolean' && (
                                                <Badge className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-50 shadow-sm" variant="outline">
                                                    Ya / Tidak
                                                </Badge>
                                            )}
                                            {item.answer_type === 'scale' && (
                                                <Badge className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-50 shadow-sm" variant="outline">
                                                    Skala 1-5
                                                </Badge>
                                            )}
                                            {item.answer_type === 'text' && (
                                                <Badge className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-50 shadow-sm" variant="outline">
                                                    Teks Bebas
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Attachment */}
                                        <TableCell className="align-top pt-4 text-center">
                                            {item.requires_attachment ? (
                                                <div className="inline-flex items-center gap-1 text-xs text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-medium">
                                                    <Paperclip className="h-3 w-3" />
                                                    Wajib
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Tidak</span>
                                            )}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell className="align-top pt-4 text-center">
                                            {item.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium px-2 py-0.5 bg-secondary border rounded-full">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="align-top pt-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/80 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[140px] shadow-md border-border/50">
                                                    <DropdownMenuLabel className="text-[11px] text-muted-foreground">Opsi Aksi</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('admin.criteria.edit', item.id)} className="flex items-center gap-2 cursor-pointer">
                                                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 text-destructive focus:bg-destructive/10 cursor-pointer"
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
                                    <TableCell colSpan={8} className="h-48 text-center bg-muted/5">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-muted-foreground">
                                                <ClipboardList className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground text-sm">Kriteria tidak ditemukan</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Coba ubah kueri pencarian atau buat kriteria baru
                                                </p>
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
                        <Pagination className="w-auto mx-0">
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
                                                <span className="px-3 py-1.5 text-xs text-muted-foreground/60 select-none">
                                                    {linkText}
                                                </span>
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
                            Apakah Anda yakin ingin menghapus kriteria penilaian{' '}
                            <strong className="text-foreground">"{deleteDialog?.code}"</strong>?
                            <br />
                            <br />
                            Tindakan ini tidak dapat dibatalkan. Kriteria ini tidak akan dapat digunakan lagi di rubrik baru.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                            Hapus Kriteria
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
