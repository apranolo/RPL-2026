/**
 * @file Show.tsx
 * @description Halaman detail untuk melihat informasi Skema Penelitian beserta daftar proposal yang terkait.
 * @author RAKA BONDAN PRASETYO
 */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Building, Calendar, ClipboardList, FileText, Layers, Mail, User } from 'lucide-react';

interface University {
    id: number;
    name: string;
    short_name: string | null;
}

interface ProposingUser {
    id: number;
    name: string;
    email: string;
    position: string | null;
    university: University | null;
}

interface Proposal {
    id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    user: ProposingUser;
}

interface Schema {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    proposals: Proposal[];
}

interface Props {
    schema: Schema;
}

export default function SchemaShow({ schema }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Skema Penelitian',
            href: '/admin/schema',
        },
        {
            title: schema.name,
            href: `/admin/schema/${schema.id}`,
        },
    ];

    const proposalsCount = schema.proposals ? schema.proposals.length : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Skema: ${schema.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Header Area */}
                <div className="relative overflow-hidden rounded-2xl border border-sidebar-border/60 bg-gradient-to-r from-emerald-50/40 via-white to-teal-50/20 p-6 shadow-sm dark:border-sidebar-border dark:from-neutral-900/40 dark:via-neutral-950 dark:to-neutral-900/20">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            <Link
                                href={route('admin.schema.index')}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors mb-2"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Kembali ke Daftar Skema
                            </Link>
                            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                    <Layers className="h-6 w-6" />
                                </div>
                                Detail Skema Penelitian
                            </h1>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 hover:bg-neutral-50 dark:hover:bg-neutral-900 font-semibold"
                        >
                            <Link href={route('admin.schema.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Schema Information Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2 border-sidebar-border/60 bg-white/70 backdrop-blur-md dark:border-sidebar-border dark:bg-neutral-950/70">
                        <CardHeader className="border-b border-sidebar-border/60">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Informasi Skema
                            </CardTitle>
                            <CardDescription>Detail deskripsi dan spesifikasi skema penelitian.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nama Skema</h3>
                                <p className="text-lg font-bold text-foreground">{schema.name}</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Deskripsi Skema</h3>
                                <div className="text-foreground leading-relaxed whitespace-pre-wrap rounded-lg bg-neutral-50/50 p-4 border dark:bg-neutral-900/30">
                                    {schema.description || <em className="text-xs text-neutral-400">Tidak ada deskripsi yang ditambahkan untuk skema ini.</em>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/60 bg-white/70 backdrop-blur-md dark:border-sidebar-border dark:bg-neutral-950/70">
                        <CardHeader className="border-b border-sidebar-border/60">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Statistik Skema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                <div className="text-4xl font-extrabold">{proposalsCount}</div>
                                <div>
                                    <p className="font-bold leading-tight">Total Proposal</p>
                                    <p className="text-xs opacity-80">Terhubung dengan skema ini</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-neutral-400" />
                                        Dibuat Pada:
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {new Date(schema.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t border-sidebar-border/30 pt-3">
                                    <span className="text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-neutral-400" />
                                        Terakhir Diperbarui:
                                    </span>
                                    <span className="font-semibold text-foreground">
                                        {new Date(schema.updated_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Proposals List Section */}
                <Card className="border-sidebar-border/60 bg-white/70 backdrop-blur-md dark:border-sidebar-border dark:bg-neutral-950/70">
                    <CardHeader className="border-b border-sidebar-border/60">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            Daftar Proposal Dosen
                        </CardTitle>
                        <CardDescription>
                            Daftar seluruh proposal penelitian yang diajukan oleh dosen menggunakan skema ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader className="bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <TableRow className="border-sidebar-border/60">
                                        <TableHead className="w-[80px] font-semibold text-center">No</TableHead>
                                        <TableHead className="font-semibold">Judul Proposal</TableHead>
                                        <TableHead className="font-semibold">Dosen Pengusul</TableHead>
                                        <TableHead className="font-semibold">Perguruan Tinggi / Jabatan</TableHead>
                                        <TableHead className="w-[180px] font-semibold">Tanggal Pengajuan</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {proposalsCount === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                                Belum ada proposal dosen yang terdaftar untuk skema penelitian ini.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        schema.proposals.map((proposal, index) => (
                                            <TableRow key={proposal.id} className="border-sidebar-border/60 hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10">
                                                <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell className="font-bold text-foreground max-w-sm">
                                                    <div className="space-y-1">
                                                        <p className="line-clamp-2 leading-tight" title={proposal.title}>{proposal.title}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-1 font-normal" title={proposal.description}>
                                                            {proposal.description}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-semibold flex items-center gap-1 text-foreground">
                                                            <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                            {proposal.user?.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Mail className="h-3 w-3 text-neutral-400 shrink-0" />
                                                            {proposal.user?.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="space-y-1 text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Building className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                            {proposal.user?.university?.name || <em className="text-xs text-neutral-400 font-normal">Tidak terafiliasi</em>}
                                                        </div>
                                                        {proposal.user?.position && (
                                                            <div className="text-xs bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded w-fit">
                                                                {proposal.user.position}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                                        {new Date(proposal.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="block md:hidden p-4 space-y-4">
                            {proposalsCount === 0 ? (
                                <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed p-6 dark:bg-neutral-900">
                                    Belum ada proposal dosen yang terdaftar untuk skema penelitian ini.
                                </div>
                            ) : (
                                schema.proposals.map((proposal) => (
                                    <div
                                        key={proposal.id}
                                        className="bg-white rounded-xl border border-sidebar-border/60 p-4 shadow-sm space-y-3 dark:bg-neutral-900/40"
                                    >
                                        <div className="space-y-1">
                                            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-none">
                                                Proposal
                                            </Badge>
                                            <h3 className="font-bold text-foreground leading-snug">{proposal.title}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{proposal.description}</p>
                                        </div>

                                        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2 text-xs">
                                            <div className="flex items-center gap-1.5 text-foreground font-semibold">
                                                <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                <span>{proposal.user?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Building className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                                                <span>{proposal.user?.university?.name || <em className="text-neutral-400">Tidak terafiliasi</em>}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-neutral-400 pt-1 text-[11px]">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(proposal.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
