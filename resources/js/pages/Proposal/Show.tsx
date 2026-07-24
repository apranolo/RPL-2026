/**
 * Proposal/Show — Dosen & Super Admin
 *
 * @description
 * Halaman detail proposal penelitian.
 *
 * @features
 * - Informasi lengkap proposal (Judul, Skema, Status, Deskripsi, Tanggal)
 * - Alasan penolakan (jika status Ditolak)
 * - Berkas utama & daftar dokumen pendukung beserta tombol unduh
 *
 * @route GET /proposal/{proposal}
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Download, Edit, FileText } from 'lucide-react';
import { route } from 'ziggy-js';

interface DocumentItem {
    id: number;
    file_name: string;
    file_path: string;
    document_type?: string;
    file_size?: number;
    created_at?: string;
}

interface ProposalDetail {
    id: number;
    title: string;
    description: string;
    status_proposal: string;
    rejection_reason?: string | null;
    file_dokumen_proposal?: string | null;
    created_at?: string;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
    research_schema?: {
        id: number;
        name: string;
        description?: string;
    } | null;
    documents?: DocumentItem[];
}

interface ShowProps {
    proposal: ProposalDetail;
}

export default function Show({ proposal }: ShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Proposal Penelitian', href: route('proposal.index') },
        { title: 'Detail Proposal', href: '#' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Administrasi_Valid':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Valid Administrasi</Badge>;
            case 'Submitted':
                return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Submitted</Badge>;
            case 'Ditolak':
                return <Badge variant="destructive">Ditolak</Badge>;
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Proposal - ${proposal.title}`} />

            <div className="container mx-auto max-w-4xl p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <Link href={route('proposal.index')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Detail Proposal Penelitian</h1>
                            <p className="text-sm text-muted-foreground">
                                Informasi lengkap pengajuan proposal penelitian.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={route('proposal.edit', proposal.id)}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Proposal
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Status Penolakan Alert jika Ditolak */}
                {proposal.status_proposal === 'Ditolak' && proposal.rejection_reason && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive space-y-1">
                        <div className="flex items-center space-x-2 font-semibold">
                            <AlertCircle className="h-5 w-5" />
                            <span>Proposal Ditolak pada Tahap Administrasi</span>
                        </div>
                        <p className="text-sm text-destructive/90 pl-7">
                            <strong>Alasan Penolakan:</strong> {proposal.rejection_reason}
                        </p>
                    </div>
                )}

                {/* Informasi Utama Proposal */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-xl leading-relaxed">{proposal.title}</CardTitle>
                                <CardDescription className="mt-1">
                                    Skema: <strong className="text-foreground">{proposal.research_schema?.name || 'Belum Ditentukan'}</strong>
                                </CardDescription>
                            </div>
                            <div>{getStatusBadge(proposal.status_proposal)}</div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Ringkasan / Deskripsi Proposal
                            </h3>
                            <p className="whitespace-pre-line text-sm leading-relaxed text-foreground bg-muted/30 p-4 rounded-md">
                                {proposal.description}
                            </p>
                        </div>

                        {/* File Dokumen Utama */}
                        {proposal.file_dokumen_proposal && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Berkas Utama Proposal
                                </h3>
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium">Dokumen Utama Proposal</span>
                                    </div>
                                    <a
                                        href={`/storage/${proposal.file_dokumen_proposal}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download
                                    >
                                        <Button size="sm" variant="secondary">
                                            <Download className="mr-2 h-4 w-4" />
                                            Unduh Berkas
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Dokumen Pendukung */}
                        {proposal.documents && proposal.documents.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Dokumen Pendukung
                                </h3>
                                <div className="space-y-2">
                                    {proposal.documents.map((doc) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                            <div className="flex items-center space-x-3">
                                                <FileText className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">{doc.file_name}</p>
                                                    {doc.document_type && (
                                                        <p className="text-xs text-muted-foreground">{doc.document_type}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <a href={route('proposal.documents.download', doc.id)}>
                                                <Button size="sm" variant="ghost">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Unduh
                                                </Button>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
