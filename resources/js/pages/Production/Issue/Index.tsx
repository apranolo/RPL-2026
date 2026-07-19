import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    BookOpen, 
    Calendar, 
    Layers, 
    Eye, 
    ArrowLeft, 
    FileText, 
    CheckCircle2, 
    AlertCircle 
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { type BreadcrumbItem } from '@/types';

interface Journal {
    id: number;
    title: string;
}

interface Issue {
    id: number;
    title: string;
    volume: number;
    number: number;
    year: number;
    publication_date: string | null;
    status: 'Draft' | 'Published';
    galleys_count?: number;
}

interface Props {
    journal: Journal;
    issues: Issue[];
    filters: {
        status?: string;
    };
}

export default function IssuesIndex({ journal, issues, filters }: Props) {
    const [activeTab, setActiveTab] = useState<string>(filters.status || 'Draft');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Journals', href: route('user.journals.index') },
        { title: 'Issues', href: route('user.production.issue.index', journal.id) },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        router.get(
            route('user.production.issue.index', journal.id),
            { status: value },
            { preserveState: true, replace: true }
        );
    };

    // Filter issues client-side as well to ensure correctness even if all issues are loaded
    const filteredIssues = issues.filter((issue) => issue.status === activeTab);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Issues - ${journal.title}`} />

            <div className="space-y-6 p-6 mx-auto max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <Link 
                            href={route('user.journals.index')} 
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Kembali ke Daftar Jurnal
                        </Link>
                        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-primary" />
                            {journal.title}
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-2xl">
                            Kelola penerbitan issue, review daftar isi, galley artikel, dan checklist final sebelum publish.
                        </p>
                    </div>
                </div>

                {/* Tabs for Future Issues vs Back Issues */}
                <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-1">
                        <TabsList className="bg-transparent border-b rounded-none p-0 h-auto gap-6">
                            <TabsTrigger 
                                value="Draft" 
                                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-1 pb-3 pt-2 font-semibold text-sm gap-2"
                            >
                                <Layers className="h-4 w-4" />
                                Future Issues (Draft)
                            </TabsTrigger>
                            <TabsTrigger 
                                value="Published" 
                                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-1 pb-3 pt-2 font-semibold text-sm gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                Back Issues (Published)
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Future Issues Content */}
                    <TabsContent value="Draft" className="mt-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Future Issues</CardTitle>
                                <CardDescription>Daftar issue draft yang sedang dipersiapkan untuk diterbitkan.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {filteredIssues.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                                        <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                                        <h3 className="font-semibold text-lg">Belum ada issue draft</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm mt-1">
                                            Tidak ada issue draft yang sedang aktif untuk jurnal ini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Volume</TableHead>
                                                    <TableHead className="w-[100px]">Issue/No</TableHead>
                                                    <TableHead className="w-[100px]">Tahun</TableHead>
                                                    <TableHead>Judul Tematik</TableHead>
                                                    <TableHead className="text-center w-[120px]">Artikel</TableHead>
                                                    <TableHead className="text-center w-[120px]">Status</TableHead>
                                                    <TableHead className="text-right w-[180px]">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredIssues.map((issue) => (
                                                    <TableRow key={issue.id}>
                                                        <TableCell className="font-medium">Vol. {issue.volume}</TableCell>
                                                        <TableCell>No. {issue.number}</TableCell>
                                                        <TableCell>{issue.year}</TableCell>
                                                        <TableCell className="max-w-[300px] truncate">{issue.title || '-'}</TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary" className="gap-1">
                                                                <FileText className="h-3 w-3" />
                                                                {issue.galleys_count ?? 0}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="outline" className="border-yellow-500/30 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400">
                                                                Draft
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Link
                                                                href={route('user.production.issue.preview', {
                                                                    journal: journal.id,
                                                                    volume: issue.volume,
                                                                    issue: issue.number
                                                                })}
                                                            >
                                                                <Button variant="outline" size="sm" className="gap-1.5">
                                                                    <Eye className="h-4 w-4" />
                                                                    Preview & Publish
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Back Issues Content */}
                    <TabsContent value="Published" className="mt-4 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl">Back Issues</CardTitle>
                                <CardDescription>Arsip issue yang telah berhasil dipublikasikan.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {filteredIssues.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                                        <CheckCircle2 className="h-10 w-10 text-muted-foreground mb-3" />
                                        <h3 className="font-semibold text-lg">Belum ada issue yang dipublish</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm mt-1">
                                            Issue yang dipublikasikan akan muncul sebagai arsip Back Issues di sini.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[100px]">Volume</TableHead>
                                                    <TableHead className="w-[100px]">Issue/No</TableHead>
                                                    <TableHead className="w-[100px]">Tahun</TableHead>
                                                    <TableHead>Judul Tematik</TableHead>
                                                    <TableHead className="text-center w-[150px]">Tanggal Terbit</TableHead>
                                                    <TableHead className="text-center w-[120px]">Artikel</TableHead>
                                                    <TableHead className="text-right w-[150px]">Aksi</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredIssues.map((issue) => (
                                                    <TableRow key={issue.id}>
                                                        <TableCell className="font-medium">Vol. {issue.volume}</TableCell>
                                                        <TableCell>No. {issue.number}</TableCell>
                                                        <TableCell>{issue.year}</TableCell>
                                                        <TableCell className="max-w-[300px] truncate">{issue.title || '-'}</TableCell>
                                                        <TableCell className="text-center">
                                                            {issue.publication_date ? new Date(issue.publication_date).toLocaleDateString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }) : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary" className="gap-1">
                                                                <FileText className="h-3 w-3" />
                                                                {issue.galleys_count ?? 0}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Link
                                                                href={route('user.production.issue.preview', {
                                                                    journal: journal.id,
                                                                    volume: issue.volume,
                                                                    issue: issue.number
                                                                })}
                                                            >
                                                                <Button variant="outline" size="sm" className="gap-1.5">
                                                                    <Eye className="h-4 w-4" />
                                                                    Lihat Preview
                                                                </Button>
                                                            </Link>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
