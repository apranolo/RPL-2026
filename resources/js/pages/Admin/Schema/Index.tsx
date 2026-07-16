/**
 * @file Index.tsx
 * @description Halaman utama untuk manajemen (CRUD) Skema Penelitian.
 * @author RAKA BONDAN PRASETYO
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Calendar, ClipboardList, Edit, Eye, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Skema Penelitian',
        href: '/admin/schema',
    },
];

interface Schema {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    schemas: Schema[];
    filters: {
        search: string;
    };
}

export default function SchemaIndex({ schemas, filters }: Props) {
    const { flash } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search || '');
    
    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedSchema, setSelectedSchema] = useState<Schema | null>(null);

    // Form for Create & Edit
    const createForm = useForm({
        name: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        description: '',
    });

    // Handle toast alerts from Inertia flash session
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // Handle searching
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.schema.index'),
            { search },
            { preserveState: true }
        );
    };

    // Open create dialog
    const handleOpenCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setIsCreateOpen(true);
    };

    // Submit new schema
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.schema.store'), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    // Open edit dialog
    const handleOpenEdit = (schema: Schema) => {
        setSelectedSchema(schema);
        editForm.setData({
            name: schema.name,
            description: schema.description || '',
        });
        editForm.clearErrors();
        setIsEditOpen(true);
    };

    // Submit updated schema
    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSchema) return;

        editForm.put(route('admin.schema.update', selectedSchema.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedSchema(null);
                editForm.reset();
            },
        });
    };

    // Open delete dialog
    const handleOpenDelete = (schema: Schema) => {
        setSelectedSchema(schema);
        setIsDeleteOpen(true);
    };

    // Confirm deletion
    const handleDeleteConfirm = () => {
        if (!selectedSchema) return;

        router.delete(route('admin.schema.destroy', selectedSchema.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
                setSelectedSchema(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Skema Penelitian" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Modern Premium Header */}
                <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/20 p-6 shadow-sm dark:border-sidebar-border dark:from-neutral-900/40 dark:via-neutral-950 dark:to-neutral-900/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                    <ClipboardList className="h-6 w-6" />
                                </div>
                                Skema Penelitian
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Kelola berbagai jenis dan kategori skema penelitian untuk pengajuan proposal dosen.
                            </p>
                        </div>
                        <Button 
                            onClick={handleOpenCreate} 
                            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400 font-semibold shadow-sm transition-all duration-300 hover:scale-[1.02] flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Skema
                        </Button>
                    </div>
                </div>

                {/* Filter and Content Area */}
                <div className="space-y-4">
                    {/* Search & Filters */}
                    <Card className="border-sidebar-border/60 bg-white/70 backdrop-blur-md dark:border-sidebar-border dark:bg-neutral-950/70">
                        <CardContent className="p-4">
                            <form onSubmit={handleSearchSubmit} className="flex gap-3">
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari berdasarkan nama skema atau deskripsi..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 h-10 border-sidebar-border bg-white dark:bg-neutral-900"
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="h-10 px-5 font-semibold">
                                    Cari
                                </Button>
                                {search && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => {
                                            setSearch('');
                                            router.get(route('admin.schema.index'));
                                        }}
                                        className="h-10 text-muted-foreground hover:text-foreground"
                                    >
                                        Bersihkan
                                    </Button>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    {/* Table View for larger screens / Card list for mobile */}
                    <div className="rounded-xl border border-sidebar-border/60 bg-white shadow-sm overflow-hidden dark:border-sidebar-border dark:bg-neutral-950">
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader className="bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <TableRow className="border-sidebar-border/60">
                                        <TableHead className="w-[80px] font-semibold text-center">No</TableHead>
                                        <TableHead className="font-semibold">Nama Skema</TableHead>
                                        <TableHead className="font-semibold">Deskripsi</TableHead>
                                        <TableHead className="w-[180px] font-semibold">Tanggal Dibuat</TableHead>
                                        <TableHead className="w-[120px] font-semibold text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schemas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                                Tidak ada skema penelitian yang ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        schemas.map((schema, index) => (
                                            <TableRow key={schema.id} className="border-sidebar-border/60 hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10">
                                                <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell className="font-bold text-foreground">{schema.name}</TableCell>
                                                <TableCell className="text-muted-foreground max-w-md truncate">
                                                    {schema.description || <em className="text-xs text-neutral-400">Tidak ada deskripsi</em>}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                                        {new Date(schema.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.get(route('admin.schema.show', schema.id))}
                                                            className="h-8 w-8 text-neutral-500 hover:text-blue-600 hover:bg-blue-500/10"
                                                            title="Detail"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenEdit(schema)}
                                                            className="h-8 w-8 text-neutral-500 hover:text-emerald-600 hover:bg-emerald-500/10"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleOpenDelete(schema)}
                                                            className="h-8 w-8 text-neutral-500 hover:text-destructive hover:bg-destructive/10"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="block md:hidden p-4 space-y-4 bg-neutral-50/30 dark:bg-transparent">
                            {schemas.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed p-6 dark:bg-neutral-900">
                                    Tidak ada skema penelitian yang ditemukan.
                                </div>
                            ) : (
                                schemas.map((schema) => (
                                    <div key={schema.id} className="bg-white rounded-xl border border-sidebar-border/60 p-4 shadow-sm space-y-3 dark:bg-neutral-900/40">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-foreground leading-snug">{schema.name}</h3>
                                            <div className="flex gap-1 shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => router.get(route('admin.schema.show', schema.id))}
                                                    className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600 text-neutral-500"
                                                    title="Detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleOpenEdit(schema)}
                                                    className="h-8 w-8 hover:bg-emerald-500/10 hover:text-emerald-600"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => handleOpenDelete(schema)}
                                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {schema.description || <em className="text-xs text-neutral-400">Tidak ada deskripsi</em>}
                                        </p>
                                        <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(schema.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <Badge variant="outline" className="text-[10px]">Skema</Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Tambah Skema Penelitian</DialogTitle>
                        <DialogDescription>
                            Isi detail informasi untuk membuat skema penelitian baru.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="create-name" className="text-sm font-semibold">
                                Nama Skema <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Penelitian Terapan Kompetitif"
                                className="h-10"
                                disabled={createForm.processing}
                            />
                            {createForm.errors.name && (
                                <p className="text-xs font-semibold text-destructive">{createForm.errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="create-description" className="text-sm font-semibold">Deskripsi</Label>
                            <Textarea
                                id="create-description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                placeholder="Tuliskan deskripsi singkat mengenai skema penelitian ini..."
                                className="min-h-[100px] resize-none"
                                disabled={createForm.processing}
                            />
                            {createForm.errors.description && (
                                <p className="text-xs font-semibold text-destructive">{createForm.errors.description}</p>
                            )}
                        </div>
                        <DialogFooter className="pt-4 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                disabled={createForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400"
                                disabled={createForm.processing}
                            >
                                {createForm.processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Edit Skema Penelitian</DialogTitle>
                        <DialogDescription>
                            Perbarui data skema penelitian yang sudah ada.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm font-semibold">
                                Nama Skema <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                placeholder="Masukkan nama skema..."
                                className="h-10"
                                disabled={editForm.processing}
                            />
                            {editForm.errors.name && (
                                <p className="text-xs font-semibold text-destructive">{editForm.errors.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description" className="text-sm font-semibold">Deskripsi</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                placeholder="Masukkan deskripsi skema..."
                                className="min-h-[100px] resize-none"
                                disabled={editForm.processing}
                            />
                            {editForm.errors.description && (
                                <p className="text-xs font-semibold text-destructive">{editForm.errors.description}</p>
                            )}
                        </div>
                        <DialogFooter className="pt-4 flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                                disabled={editForm.processing}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:text-neutral-950 dark:hover:bg-emerald-400"
                                disabled={editForm.processing}
                            >
                                {editForm.processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memperbarui...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete AlertDialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-bold text-destructive flex items-center gap-2">
                            Hapus Skema Penelitian?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
                            Apakah Anda yakin ingin menghapus skema penelitian <strong>{selectedSchema?.name}</strong>? 
                            Tindakan ini tidak dapat dibatalkan dan skema tidak dapat dihapus apabila sudah terhubung dengan proposal dosen aktif.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
