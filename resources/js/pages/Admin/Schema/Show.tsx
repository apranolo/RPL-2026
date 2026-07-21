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
import { ArrowLeft, Building, Calendar, ClipboardList, FileText, Layers, Mail, User } from 'lucide-react';

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
                                className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Kembali ke Daftar Skema
                            </Link>
                            <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                    <Layers className="h-6 w-6" />
                                </div>
                                Detail Skema Penelitian
                            </h1>
                        </div>
                        <Button asChild variant="outline" className="h-10 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-900">
                            <Link href={route('admin.schema.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Main Schema Information Section */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-sidebar-border/60 bg-white/70 backdrop-blur-md md:col-span-2 dark:border-sidebar-border dark:bg-neutral-950/70">
                        <CardHeader className="border-b border-sidebar-border/60">
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <ClipboardList className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Informasi Skema
                            </CardTitle>
                            <CardDescription>Detail deskripsi dan spesifikasi skema penelitian.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Nama Skema</h3>
                                <p className="text-lg font-bold text-foreground">{schema.name}</p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Deskripsi Skema</h3>
                                <div className="rounded-lg border bg-neutral-50/50 p-4 leading-relaxed whitespace-pre-wrap text-foreground dark:bg-neutral-900/30">
                                    {schema.description || (
                                        <em className="text-xs text-neutral-400">Tidak ada deskripsi yang ditambahkan untuk skema ini.</em>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-sidebar-border/60 bg-white/70 backdrop-blur-md dark:border-sidebar-border dark:bg-neutral-950/70">
                        <CardHeader className="border-b border-sidebar-border/60">
                            <CardTitle className="flex items-center gap-2 text-xl font-bold">
                                <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Statistik Skema
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6">
                            <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400">
                                <div className="text-4xl font-extrabold">{proposalsCount}</div>
                                <div>
                                    <p className="leading-tight font-bold">Total Proposal</p>
                                    <p className="text-xs opacity-80">Terhubung dengan skema ini</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
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
                                <div className="flex items-center justify-between border-t border-sidebar-border/30 pt-3 text-sm">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
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
                        <CardTitle className="flex items-center gap-2 text-xl font-bold">
                            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            Daftar Proposal Dosen
                        </CardTitle>
                        <CardDescription>Daftar seluruh proposal penelitian yang diajukan oleh dosen menggunakan skema ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader className="bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <TableRow className="border-sidebar-border/60">
                                        <TableHead className="w-[80px] text-center font-semibold">No</TableHead>
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
                                            <TableRow
                                                key={proposal.id}
                                                className="border-sidebar-border/60 hover:bg-neutral-50/40 dark:hover:bg-neutral-900/10"
                                            >
                                                <TableCell className="text-center font-medium text-muted-foreground">{index + 1}</TableCell>
                                                <TableCell className="max-w-sm font-bold text-foreground">
                                                    <div className="space-y-1">
                                                        <p className="line-clamp-2 leading-tight" title={proposal.title}>
                                                            {proposal.title}
                                                        </p>
                                                        <p
                                                            className="line-clamp-1 text-xs font-normal text-muted-foreground"
                                                            title={proposal.description}
                                                        >
                                                            {proposal.description}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-1 font-semibold text-foreground">
                                                            <User className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                                            {proposal.user?.name}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Mail className="h-3 w-3 shrink-0 text-neutral-400" />
                                                            {proposal.user?.email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div className="space-y-1 text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Building className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                                            {proposal.user?.university?.name || (
                                                                <em className="text-xs font-normal text-neutral-400">Tidak terafiliasi</em>
                                                            )}
                                                        </div>
                                                        {proposal.user?.position && (
                                                            <div className="w-fit rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
                                                                {proposal.user.position}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
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
                        <div className="block space-y-4 p-4 md:hidden">
                            {proposalsCount === 0 ? (
                                <div className="rounded-lg border border-dashed bg-white p-6 py-12 text-center text-muted-foreground dark:bg-neutral-900">
                                    Belum ada proposal dosen yang terdaftar untuk skema penelitian ini.
                                </div>
                            ) : (
                                schema.proposals.map((proposal) => (
                                    <div
                                        key={proposal.id}
                                        className="space-y-3 rounded-xl border border-sidebar-border/60 bg-white p-4 shadow-sm dark:bg-neutral-900/40"
                                    >
                                        <div className="space-y-1">
                                            <Badge
                                                variant="secondary"
                                                className="border-none bg-emerald-500/10 text-[10px] text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                            >
                                                Proposal
                                            </Badge>
                                            <h3 className="leading-snug font-bold text-foreground">{proposal.title}</h3>
                                            <p className="line-clamp-2 text-xs text-muted-foreground">{proposal.description}</p>
                                        </div>

                                        <div className="space-y-2 border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
                                            <div className="flex items-center gap-1.5 font-semibold text-foreground">
                                                <User className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                                <span>{proposal.user?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Building className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                                <span>
                                                    {proposal.user?.university?.name || <em className="text-neutral-400">Tidak terafiliasi</em>}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-1 text-[11px] text-neutral-400">
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
