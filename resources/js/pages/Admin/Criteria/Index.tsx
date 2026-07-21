/**
 * CriteriaIndex Component
 *
 * @description
 * Page for listing, searching, filtering, and deleting Kriteria Penilaian (Assessment Criteria).
 * Super Admin can view all criteria, filter by subcategory, status, and answer type, and manage items.
 *
 * @route GET /admin/criteria
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ClipboardList, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    weight: number;
    answer_type: 'boolean' | 'scale' | 'text';
    answer_type_label: string;
    requires_attachment: boolean;
    sort_order?: number;
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
    criteria: {
        data: Criterion[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    subCategories: SubCategory[];
    filters: {
        search?: string;
        sub_category_id?: string;
        category_id?: string;
        is_active?: string;
        answer_type?: string;
    };
}

export default function CriteriaIndex({ criteria, subCategories, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [subCategoryId, setSubCategoryId] = useState(filters.sub_category_id || '');
    const [isActive, setIsActive] = useState(filters.is_active || '');
    const [answerType, setAnswerType] = useState(filters.answer_type || '');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; criterionId?: number; criterionCode?: string }>({ open: false });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.criteria.index'),
            {
                search,
                sub_category_id: subCategoryId === 'all' ? '' : subCategoryId,
                is_active: isActive === 'all' ? '' : isActive,
                answer_type: answerType === 'all' ? '' : answerType,
            },
            { preserveState: true },
        );
    };

    const openDeleteDialog = (id: number, code: string) => {
        setDeleteDialog({ open: true, criterionId: id, criterionCode: code });
    };

    const confirmDelete = () => {
        if (deleteDialog.criterionId) {
            router.delete(route('admin.criteria.destroy', deleteDialog.criterionId), {
                onSuccess: () => {
                    setDeleteDialog({ open: false });
                },
                onError: () => {
                    toast.error('Gagal menghapus kriteria');
                },
            });
        }
    };

    // Group sub-categories for filter dropdown
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kriteria Penilaian" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative overflow-hidden rounded-xl border border-sidebar-border/70 bg-white p-6 dark:border-sidebar-border dark:bg-neutral-950">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
                                    <ClipboardList className="h-8 w-8 text-primary" />
                                    Kriteria Penilaian
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Kelola kriteria penilaian (indikator evaluasi) untuk instrumen akreditasi dan pemantauan
                                </p>
                            </div>
                            <Link href={route('admin.criteria.create')}>
                                <Button className="flex w-full items-center gap-2 md:w-auto">
                                    <Plus className="h-4 w-4" />
                                    Tambah Kriteria (Batch)
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="mb-6 rounded-lg border border-sidebar-border/70 bg-card p-4 shadow-sm dark:border-sidebar-border">
                        <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari kode, pertanyaan, atau deskripsi..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <Select value={subCategoryId} onValueChange={(val) => setSubCategoryId(val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Sub-Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Sub-Kategori</SelectItem>
                                        {Object.entries(groupedSubCategories).map(([groupName, subs]) => (
                                            <SelectGroup key={groupName}>
                                                <SelectLabel className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
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

                            <div className="flex gap-2">
                                <Select value={isActive} onValueChange={(val) => setIsActive(val)}>
                                    <SelectTrigger className="flex-1">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Non-Aktif</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={answerType} onValueChange={(val) => setAnswerType(val)}>
                                    <SelectTrigger className="flex-1">
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

                            <div className="flex justify-end gap-2 md:col-span-4">
                                <Button type="submit" className="px-6">
                                    Cari
                                </Button>
                                {(search || subCategoryId || isActive || answerType) && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setSearch('');
                                            setSubCategoryId('');
                                            setIsActive('');
                                            setAnswerType('');
                                            router.get(route('admin.criteria.index'));
                                        }}
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Table View */}
                    <div className="overflow-hidden rounded-lg border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Kode</TableHead>
                                    <TableHead className="w-[70px] text-center">Urutan</TableHead>
                                    <TableHead className="min-w-[200px]">Pertanyaan</TableHead>
                                    <TableHead>Sub-Kategori</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead className="text-center">Bobot</TableHead>
                                    <TableHead className="text-center">Lampiran</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {criteria.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                                            Tidak ada data kriteria penilaian ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    criteria.data.map((criterion) => {
                                        const subCat = criterion.sub_category;
                                        const pathText = subCat
                                            ? `${subCat.category?.template?.name || ''} › ${subCat.category?.name || ''} › ${subCat.name}`
                                            : '-';

                                        return (
                                            <TableRow key={criterion.id}>
                                                <TableCell className="font-bold text-foreground">{criterion.code}</TableCell>
                                                <TableCell className="text-center font-mono text-sm">{criterion.sort_order ?? '-'}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="line-clamp-2 font-medium text-foreground" title={criterion.question}>
                                                            {criterion.question}
                                                        </div>
                                                        {criterion.description && (
                                                            <div
                                                                className="mt-0.5 line-clamp-1 text-xs text-muted-foreground"
                                                                title={criterion.description}
                                                            >
                                                                {criterion.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <div className="truncate text-xs text-muted-foreground" title={pathText}>
                                                        {pathText}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-xs capitalize">
                                                        {criterion.answer_type_label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center font-mono font-medium">
                                                    {Number(criterion.weight).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {criterion.requires_attachment ? (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-amber-500/20 bg-amber-500/10 text-xs text-amber-600"
                                                        >
                                                            Wajib
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs text-muted-foreground">
                                                            Tidak
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {criterion.is_active ? (
                                                        <Badge className="border border-green-500/20 bg-green-500/10 text-xs text-green-600 hover:bg-green-500/20">
                                                            Aktif
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Non-Aktif
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={route('admin.criteria.show', criterion.id)}>
                                                            <Button variant="ghost" size="icon" title="Lihat Detail">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('admin.criteria.edit', criterion.id)}>
                                                            <Button variant="ghost" size="icon" title="Ubah">
                                                                <Edit className="h-4 w-4 text-amber-500" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => openDeleteDialog(criterion.id, criterion.code)}
                                                            title="Hapus"
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {criteria.last_page > 1 && (
                        <div className="mt-6 border-t border-sidebar-border/70 pt-4 dark:border-sidebar-border">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div className="text-center text-sm text-muted-foreground md:text-left">
                                    Menampilkan {(criteria.current_page - 1) * criteria.per_page + 1} sampai{' '}
                                    {Math.min(criteria.current_page * criteria.per_page, criteria.total)} dari {criteria.total} hasil
                                </div>
                                <div className="flex items-center gap-2">
                                    {criteria.links.map((link, index) => {
                                        if (link.url === null) return null;

                                        const isFirst = index === 0;
                                        const isLast = index === criteria.links.length - 1;

                                        return (
                                            <Link key={index} href={link.url} preserveState preserveScroll>
                                                <Button
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    className={link.active ? '' : 'text-muted-foreground'}
                                                >
                                                    {isFirst ? (
                                                        <ChevronLeft className="h-4 w-4" />
                                                    ) : isLast ? (
                                                        <ChevronRight className="h-4 w-4" />
                                                    ) : (
                                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </Button>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Alert */}
            <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kriteria Penilaian</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus kriteria penilaian <strong>{deleteDialog.criterionCode}</strong>? Tindakan ini tidak
                            dapat dibatalkan dan kriteria tidak dapat dihapus jika telah digunakan dalam respons penilaian yang telah dikirimkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
